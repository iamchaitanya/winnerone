import React from 'react';
import { User, Users, Check, Eye, CalendarX, XCircle, Play } from 'lucide-react';

interface NiftyPlayerSelectProps {
  selectedUser: string | null;
  isPlayed: boolean;
  isPickWindow: boolean;
  isMarketWorking: boolean;
  onNavigate: (view: 'STOCK_PICK' | 'RESULTS' | 'HUB') => void;
  onBack: () => void;
}

export const NiftyPlayerSelect: React.FC<NiftyPlayerSelectProps> = ({
  selectedUser,
  isPlayed,
  isPickWindow,
  isMarketWorking,
  onNavigate,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300 text-center">
      <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800">
        {selectedUser === 'Ayaan' ? <User size={48} className="text-indigo-600" /> : <Users size={48} className="text-rose-600" />}
      </div>
      <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Market Pick</h2>
      
      {isPlayed ? (
        <>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 mb-12 flex items-center gap-3">
            <Check size={20} className="text-emerald-500" />
            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase">You've made your pick today!</p>
          </div>
          <button onClick={() => onNavigate('RESULTS')} className="w-full max-w-xs h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl mx-auto block">
            <Eye size={20} /> VIEW STATUS
          </button>
        </>
      ) : (
        <>
          {!isMarketWorking ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 px-8 py-6 rounded-[2rem] border border-amber-100 dark:border-amber-800/50 mb-12 max-w-xs">
              <CalendarX size={32} className="text-amber-500 mx-auto mb-3" />
              <p className="text-amber-600 dark:text-amber-400 font-black text-sm uppercase tracking-wide">Market Closed Today</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">No picks allowed on holidays or weekends</p>
            </div>
          ) : !isPickWindow ? (
            <div className="bg-rose-50 dark:bg-rose-900/20 px-8 py-6 rounded-[2rem] border border-rose-100 dark:border-rose-800/50 mb-12 max-w-xs">
              <XCircle size={32} className="text-rose-500 mx-auto mb-3" />
              <p className="text-rose-600 dark:text-rose-400 font-black text-sm uppercase tracking-wide">Entry Window Closed</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Picks must be made before 9:00 AM IST</p>
            </div>
          ) : (
            <>
              <p className="text-slate-400 font-medium mb-12 uppercase tracking-widest text-xs px-8 leading-relaxed">Choose a stock before 9 AM. Earnings settled after 3:30 PM.</p>
              <button onClick={() => onNavigate('STOCK_PICK')} className="w-full max-w-xs h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl mx-auto block">
                <Play size={24} fill="currentColor" /> CHOOSE STOCK
              </button>
            </>
          )}
        </>
      )}
      <button onClick={onBack} className="mt-8 text-slate-400 font-bold text-sm uppercase tracking-widest">Back</button>
    </div>
  );
};