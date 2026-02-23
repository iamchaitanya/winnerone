// src/lib/holidayManager.ts

/**
 * Interface representing the structure of a single holiday object 
 * from the Upstox API.
 */
interface UpstoxHoliday {
  date: string;
  description: string;
  day?: string;
}

/**
 * Interface for the full Upstox API response.
 */
interface UpstoxResponse {
  status: string;
  data: UpstoxHoliday[];
}

// In-memory cache. Lives only while the app is open.
let inMemoryHolidays: Record<string, string> | null = null;

export async function fetchAndCacheHolidays(): Promise<void> {
  // Skip if already fetched in this session
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

    const json: UpstoxResponse = await response.json();
    
    // Extract dates and descriptions into a dictionary for O(1) lookup
    let fetchedHolidays: Record<string, string> = {};
    if (json && Array.isArray(json.data)) {
      json.data.forEach((h: UpstoxHoliday) => {
        if (h.date) {
          fetchedHolidays[h.date] = h.description || 'Market Holiday';
        }
      });
    }

    inMemoryHolidays = fetchedHolidays;
    console.log('Successfully fetched holidays from Upstox API into memory.');
  } catch (error) {
    console.error('Error fetching holidays from Upstox.', error);
    // Fallback to empty object to prevent infinite retries
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