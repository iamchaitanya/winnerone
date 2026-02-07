
export enum ViewType {
  HOME = 'home',
  ADDITION = 'addition',
  NIFTY50 = 'nifty50',
  DASHBOARD = 'dashboard'
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}
