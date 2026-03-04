export enum ViewType {
  HOME = 'home',
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  MULTIPLICATION = 'multiplication',
  MULTIPLICATION25 = 'multiplication25',
  MULTIPLY = 'multiply',
  DIVIDE = 'divide',
  MENTALMATH = 'mentalmath',
  MATHMASTERY = 'mathmastery',
  NIFTY50 = 'nifty50',
  SENSEX = 'sensex',
  SUDOKU = 'sudoku',
  MEMORY = 'memory',
  WORDPOWER = 'wordpower',
  BARRON800 = 'barron800',
  MANHATTAN500 = 'manhattan500',
  DAILYHISTORY = 'dailyhistory',
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
  key:
  | 'addition_date_override'
  | 'game_enabled_addition'
  | 'game_enabled_subtraction'
  | 'game_enabled_multiplication'
  | 'game_enabled_multiplication25'
  | 'game_enabled_multiply'
  | 'game_enabled_divide'
  | 'game_enabled_mentalmath'
  | 'game_enabled_mathmastery'
  | 'game_enabled_nifty'
  | 'game_enabled_sensex'
  | 'pin_entry_enabled'
  | 'game_multiplier_addition'
  | 'game_multiplier_subtraction'
  | 'game_multiplier_multiplication'
  | 'game_multiplier_multiplication25'
  | 'game_multiplier_multiply'
  | 'game_multiplier_divide'
  | 'game_multiplier_mentalmath'
  | 'game_multiplier_mathmastery';
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

export interface SubtractionLog {
  id?: string;
  player_id: string;
  earnings: number;
  played_at?: string;
}

export interface NiftyLog {
  id?: string;
  player: string; // Currently using name strings in your nifty_logs table
  earnings: number;
  created_at?: string;
}

