import React from 'react';
import { IndianRupee, Check, XCircle, MinusCircle } from 'lucide-react';

interface AdditionResultsProps {
  finalSessionEarnings: number;
  finalScore: number;
  finalWrong: number;
  onReview: () => void;
  onExit: () => void;
}

export const AdditionResults: React.FC<AdditionResultsProps> = ({
  finalSessionEarnings,
  finalScore,
  finalWrong,
  onReview,
  onExit
}) => {
  const totalAttempted = finalScore + finalWrong;
  const skippedCount = 100 - totalAttempted;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500 text-center">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${finalSessionEarnings >= 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
        <IndianRupee size={64} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Session Earnings</h2>
      <div className={`text-6xl font-black mb-12 tabular-nums transition-colors duration-500 ${finalSessionEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        ₹{finalSessionEarnings}
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6 w-full max-sm:px-4 max-w-sm mx-auto">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <Check size={20} className="mx-auto mb-1 text-emerald-500" />
          <p className="text-2xl font-black text-slate-900 dark:text-white">+{finalScore}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <XCircle size={20} className="mx-auto mb-1 text-rose-500" />
          <p className="text-2xl font-black text-rose-500">-{finalWrong}</p>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <MinusCircle size={20} className="mx-auto mb-1 text-slate-400" />
          <p className="text-2xl font-black text-slate-400">{skippedCount}</p>
        </div>
      </div>
      <button 
        onClick={onReview} 
        className="w-full max-sm:px-4 max-w-sm mb-3 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-lg text-slate-900 dark:text-white shadow-md active:scale-95 transition-all mx-auto block"
      >
        VIEW ANSWERS
      </button>
      <button 
        onClick={onExit} 
        className="w-full max-w-sm h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg tracking-widest uppercase shadow-xl active:scale-95 transition-all mx-auto block"
      >
        EXIT
      </button>
    </div>
  );
};