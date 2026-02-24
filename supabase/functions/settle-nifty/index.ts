// supabase/functions/settle-nifty/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { isHolidayToday } from './holidayChecker.ts'
import { fetchStockData } from './stockDataFetcher.ts'

/**
 * Helper to settle Sensex Predictions
 * Awarding ₹10 for correct predictions
 */
async function settleSensex(supabase: any, stockData: Record<string, number>) {
  console.log("Starting Sensex settlement...");
  
  const sensexReturn = stockData['SENSEX'] || 0;
  const actualDirection = sensexReturn >= 0 ? 'UP' : 'DOWN';
  
  console.log(`Sensex today: ${sensexReturn}% (Direction: ${actualDirection})`);

  const { data: logs, error: fetchError } = await supabase
    .from('sensex_logs')
    .select('*')
    .eq('is_settled', false);

  if (fetchError) {
    console.error("Error fetching unsettled sensex logs:", fetchError);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log("No pending Sensex predictions to settle.");
    return;
  }

  for (const log of logs) {
    const isCorrect = log.prediction === actualDirection;
    const earnings = isCorrect ? 10 : 0; 

    const { error: updateError } = await supabase
      .from('sensex_logs')
      .update({ 
        actual_return: sensexReturn,
        earnings: earnings,
        is_settled: true 
      })
      .eq('id', log.id);
      
    if (updateError) console.error(`Failed to settle Sensex log ${log.id}:`, updateError);
  }
  
  console.log(`Successfully settled ${logs.length} Sensex predictions.`);
}

Deno.serve(async (req) => {
  try {
    // 1. Check for Market Holiday
    const shouldSkip = await isHolidayToday();
    if (shouldSkip) {
      return new Response(JSON.stringify({ message: "Market closed. No settlement today." }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // 2. Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Fetch Live Data from Google Sheet
    const stockData = await fetchStockData();

    // 4. SETTLE NIFTY 50 (Original Logic Preserved)
    console.log("Starting Nifty 50 settlement...");
    const { data: niftyLogs, error: niftyFetchError } = await supabase
      .from('nifty_logs')
      .select('*')
      .is('stock_return', null);

    if (niftyFetchError) throw niftyFetchError;

    if (niftyLogs && niftyLogs.length > 0) {
      for (const log of niftyLogs) {
        const symbol = log.stock_symbol;
        const returnVal = stockData[symbol] || 0;
        
        // Preservation of decimal precision
        const earnings = parseFloat((returnVal * 10).toFixed(2));
        const dateStr = log.date;

        // Update User Log
        await supabase
          .from('nifty_logs')
          .update({ 
            stock_return: returnVal, 
            earnings: earnings 
          })
          .eq('id', log.id);

        // PRESERVED: Original History Upsert Logic
        await supabase
          .from('stock_history')
          .upsert({ 
            date: dateStr, 
            symbol: symbol, 
            close_percentage: returnVal 
          }, { onConflict: 'date,symbol' });
      }
      console.log(`Settled ${niftyLogs.length} Nifty 50 picks.`);
    } else {
      console.log("No pending Nifty 50 picks.");
    }

    // 5. SETTLE SENSEX (New Parallel Logic)
    await settleSensex(supabase, stockData);

    return new Response(JSON.stringify({ 
      message: "Settlement process completed successfully for both games." 
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Critical error during settlement:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});