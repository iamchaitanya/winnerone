const LIVE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3tiV98fFdm8rYUTaPT7Ey3IfrPwc4Mh-x1u9gV0vc0h3QClvYkqhI_OxEG-e0L5VPSeKVZX0wnfey/pub?output=csv';

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
        
        if (symbol) {
          results[symbol] = { price: price || 0, changesPercentage: change || 0 };
        }
      }
    }
    return results;
  } catch (error) {
    console.error('Error fetching bulk prices:', error);
    return {};
  }
}