import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3tiV98fFdm8rYUTaPT7Ey3IfrPwc4Mh-x1u9gV0vc0h3QClvYkqhI_OxEG-e0L5VPSeKVZX0wnfey/pub?output=csv';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Find unsettled picks
    const { data: logs, error: fetchError } = await supabase
      .from('nifty_logs')
      .select('*')
      .is('stock_return', null);

    if (fetchError) throw fetchError;
    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({ message: "No pending picks." }), { headers: { "Content-Type": "application/json" } });
    }

    // 2. Get Live Market Data
    const stockData = await fetchStockData();

    // 3. Process each pick & Archive price
    for (const log of logs) {
      const symbol = log.stock_symbol;
      const returnVal = stockData[symbol] || 0;
      const earnings = Math.round(returnVal * 10);
      const dateStr = log.date;

      // Update the user's game log
      await supabase
        .from('nifty_logs')
        .update({ stock_return: returnVal, earnings: earnings })
        .eq('id', log.id);

      // Archive the price for this specific date in history
      // 'upsert' means "Insert it, but if it already exists, just update it"
      await supabase
        .from('stock_history')
        .upsert({ date: dateStr, symbol: symbol, close_percentage: returnVal }, { onConflict: 'date,symbol' });
    }

    return new Response(JSON.stringify({ message: `Settled and archived ${logs.length} entries.` }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});