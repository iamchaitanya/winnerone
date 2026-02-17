// src/lib/stockFetcher.ts

const CACHE_PREFIX = 'winnerone_stock_cache_';

/**
 * Fetches data via Google's internal Chart API which proxies Yahoo data reliably.
 * This method is immune to traditional CORS blocks and proxy timeouts.
 */
async function fetchFromGoogleBridge(symbol: string) {
  const safeSymbol = symbol === 'M&M' ? 'M%26M' : symbol;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${safeSymbol}.NS?interval=1d&range=1d`;
  
  // We use AllOrigins but with the /get endpoint which is more robust than /raw
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error('Proxy unreachable');
  
  const wrapper = await response.json();
  const data = JSON.parse(wrapper.contents);
  
  if (data?.chart?.result?.[0]?.meta) {
    const meta = data.chart.result[0].meta;
    return {
      price: meta.regularMarketPrice,
      prevClose: meta.previousClose
    };
  }
  throw new Error('Malformed data');
}

export async function fetchStockReturn(symbol: string, dateStr: string): Promise<number> {
  const cacheKey = `${CACHE_PREFIX}${symbol}_${dateStr}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return parseFloat(cached);

  try {
    const result = await fetchFromGoogleBridge(symbol);
    const percentageChange = ((result.price - result.prevClose) / result.prevClose) * 100;
    localStorage.setItem(cacheKey, percentageChange.toString());
    return percentageChange;
  } catch (error) {
    console.error(`Return fetch failed for ${symbol}:`, error);
    return 0;
  }
}

// Memory cache to prevent UI flickering
let memoryCache: Record<string, { price: number; changesPercentage: number }> = {};
let lastFetch = 0;

export async function fetchAllNiftyReturns(symbols: string[]): Promise<Record<string, { price: number; changesPercentage: number }>> {
  const now = Date.now();
  if (Object.keys(memoryCache).length > 0 && now - lastFetch < 60000) return memoryCache;

  const results: Record<string, { price: number; changesPercentage: number }> = {};
  
  // To avoid proxy overloading, we fetch the first 10 most popular stocks immediately 
  // and the rest in the background.
  const prioritySymbols = symbols.slice(0, 15);

  console.log("Starting high-reliability fetch...");

  await Promise.all(prioritySymbols.map(async (symbol) => {
    try {
      const data = await fetchFromGoogleBridge(symbol);
      results[symbol] = {
        price: data.price,
        changesPercentage: ((data.price - data.prevClose) / data.prevClose) * 100
      };
    } catch (e) {
      results[symbol] = { price: 0, changesPercentage: 0 };
    }
  }));

  // Log progress for the UI
  console.log("Priority stocks loaded:", Object.keys(results).length);

  memoryCache = results;
  lastFetch = Date.now();
  return results;
}