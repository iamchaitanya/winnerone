
import React from 'react';
import { ViewType } from '../types';
import { PlusCircle, TrendingUp, Grid, Moon, Sun } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, isDarkMode, onToggleDark }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Enhanced Premium Header */}
      <header className="relative bg-gradient-to-b from-indigo-100/50 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950 pt-24 pb-24 px-8 rounded-b-[4rem] shadow-[0_20px_50px_rgba(79,70,229,0.08)] dark:shadow-none border-b border-white dark:border-slate-800/50 overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay pointer-events-none"></div>
        
        {/* Theme Toggle Button */}
        <button 
          onClick={onToggleDark}
          className="absolute top-10 right-8 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all active:scale-90 text-slate-600 dark:text-slate-300 z-20"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <h1 className="relative text-5xl font-black tracking-tight text-center">
          <span className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 drop-shadow-sm">
            Winner
          </span>
          <span className="inline-block bg-clip-text text-transparent bg-gradient-to-tr from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300 drop-shadow-[0_2px_10px_rgba(99,102,241,0.3)]">
            One
          </span>
        </h1>
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] -z-10"></div>
      </header>

      {/* Main Entry Points - Stacked Vertically with increased top margin */}
      <section className="px-6 mt-12 flex flex-col gap-4 pb-24 relative z-10">
        {/* Addition Entry Point */}
        <button 
          onClick={() => onNavigate(ViewType.ADDITION)}
          className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
              <PlusCircle size={32} />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">ADDITION</span>
          </div>
        </button>

        {/* Nifty 50 Entry Point */}
        <button 
          onClick={() => onNavigate(ViewType.NIFTY50)}
          className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:border-emerald-200 dark:hover:border-emerald-500/50 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp size={32} />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">NIFTY 50</span>
          </div>
        </button>

        {/* Dashboard Entry Point */}
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
      </section>
    </div>
  );
};
