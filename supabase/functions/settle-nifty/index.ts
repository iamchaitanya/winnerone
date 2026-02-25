// supabase/functions/settle-nifty/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { isHolidayToday } from './holidayChecker.ts'
import { fetchStockData, StockInfo } from './stockDataFetcher.ts'

/**
 * Helper to settle Sensex Predictions
 */
async function settleSensex(supabase: any, stockData: Record<string, StockInfo>) {
  console.log("Starting Sensex settlement...");
  
  const sensexInfo = stockData['SENSEX'] || { percentage: 0, price: 0 };
  const sensexReturn = sensexInfo.percentage;
  const sensexClosingValue = sensexInfo.price;
  const actualDirection = sensexReturn >= 0 ? 'UP' : 'DOWN';
  
  console.log(`Sensex today: ${sensexReturn}% (Points: ${sensexClosingValue}, Direction: ${actualDirection})`);

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

  const updatePromises = logs.map(log => {
    const isCorrect = log.prediction === actualDirection;
    const magnitude = Math.abs(sensexReturn);
    const earnings = parseFloat(((isCorrect ? 1 : -1) * magnitude * 10).toFixed(2));

    return supabase
      .from('sensex_logs')
      .update({ 
        actual_return: sensexReturn,
        closing_value: sensexClosingValue, // Saves the actual index points
        earnings: earnings,
        is_settled: true 
      })
      .eq('id', log.id);
  });

  const results = await Promise.all(updatePromises);
  
  results.forEach((res, index) => {
    if (res.error) console.error(`Failed to settle Sensex log ${logs[index].id}:`, res.error);
  });
  
  console.log(`Successfully settled ${logs.length} Sensex predictions.`);
}

Deno.serve(async (req) => {
  try {
    // --- SECURITY CHECK ---
    const secret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');

    if (!secret || secret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid or missing secret" }), { 
        status: 401, 
        headers: { "Content-Type": "application/json" } 
      });
    }
    // ----------------------

    const shouldSkip = await isHolidayToday();
    if (shouldSkip) {
      return new Response(JSON.stringify({ message: "Market closed. No settlement today." }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const stockData = await fetchStockData();

    // 4. SETTLE NIFTY 50
    console.log("Starting Nifty 50 settlement...");
    const { data: niftyLogs, error: niftyFetchError } = await supabase
      .from('nifty_logs')
      .select('*')
      .is('stock_return', null);

    if (niftyFetchError) throw niftyFetchError;

    if (niftyLogs && niftyLogs.length > 0) {
      const updatePromises = [];
      const uniqueHistory = new Map();

      for (const log of niftyLogs) {
        const symbol = log.stock_symbol;
        const stockInfo = stockData[symbol] || { percentage: 0, price: 0 };
        const returnVal = stockInfo.percentage; // Extracts the percentage from the new object
        const earnings = parseFloat((returnVal * 10).toFixed(2));
        
        updatePromises.push(
          supabase
            .from('nifty_logs')
            .update({ stock_return: returnVal, earnings: earnings })
            .eq('id', log.id)
        );

        if (!uniqueHistory.has(symbol)) {
          uniqueHistory.set(symbol, {
            date: log.date,
            symbol: symbol,
            close_percentage: returnVal
          });
        }
      }

      const historyPromises = Array.from(uniqueHistory.values()).map(record =>
        supabase
          .from('stock_history')
          .upsert(record, { onConflict: 'date,symbol' })
      );

      await Promise.all([...updatePromises, ...historyPromises]);
      
      console.log(`Settled ${niftyLogs.length} Nifty 50 picks and updated history.`);
    }

    // 5. SETTLE SENSEX
    await settleSensex(supabase, stockData);

    return new Response(JSON.stringify({ 
      message: "Settlement process completed successfully for both games." 
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Critical error during settlement:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});