
export enum ViewType {
  HOME = 'home',
  ADDITION = 'addition',
  NIFTY50 = 'nifty50',
  DASHBOARD = 'dashboard',
  ADMIN = 'admin'
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Major Indian Market Holidays 2025
export const MARKET_HOLIDAYS_2025 = [
  '2025-01-26', // Republic Day
  '2025-02-26', // Maha Shivaratri
  '2025-03-14', // Holi
  '2025-03-31', // Id-ul-Fitr
  '2025-04-10', // Mahavir Jayanti
  '2025-04-14', // Dr. Ambedkar Jayanti
  '2025-04-18', // Good Friday
  '2025-05-01', // Maharashtra Day
  '2025-08-15', // Independence Day
  '2025-09-05', // Ganesh Chaturthi
  '2025-10-02', // Gandhi Jayanti
  '2025-10-20', // Diwali Laxmi Pujan
  '2025-11-05', // Guru Nanak Jayanti
  '2025-12-25', // Christmas
];
