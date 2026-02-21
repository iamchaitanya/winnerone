import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { NIFTY_50_SYMBOLS } from '../../lib/constants'; // Adjusted path based on Option A

interface NiftyStockPickerProps {
  liveStockData: Record<string, { price: number; changesPercentage: number }>;
  liveDataError: boolean;
  isSubmitting: boolean;
  siblingPick?: string;
  onPick: (symbol: string) => void;
  onBack: () => void;
}

export const NiftyStockPicker: React.FC<NiftyStockPickerProps> = ({
  liveStockData,
  liveDataError,
  isSubmitting,
  siblingPick,
  onPick,
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStocks = useMemo(() => {
    return NIFTY_50_SYMBOLS.filter(s => 
      s.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
      <header className="flex flex-col gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Stocks..." 
              className="w-full h-12 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-4 font-bold text-slate-900 dark:text-white focus:ring-2 ring-indigo-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>
      
      {liveDataError && (
        <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-2xl border border-amber-100 dark:border-amber-800/50 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">Live Prices Unavailable</p>
            <p className="text-[10px] font-medium text-amber-500/80 uppercase mt-0.5">Connection issues. You can still make your pick.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pb-12">
        {filteredStocks.map(stock => {
          const isTaken = stock === siblingPick;
          const liveData = liveStockData[stock];

          return (
            <button 
              key={stock} 
              disabled={isTaken || isSubmitting}
              onClick={() => onPick(stock)}
              className={`h-24 border rounded-2xl flex flex-col items-center justify-center shadow-sm transition-all group ${
                isTaken 
                ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed' 
                : isSubmitting
                ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-70 cursor-wait'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-400 active:scale-95'
              }`}
            >
              <span className={`text-sm font-black ${isTaken ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{stock}</span>
              
              {liveData ? (
                <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${liveData.changesPercentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ₹{(liveData.price || 0).toFixed(2)} 
                  ({liveData.changesPercentage > 0 ? '+' : ''}{(liveData.changesPercentage || 0).toFixed(2)}%)
                </div>
              ) : isTaken ? (
                <span className="text-[8px] font-black text-rose-500 uppercase mt-1 tracking-tighter">Sibling Picked</span>
              ) : (
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">Nifty 50</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};