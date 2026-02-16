// src/lib/stockFetcher.ts

const FMP_API_KEY = import.meta.env.VITE_FMP_API_KEY;
const CACHE_PREFIX = 'fmp_stock_cache_';

export async function fetchStockReturn(symbol: string, dateStr: string): Promise<number> {
  // 1. Check local cache first to save API calls
  const cacheKey = `${CACHE_PREFIX}${symbol}_${dateStr}`;
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    console.log(`Loaded ${symbol} from cache.`);
    return parseFloat(cachedData);
  }

  try {
    // 2. Format the symbol for the National Stock Exchange (NSE)
    const nseSymbol = `${symbol}.NS`;
    
    // 3. Call the FMP Quote API
    const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/${nseSymbol}?apikey=${FMP_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // 4. Extract the percentage change
    if (data && data.length > 0) {
      const percentageChange = data[0].changesPercentage;
      
      // Save it to cache so if the other child checks, or they refresh, we don't waste an API call
      localStorage.setItem(cacheKey, percentageChange.toString());
      
      return percentageChange;
    } else {
      throw new Error(`No data found for ${nseSymbol}`);
    }
  } catch (error) {
    console.error(`Error fetching real stock data for ${symbol}:`, error);
    // Safe fallback to 0 if offline or API fails, preventing the app from crashing
    return 0; 
  }
}

export async function fetchAllNiftyReturns(symbols: string[]): Promise<Record<string, { price: number; changesPercentage: number }>> {
    try {
      // 1. Format all symbols for NSE and join them with commas for a batch request
      const nseSymbols = symbols.map(s => `${s}.NS`).join(',');
      
      // 2. Call the FMP Quote API with the batch of symbols
      const response = await fetch(`https://financialmodelingprep.com/api/v3/quote/${nseSymbols}?apikey=${FMP_API_KEY}`);
      
      if (!response.ok) {
        throw new Error('Batch network response was not ok');
      }
  
      const data = await response.json();
      
      // 3. Transform the array response into an easy-to-use dictionary mapped by our local symbol names
      const stockDataMap: Record<string, { price: number; changesPercentage: number }> = {};
      
      if (data && data.length > 0) {
        data.forEach((stock: any) => {
          // Remove the '.NS' suffix to exactly match our NIFTY_50_SYMBOLS array
          const cleanSymbol = stock.symbol.replace('.NS', '');
          stockDataMap[cleanSymbol] = {
            price: stock.price,
            changesPercentage: stock.changesPercentage
          };
        });
      }
      
      return stockDataMap;
    } catch (error) {
      console.error('Error fetching batch stock data:', error);
      // Safe fallback to an empty object if offline or API fails, preventing crashes
      return {}; 
    }
  }