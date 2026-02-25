import React from 'react';
import { TrendingUp, TrendingDown, Clock, ArrowLeft, BarChart3 } from 'lucide-react';

interface SensexResultsProps {
  prediction: 'UP' | 'DOWN';
  isSettled?: boolean;
  earnings?: number;
  actualReturn?: number;
  closingValue?: number; // Added to props
  onContinue: () => void;
}

export const SensexResults: React.FC<SensexResultsProps> = ({ 
  prediction, 
  isSettled, 
  earnings, 
  actualReturn,
  closingValue,
  onContinue 
}) => {
  const isCorrect = isSettled && (
    (prediction === 'UP' && (actualReturn ?? 0) >= 0) || 
    (prediction === 'DOWN' && (actualReturn ?? 0) < 0)
  );

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800 text-center">
        
        {/* Pro Dashboard Header */}
        {isSettled && (
          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sensex Closing</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {closingValue?.toLocaleString('en-IN') || '---'}
              </span>
              <span className={`text-sm font-bold px-2 py-1 rounded-lg ${
                (actualReturn ?? 0) >= 0 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
              }`}>
                {(actualReturn ?? 0) > 0 ? '+' : ''}{actualReturn?.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        <h2 className="text-xl font-bold text-slate-600 dark:text-slate-400 mb-2">Your Prediction</h2>
        <div className="flex items-center justify-center gap-3 mb-8">
          {prediction === 'UP' ? (
            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl font-black text-2xl">
              <TrendingUp size={32} /> UP
            </div>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-2xl font-black text-2xl">
              <TrendingDown size={32} /> DOWN
            </div>
          )}
        </div>

        {!isSettled ? (
          <div className="space-y-4">
            <div className="inline-flex p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full animate-pulse">
              <Clock size={48} />
            </div>
            <h3 className="text-2xl font-black dark:text-white">Settlement Pending</h3>
            <p className="text-slate-500">Check back after 3:30 PM for results!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`text-5xl font-black ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isCorrect ? 'YOU WON!' : 'TRY AGAIN!'}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="text-sm font-bold text-slate-400 uppercase mb-1">Today's Earnings</div>
              <div className={`text-4xl font-black ${earnings && earnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {earnings && earnings > 0 ? '+' : ''}{earnings?.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onContinue}
          className="mt-10 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <ArrowLeft size={20} /> Back to Hub
        </button>
      </div>
    </div>
  );
};