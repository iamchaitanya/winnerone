import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const HOLIDAY_API_URL = 'https://api.upstox.com/v2/market/holidays';
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3tiV98fFdm8rYUTaPT7Ey3IfrPwc4Mh-x1u9gV0vc0h3QClvYkqhI_OxEG-e0L5VPSeKVZX0wnfey/pub?output=csv';

async function isHolidayToday(): Promise<boolean> {
  // 1. Get Today's Date in IST (Indian Standard Time)
  const now = new Date();
  const istDate = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(now); // Result: "YYYY-MM-DD"

  const dayOfWeek = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"})).getDay();

  // 2. Weekend Check (0 = Sunday, 6 = Saturday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log(`Skipping: ${istDate} is a weekend.`);
    return true;
  }

  // 3. Dynamic API Check (Same link your app uses)
  try {
    const response = await fetch(HOLIDAY_API_URL, {
      headers: { 'Accept': 'application/json' }
    });
    const json = await response.json();
    
    if (json && Array.isArray(json.data)) {
      const holidays = json.data.map((h: any) => h.date);
      if (holidays.includes(istDate)) {
        console.log(`Skipping: ${istDate} is a listed market holiday.`);
        return true;
      }
    }
  } catch (error) {
    console.error("Holiday API check failed, proceeding anyway...", error);
  }

  return false;
}

async function fetchStockData() {
  const response = await fetch(CSV_URL);
  if (!response.ok) throw new Error('Failed to fetch CSV');
  const csvText = await response.text();
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const results: Record<string, number> = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length >= 3) {
      const symbol = cols[0].trim();
      const changesPercentage = parseFloat(cols[2].trim());
      if (symbol && !isNaN(changesPercentage)) {
        results[symbol] = changesPercentage;
      }
    }
  }
  return results;
}

Deno.serve(async (req) => {
  try {
    // NEW: Check if we should even run today
    const shouldSkip = await isHolidayToday();
    if (shouldSkip) {
      return new Response(JSON.stringify({ message: "Market closed. No settlement today." }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: logs, error: fetchError } = await supabase
      .from('nifty_logs')
      .select('*')
      .is('stock_return', null);

    if (fetchError) throw fetchError;
    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({ message: "No pending picks." }), { headers: { "Content-Type": "application/json" } });
    }

    const stockData = await fetchStockData();

    for (const log of logs) {
      const symbol = log.stock_symbol;
      const returnVal = stockData[symbol] || 0;
      // Replace line 95: const earnings = Math.round(returnVal * 10);
// With this to preserve 2 decimal places:
const earnings = parseFloat((returnVal * 10).toFixed(2));
      const dateStr = log.date;

      await supabase
        .from('nifty_logs')
        .update({ stock_return: returnVal, earnings: earnings })
        .eq('id', log.id);

      await supabase
        .from('stock_history')
        .upsert({ date: dateStr, symbol: symbol, close_percentage: returnVal }, { onConflict: 'date,symbol' });
    }

    return new Response(JSON.stringify({ message: `Settled ${logs.length} entries.` }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});