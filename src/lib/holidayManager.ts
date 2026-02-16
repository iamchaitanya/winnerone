// src/lib/holidayManager.ts

const HOLIDAYS_CACHE_KEY = 'upstox_holidays_cache';
const LAST_FETCH_KEY = 'upstox_last_fetch_date';

export async function fetchAndCacheHolidays(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const lastFetch = localStorage.getItem(LAST_FETCH_KEY);

  // If we already fetched the list today, silently skip to keep the app fast
  if (lastFetch === today) {
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
    
    // Extract dates from the Upstox API response
    let fetchedHolidays: string[] = [];
    if (json && Array.isArray(json.data)) {
      // Upstox returns an array of objects in the 'data' property
      fetchedHolidays = json.data.map((h: any) => h.date).filter(Boolean);
    }

    // Save the master list to localStorage
    localStorage.setItem(HOLIDAYS_CACHE_KEY, JSON.stringify(fetchedHolidays));
    
    // Stamp today's date so we don't fetch again until tomorrow
    localStorage.setItem(LAST_FETCH_KEY, today);
    
    console.log('Successfully updated holidays cache from Upstox API.');
  } catch (error) {
    console.error('Error fetching holidays from Upstox. Falling back to cache.', error);
    // If offline or API fails, it will gracefully fall back to the existing cache
  }
}

export function isMarketHoliday(dateString: string): boolean {
  // 1. Dynamic Weekend Check (Saturday = 6, Sunday = 0)
  const dateObj = new Date(dateString);
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true; // Always a holiday on weekends
  }

  // 2. Upstox API Cache Check
  try {
    const cachedData = localStorage.getItem(HOLIDAYS_CACHE_KEY);
    if (cachedData) {
      const holidays: string[] = JSON.parse(cachedData);
      return holidays.includes(dateString);
    }
  } catch (e) {
    console.error("Failed to parse holidays cache", e);
  }

  // Safe fallback if the cache is empty and the API failed
  return false; 
}