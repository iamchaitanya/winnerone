
import React from 'react';
import { ArrowLeft, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { StockData } from '../types';

const MOCK_STOCKS: StockData[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.20, change: 25.4, changePercent: 1.05 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1618.15, change: -12.3, changePercent: -0.76 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3410.50, change: 45.8, changePercent: 1.36 },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1520.00, change: 18.2, changePercent: 1.21 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 924.45, change: -5.1, changePercent: -0.55 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2540.00, change: 8.9, changePercent: 0.35 },
];

const MOCK_CHART_DATA = [
  { name: '10:00', price: 19400 },
  { name: '11:00', price: 19450 },
  { name: '12:00', price: 19420 },
  { name: '13:00', price: 19500 },
  { name: '14:00', price: 19550 },
  { name: '15:00', price: 19520 },
  { name: '16:00', price: 19580 },
];

interface Nifty50ViewProps {
  onBack: () => void;
}

export const Nifty50View: React.FC<Nifty50ViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300 pb-12">
      <div className="bg-white dark:bg-slate-900 p-6 pb-2 border-b border-slate-100 dark:border-slate-800">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nifty 50</h1>
          </div>
          <div className="flex gap-2 text-slate-400 dark:text-slate-500">
            <button className="p-2 hover:text-slate-600 dark:hover:text-slate-300">
              <Search size={20} />
            </button>
            <button className="p-2 hover:text-slate-600 dark:hover:text-slate-300">
              <Filter size={20} />
            </button>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center mb-6">
          <div className="space-y-1 mb-6 lg:mb-0">
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">19,580.45</h2>
              <span className="text-emerald-500 dark:text-emerald-400 font-bold text-sm">+180.45 (0.92%)</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">As of Oct 24, 03:30 PM IST</p>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Constituents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_STOCKS.map((stock) => (
            <div 
              key={stock.symbol}
              className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-sm border border-slate-100 dark:border-slate-700">
                  {stock.symbol[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{stock.symbol}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white text-sm">₹{stock.price.toLocaleString()}</p>
                <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${
                  stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {stock.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(stock.changePercent)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
