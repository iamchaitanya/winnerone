// supabase/functions/settle-nifty/holidayChecker.ts

const HOLIDAY_API_URL = 'https://api.upstox.com/v2/market/holidays';

export async function isHolidayToday(): Promise<boolean> {
  // 1. Get Today's Date in IST (Indian Standard Time)
  const now = new Date();
  const istDate = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(now); // Result: "YYYY-MM-DD"

  const dayOfWeek = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"})).getDay();

  // 2. Weekend Check (0 = Sunday, 6 = Saturday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log(`Skipping: ${istDate} is a weekend.`);
    return true;
  }

  // 3. Dynamic API Check
  try {
    const response = await fetch(HOLIDAY_API_URL, {
      headers: { 'Accept': 'application/json' }
    });
    const json = await response.json();
    
    if (json && Array.isArray(json.data)) {
      const holidays = json.data.map((h: any) => h.date);
      if (holidays.includes(istDate)) {
        console.log(`Skipping: ${istDate} is a listed market holiday.`);
        return true;
      }
    }
  } catch (error) {
    console.error("Holiday API check failed, proceeding anyway...", error);
  }

  return false;
}