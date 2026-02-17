// src/lib/stockFetcher.ts

const CACHE_PREFIX = 'winnerone_stock_cache_';
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3tiV98fFdm8rYUTaPT7Ey3IfrPwc4Mh-x1u9gV0vc0h3QClvYkqhI_OxEG-e0L5VPSeKVZX0wnfey/pub?output=csv';

// Memory cache to prevent UI flickering
let memoryCache: Record<string, { price: number; changesPercentage: number }> = {};
let lastFetch = 0;

/**
 * Fetches data directly from the published Google Sheet CSV.
 */
async function fetchFromGoogleSheet(): Promise<Record<string, { price: number; changesPercentage: number }>> {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('Failed to fetch CSV');
    
    const csvText = await response.text();
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const results: Record<string, { price: number; changesPercentage: number }> = {};
    
    // Skip the header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length >= 3) {
        const symbol = cols[0].trim();
        const price = parseFloat(cols[1].trim());
        const changesPercentage = parseFloat(cols[2].trim());
        
        if (symbol && !isNaN(price) && !isNaN(changesPercentage)) {
          results[symbol] = { price, changesPercentage };
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return {};
  }
}

export async function fetchStockReturn(symbol: string, dateStr: string): Promise<number> {
  const cacheKey = `${CACHE_PREFIX}${symbol}_${dateStr}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return parseFloat(cached);

  try {
    const data = await fetchFromGoogleSheet();
    const stockData = data[symbol];
    
    if (stockData) {
      const percentageChange = stockData.changesPercentage;
      localStorage.setItem(cacheKey, percentageChange.toString());
      return percentageChange;
    }
    return 0;
  } catch (error) {
    console.error(`Return fetch failed for ${symbol}:`, error);
    return 0;
  }
}

export async function fetchAllNiftyReturns(symbols: string[]): Promise<Record<string, { price: number; changesPercentage: number }>> {
  const now = Date.now();
  if (Object.keys(memoryCache).length > 0 && now - lastFetch < 60000) {
    return memoryCache;
  }

  console.log("Starting fetch from Google Sheets CSV...");
  const data = await fetchFromGoogleSheet();
  
  const results: Record<string, { price: number; changesPercentage: number }> = {};
  
  // Only map the symbols the UI actually requested
  symbols.forEach(symbol => {
    if (data[symbol]) {
      results[symbol] = data[symbol];
    } else {
      results[symbol] = { price: 0, changesPercentage: 0 };
    }
  });

  console.log("Stocks loaded from Sheet:", Object.keys(results).length);

  memoryCache = results;
  lastFetch = Date.now();
  return results;
}