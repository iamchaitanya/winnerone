import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, ChevronUp, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { fetchAllLiveReturns } from '../../lib/stockFetcher';

interface SensexUpDownPickerProps {
  isSubmitting: boolean;
  onPick: (prediction: 'UP' | 'DOWN') => void;
  onBack: () => void;
}

export const SensexUpDownPicker: React.FC<SensexUpDownPickerProps> = ({
  isSubmitting,
  onPick,
  onBack
}) => {
  const [liveData, setLiveData] = useState<{ price: number; changesPercentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAllLiveReturns()
      .then(data => {
        if (data['SENSEX']) setLiveData(data['SENSEX']);
        setIsLoading(false);
      })
      .catch(() => {
        setError(true);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sensex Prediction</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center -mt-12">
        <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4">Live Market Data</span>
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <span className="text-xs font-bold text-slate-400 uppercase">Fetching Sensex...</span>
            </div>
          ) : error || !liveData ? (
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="text-rose-500" size={32} />
              <span className="text-xs font-bold text-rose-500 uppercase">Price Unavailable</span>
            </div>
          ) : (
            <>
              <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                {liveData.price.toLocaleString('en-IN')}
              </h2>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-sm ${liveData.changesPercentage >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {liveData.changesPercentage >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {liveData.changesPercentage > 0 ? '+' : ''}{liveData.changesPercentage.toFixed(2)}%
              </div>
            </>
          )}
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
            Will the Sensex close <br /> 
            <span className="text-indigo-500 underline decoration-indigo-500/30">UP</span> or <span className="text-rose-500 underline decoration-rose-500/30">DOWN</span> today?
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full mb-8">
        <button
          disabled={isSubmitting || isLoading}
          onClick={() => onPick('UP')}
          className="h-32 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-[2rem] flex flex-col items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <ChevronUp size={32} className="text-white mb-1 animate-bounce" />
          <span className="text-2xl font-black text-white uppercase tracking-tighter">UP</span>
        </button>

        <button
          disabled={isSubmitting || isLoading}
          onClick={() => onPick('DOWN')}
          className="h-32 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 rounded-[2rem] flex flex-col items-center justify-center transition-all active:scale-95 shadow-lg shadow-rose-500/20"
        >
          <span className="text-2xl font-black text-white uppercase tracking-tighter">DOWN</span>
          <ChevronDown size={32} className="text-white mt-1 animate-bounce" />
        </button>
      </div>
    </div>
  );
};