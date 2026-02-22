import React, { useState, useEffect, useCallback } from 'react';
import { ViewType } from '../types';
import { PlusCircle, TrendingUp, Grid, Moon, Sun, Lock, ShieldAlert, Clock, Trophy, Heart } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
  settings: {
    dateOverride: string | null;
    additionEnabled: boolean;
    niftyEnabled: boolean;
  };
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, isDarkMode, onToggleDark, settings }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number } | null>(null);
  const [isGameEnded, setIsGameEnded] = useState(false);

  const endDate = new Date('2027-01-01T00:00:00');

  // Updated to use settings.dateOverride from Supabase
  const getEffectiveDate = useCallback(() => {
    const now = new Date();
    if (settings.dateOverride) {
      const d = new Date(settings.dateOverride);
      if (isNaN(d.getTime())) return now;
      if (!settings.dateOverride.includes('T')) {
        const [y, m, day] = settings.dateOverride.split('-').map(Number);
        const localDate = new Date();
        localDate.setFullYear(y, m - 1, day);
        localDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        return localDate;
      }
      d.setSeconds(now.getSeconds(), now.getMilliseconds());
      return d;
    }
    return now;
  }, [settings.dateOverride]);

  useEffect(() => {
    const updateTimer = () => {
      const current = getEffectiveDate();
      const diff = endDate.getTime() - current.getTime();

      if (diff <= 0) {
        setIsGameEnded(true);
        setTimeLeft(null);
      } else {
        setIsGameEnded(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [getEffectiveDate]);

  return (
    <div className="animate-in fade-in duration-700">
      <header className="relative bg-gradient-to-b from-indigo-100/50 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950 pt-24 pb-24 px-8 rounded-b-[4rem] shadow-[0_20px_50px_rgba(79,70,229,0.08)] dark:shadow-none border-b border-white dark:border-slate-800/50 overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
        
        <button 
          onClick={() => onNavigate(ViewType.ADMIN)}
          className="absolute top-10 left-8 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all active:scale-90 text-slate-400 dark:text-slate-500 z-20"
          aria-label="Admin Access"
        >
          <Lock size={20} />
        </button>

        <button 
          onClick={onToggleDark}
          className="absolute top-10 right-8 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all active:scale-90 text-slate-600 dark:text-slate-300 z-20"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="flex flex-col items-center gap-2">
          <h1 className="relative text-5xl font-black tracking-tight text-center">
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 drop-shadow-sm">
              Winner
            </span>
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-tr from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300 drop-shadow-[0_2px_10px_rgba(99,102,241,0.3)]">
              One
            </span>
          </h1>
          
          {!isGameEnded && timeLeft && (
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
              <Clock size={10} />
              <span>
                {timeLeft.days}D {timeLeft.hours}H {timeLeft.minutes}M REMAINING
              </span>
            </div>
          )}

          {isGameEnded && (
            <div className="px-4 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-rose-500/20">
              Season Finalized
            </div>
          )}
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] -z-10"></div>
      </header>

      <section className="px-6 mt-12 flex flex-col gap-4 pb-24 relative z-10">
        {isGameEnded ? (
          <div className="animate-in slide-in-from-bottom duration-1000">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Trophy size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">The Journey Concludes</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                Thank you for being part of WinnerOne. The 2026 season has officially come to an end. It's been an incredible year of competition, strategy, and mental agility.
              </p>
              <div className="flex items-center justify-center gap-2 text-rose-500 font-black text-xs uppercase tracking-widest">
                <Heart size={14} fill="currentColor" />
                See you in the next season
              </div>
            </div>

            <button 
              onClick={() => onNavigate(ViewType.DASHBOARD)}
              className="flex flex-row items-center px-6 h-24 bg-indigo-600 dark:bg-indigo-500 text-white rounded-3xl shadow-xl shadow-indigo-200/40 dark:shadow-none transition-all group active:scale-[0.98] w-full"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                  <Grid size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-2xl tracking-tighter uppercase">FINAL DASHBOARD</span>
                  <span className="text-[10px] font-bold uppercase opacity-80">View Final Standings</span>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={() => settings.additionEnabled && onNavigate(ViewType.ADDITION)}
              className={`flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${
                settings.additionEnabled 
                ? 'hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-500/50 active:scale-[0.98]' 
                : 'opacity-50 grayscale cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-6 w-full">
                <div className={`p-4 rounded-2xl transition-transform ${settings.additionEnabled ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <PlusCircle size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">ADDITION</span>
                  {!settings.additionEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10}/> Disabled by Admin</span>}
                </div>
              </div>
            </button>

            <button 
              onClick={() => settings.niftyEnabled && onNavigate(ViewType.NIFTY50)}
              className={`flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${
                settings.niftyEnabled 
                ? 'hover:shadow-2xl hover:border-emerald-200 dark:hover:border-emerald-500/50 active:scale-[0.98]' 
                : 'opacity-50 grayscale cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-6 w-full">
                <div className={`p-4 rounded-2xl transition-transform ${settings.niftyEnabled ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <TrendingUp size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">NIFTY 50</span>
                  {!settings.niftyEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10}/> Disabled by Admin</span>}
                </div>
              </div>
            </button>

            <button 
              onClick={() => onNavigate(ViewType.DASHBOARD)}
              className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:border-violet-200 dark:hover:border-violet-500/50 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Grid size={32} />
                </div>
                <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">DASHBOARD</span>
              </div>
            </button>
          </>
        )}
      </section>
    </div>
  );
};