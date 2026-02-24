// supabase/functions/settle-nifty/stockDataFetcher.ts

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3tiV98fFdm8rYUTaPT7Ey3IfrPwc4Mh-x1u9gV0vc0h3QClvYkqhI_OxEG-e0L5VPSeKVZX0wnfey/pub?output=csv';

export async function fetchStockData() {
  const response = await fetch(CSV_URL);
  if (!response.ok) throw new Error('Failed to fetch CSV');
  const csvText = await response.text();
  
  // Split by newline and filter out empty lines
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const results: Record<string, number> = {};
  
  // Iterate through lines skipping the header
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length >= 3) {
      const symbol = cols[0].trim();
      // Column index 2 contains the changesPercentage
      const changesPercentage = parseFloat(cols[2].trim());
      
      if (symbol && !isNaN(changesPercentage)) {
        results[symbol] = changesPercentage;
      }
    }
  }
  return results;
}