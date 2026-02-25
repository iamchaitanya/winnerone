const LIVE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3tiV98fFdm8rYUTaPT7Ey3IfrPwc4Mh-x1u9gV0vc0h3QClvYkqhI_OxEG-e0L5VPSeKVZX0wnfey/pub?output=csv';

export async function fetchAllLiveReturns(): Promise<Record<string, { price: number, changesPercentage: number }>> {
  try {
    const response = await fetch(LIVE_CSV_URL);
    const csvText = await response.text();
    
    // Robust regex to split CSV lines while ignoring commas inside quotes
    const rows = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
    const results: Record<string, { price: number, changesPercentage: number }> = {};
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      // This regex handles quoted fields like "72,500.00" correctly
      const cols = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      
      if (cols && cols.length >= 3) {
        const symbol = cols[0].replace(/"/g, '').trim();
        
        // Remove quotes and commas before parsing the price and change
        const rawPrice = cols[1].replace(/[",]/g, '').trim();
        const rawChange = cols[2].replace(/[",]/g, '').trim();
        
        const price = parseFloat(rawPrice);
        const change = parseFloat(rawChange);
        
        if (symbol) {
          results[symbol] = { 
            price: isNaN(price) ? 0 : price, 
            changesPercentage: isNaN(change) ? 0 : change 
          };
        }
      }
    }
    return results;
  } catch (error) {
    console.error('Error fetching bulk prices:', error);
    return {};
  }
}