// src/lib/holidayManager.ts

interface UpstoxHoliday {
  date: string;
  description: string;
  holiday_type?: string; 
}

interface UpstoxResponse {
  status: string;
  data: UpstoxHoliday[];
}

export interface HolidayDetail {
  name: string;
  type: 'Trading' | 'Settlement' | 'Weekend';
}

// Now storing objects with descriptions and types
let inMemoryHolidays: Record<string, { description: string; type: string }> | null = null;

export async function fetchAndCacheHolidays(): Promise<void> {
  if (inMemoryHolidays !== null) return;

  try {
    const response = await fetch('https://api.upstox.com/v2/market/holidays', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const json: UpstoxResponse = await response.json();
    
    let fetchedHolidays: Record<string, { description: string; type: string }> = {};
    if (json && Array.isArray(json.data)) {
      json.data.forEach((h: UpstoxHoliday) => {
        if (h.date) {
          fetchedHolidays[h.date] = {
            description: h.description || 'Market Holiday',
            type: h.holiday_type || 'Trading' 
          };
        }
      });
    }

    inMemoryHolidays = fetchedHolidays;
  } catch (error) {
    console.error('Holiday fetch error:', error);
    inMemoryHolidays = {};
  }
}

export function isMarketHoliday(dateString: string): boolean {
  const dateObj = new Date(dateString);
  const dayOfWeek = dateObj.getDay();
  // Saturday = 6, Sunday = 0
  if (dayOfWeek === 0 || dayOfWeek === 6) return true; 
  return !!(inMemoryHolidays && inMemoryHolidays[dateString]);
}

/**
 * Returns specific details about why the market is closed on a date.
 */
export function getHolidayDetail(dateString: string): HolidayDetail | null {
  const dateObj = new Date(dateString);
  const dayOfWeek = dateObj.getDay();
  
  if (dayOfWeek === 0) return { name: "Sunday", type: "Weekend" };
  if (dayOfWeek === 6) return { name: "Saturday", type: "Weekend" };

  if (inMemoryHolidays && inMemoryHolidays[dateString]) {
    const holiday = inMemoryHolidays[dateString];
    return {
      name: holiday.description,
      type: holiday.type as any
    };
  }

  return null;
}