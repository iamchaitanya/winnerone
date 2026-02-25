import React from 'react';
import { CheckCircle2, TrendingUp, TrendingDown, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface SensexResultsProps {
  onContinue: () => void;
  prediction: 'UP' | 'DOWN';
  isSettled?: boolean;
  earnings?: number;
  actualReturn?: number;
}

export const SensexResults: React.FC<SensexResultsProps> = ({ 
  onContinue, 
  prediction,
  isSettled = false,
  earnings = 0,
  actualReturn = 0
}) => {
  const isUp = prediction === 'UP';
  const isWinner = earnings > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in zoom-in duration-500">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        {/* Status Icon */}
        <div className="mb-8 relative">
          {!isSettled ? (
            <>
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <CheckCircle2 size={48} color="white" strokeWidth={3} />
              </div>
            </>
          ) : (
            <>
              <div className={`absolute inset-0 ${isWinner ? 'bg-emerald-500/20' : 'bg-rose-500/20'} blur-3xl rounded-full animate-pulse`} />
              <div className={`relative w-24 h-24 ${isWinner ? 'bg-emerald-500' : 'bg-rose-500'} rounded-[2rem] flex items-center justify-center shadow-xl`}>
                {isWinner ? <TrendingUp size={48} color="white" /> : <TrendingDown size={48} color="white" />}
              </div>
            </>
          )}
        </div>

        {/* Dynamic Header */}
        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 text-center">
          {!isSettled ? "Prediction Saved!" : isWinner ? "You Won!" : "Market Moved Opposite"}
        </h2>

        {/* Dynamic Earnings Display */}
        {isSettled && (
          <div className={`text-6xl font-black mb-4 tabular-nums ${isWinner ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isWinner ? '+' : ''}₹{earnings.toLocaleString('en-IN', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </div>
        )}

        {/* Prediction Card */}
        <div className="w-full bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-slate-100 dark:border-slate-800 mb-8 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">You Predicted</span>
            <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {isUp ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
              <span className="text-3xl font-black uppercase">{prediction}</span>
            </div>
          </div>

          {/* Market Context Footer */}
          <div className="mt-8 pt-8 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-start gap-4">
            {!isSettled ? (
              <>
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-amber-500" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Settlement Pending</h4>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase mt-1 leading-relaxed">
                    Come back after 3:30 PM for results.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={`w-10 h-10 ${actualReturn >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <AlertCircle size={20} className={actualReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Market Close</h4>
                  <p className={`text-sm font-black mt-1 ${actualReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    Sensex moved {actualReturn > 0 ? '+' : ''}{actualReturn.toFixed(2)}%
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <button 
          onClick={onContinue} 
          className="w-full h-20 bg-slate-900 dark:bg-white rounded-[2rem] flex items-center justify-center gap-4 active:scale-95 shadow-xl transition-all"
        >
          <span className="text-xl font-black text-white dark:text-slate-900 uppercase tracking-widest">Continue</span>
          <ArrowRight size={24} className="text-white dark:text-slate-900" />
        </button>
      </div>
    </div>
  );
};