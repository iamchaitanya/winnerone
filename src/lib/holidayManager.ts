// src/lib/holidayManager.ts

// In-memory cache. This lives only while the app is open in the browser.
// No localStorage means 100% consistency across devices, always fresh on load.
let inMemoryHolidays: Record<string, string> | null = null;

export async function fetchAndCacheHolidays(): Promise<void> {
  // If we already fetched it during this specific app session, skip to save network calls.
  if (inMemoryHolidays !== null) {
    return;
  }

  try {
    const response = await fetch('https://api.upstox.com/v2/market/holidays', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.status}`);
    }

    const json = await response.json();
    
    // Extract dates and descriptions into a dictionary for O(1) lookup
    let fetchedHolidays: Record<string, string> = {};
    if (json && Array.isArray(json.data)) {
      json.data.forEach((h: any) => {
        if (h.date) {
          fetchedHolidays[h.date] = h.description || 'Market Holiday';
        }
      });
    }

    // Save to the in-memory variable
    inMemoryHolidays = fetchedHolidays;
    console.log('Successfully fetched holidays from Upstox API into memory.');
  } catch (error) {
    console.error('Error fetching holidays from Upstox.', error);
    // Initialize as empty object so we don't infinitely retry on failure if the API is down
    inMemoryHolidays = {};
  }
}

export function isMarketHoliday(dateString: string): boolean {
  // 1. Dynamic Weekend Check (Saturday = 6, Sunday = 0)
  const dateObj = new Date(dateString);
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true; 
  }

  // 2. In-Memory Cache Check
  if (inMemoryHolidays && inMemoryHolidays[dateString]) {
    return true;
  }

  return false; 
}

export function getMarketHolidayName(dateString: string): string | null {
  // 1. Check for weekends first
  const dateObj = new Date(dateString);
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0) return "Sunday";
  if (dayOfWeek === 6) return "Saturday";

  // 2. Check the in-memory cache for specific public holidays
  if (inMemoryHolidays && inMemoryHolidays[dateString]) {
    return inMemoryHolidays[dateString];
  }

  return null;
}