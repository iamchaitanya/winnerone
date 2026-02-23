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

/**
 * Strict interfaces representing your Supabase Table Schema.
 * Use these to replace 'any' in your state and function definitions.
 */

export interface AppSetting {
  key: 'addition_date_override' | 'game_enabled_addition' | 'game_enabled_nifty' | 'pin_entry_enabled';
  value: string | boolean | null;
}

export interface Profile {
  id: string;
  username: string;
  player_name: string; // Add this
  role: string;
  pin: string;
  pin_attempts: number; // Add this
  is_locked: boolean;   // Add this
  created_at?: string;
}

export interface AdditionLog {
  id?: string;
  player_id: string;
  earnings: number;
  created_at?: string;
}

export interface NiftyLog {
  id?: string;
  player: string; // Currently using name strings in your nifty_logs table
  earnings: number;
  created_at?: string;
}

