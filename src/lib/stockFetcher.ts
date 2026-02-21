import { supabase } from './supabase';

const LIVE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3tiV98fFdm8rYUTaPT7Ey3IfrPwc4Mh-x1u9gV0vc0h3QClvYkqhI_OxEG-e0L5VPSeKVZX0wnfey/pub?output=csv';

// 1. FOR THE PICKING SCREEN: Fetch everything at once
export async function fetchAllLiveReturns(): Promise<Record<string, { price: number, changesPercentage: number }>> {
  try {
    const response = await fetch(LIVE_CSV_URL);
    const csvText = await response.text();
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const results: Record<string, { price: number, changesPercentage: number }> = {};
    
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length >= 3) {
        const symbol = cols[0].trim();
        const price = parseFloat(cols[1].trim()); // Column 1 is Price
        const change = parseFloat(cols[2].trim()); // Column 2 is % Change
        
        // FIX: Add safety check for NaN values
        if (symbol && !isNaN(price) && !isNaN(change)) {
          results[symbol] = { price, changesPercentage: change };
        }
      }
    }
    return results;
  } catch (error) {
    console.error('Error fetching bulk prices:', error);
    return {};
  }
}

// 2. FOR SETTLEMENT: Fetch one specific stock (Today or History)
export async function fetchStockReturn(symbol: string, dateStr: string): Promise<number> {
  // Use toDateString() for comparison with Today, but passed dateStr should be YYYY-MM-DD for DB
  const todayDateObj = new Date();
  const todayStr = todayDateObj.toISOString().split('T')[0];
  
  // If the requested date is today (or future), fetch live
  if (dateStr === todayStr) {
    const all = await fetchAllLiveReturns();
    return all[symbol]?.changesPercentage || 0;
  } else {
    const { data } = await supabase
      .from('stock_history')
      .select('close_percentage')
      .eq('date', dateStr)
      .eq('symbol', symbol)
      .maybeSingle();
    return data?.close_percentage || 0;
  }
}