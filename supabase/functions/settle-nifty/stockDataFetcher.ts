// supabase/functions/settle-nifty/stockDataFetcher.ts

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3tiV98fFdm8rYUTaPT7Ey3IfrPwc4Mh-x1u9gV0vc0h3QClvYkqhI_OxEG-e0L5VPSeKVZX0wnfey/pub?output=csv';

// Define the new data structure
export interface StockInfo {
  percentage: number;
  price: number;
}

export async function fetchStockData(): Promise<Record<string, StockInfo>> {
  const response = await fetch(CSV_URL);
  if (!response.ok) throw new Error('Failed to fetch CSV');
  const csvText = await response.text();
  
  // Split by newline and filter out empty lines
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const results: Record<string, StockInfo> = {};
  
  // Iterate through lines skipping the header
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length >= 3) {
      const symbol = cols[0].trim();
      
      // Clean up the price string (remove quotes/commas) and parse
      const priceRaw = cols[1].replace(/['",]/g, '').trim();
      const currentPrice = parseFloat(priceRaw);
      
      // Column index 2 contains the changesPercentage
      const changesPercentage = parseFloat(cols[2].trim());
      
      if (symbol && !isNaN(changesPercentage) && !isNaN(currentPrice)) {
        results[symbol] = {
          percentage: changesPercentage,
          price: currentPrice
        };
      }
    }
  }
  return results;
}