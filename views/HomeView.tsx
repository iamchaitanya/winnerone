import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ViewType } from '../src/types';
import { PlusCircle, MinusCircle, XCircle, Divide, TrendingUp, Grid, Moon, Sun, Lock, ShieldAlert, Clock, Trophy, Heart, Brain, BrainCircuit, Check, Puzzle, Layers, BookOpen, GraduationCap, Library, CalendarDays } from 'lucide-react';
import { useGameStore } from '../src/store/useGameStore';
import { isMarketHoliday, getHolidayDetail } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { getISTDateKey } from '../src/lib/dateUtils';

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, isDarkMode, onToggleDark }) => {
  const settings = useGameStore((state) => state.settings);

  // Today's completion status per game
  type CompletionMap = Record<string, { ayaan: boolean; riyaan: boolean }>;
  const [completions, setCompletions] = useState<CompletionMap>({});

  const getISTDateKeyToday = useCallback(() => {
    const now = settings.dateOverride ? new Date(settings.dateOverride) : new Date();
    return getISTDateKey(now);
  }, [settings.dateOverride]);

  const fetchCompletions = useCallback(async () => {
    const todayIST = getISTDateKeyToday();
    const startOfDay = `${todayIST}T00:00:00+05:30`;
    const endOfDay = `${todayIST}T23:59:59+05:30`;

    const tables = [
      { key: 'addition', table: 'addition_logs', dateCol: 'played_at' },
      { key: 'subtraction', table: 'subtraction_logs', dateCol: 'played_at' },
      { key: 'multiplication', table: 'multiplication_logs', dateCol: 'played_at' },
      { key: 'multiplication25', table: 'multiplication25_logs', dateCol: 'played_at' },
      { key: 'multiply', table: 'multiply_logs', dateCol: 'played_at' },
      { key: 'divide', table: 'divide_logs', dateCol: 'played_at' },
      { key: 'mentalmath', table: 'mentalmath_logs', dateCol: 'played_at' },
      { key: 'mathmastery', table: 'mathmastery_logs', dateCol: 'played_at' },
      { key: 'nifty', table: 'nifty_logs', dateCol: 'created_at' },
      { key: 'sensex', table: 'sensex_logs', dateCol: 'created_at' },
      { key: 'sudoku', table: 'sudoku_logs', dateCol: 'played_at' },
      { key: 'memory', table: 'memory_logs', dateCol: 'played_at' },
      { key: 'wordpower', table: 'wordpower_logs', dateCol: 'played_at' },
      { key: 'barron800', table: 'barron800_logs', dateCol: 'played_at' },
      { key: 'manhattan500', table: 'manhattan500_logs', dateCol: 'played_at' },
    ];

    const results: CompletionMap = {};

    await Promise.all(tables.map(async ({ key, table, dateCol }) => {
      const { data } = await supabase
        .from(table)
        .select('player_id')
        .gte(dateCol, startOfDay)
        .lte(dateCol, endOfDay);

      const playerIds = (data || []).map((r: any) => r.player_id);
      results[key] = {
        ayaan: playerIds.includes(PLAYER_IDS.Ayaan),
        riyaan: playerIds.includes(PLAYER_IDS.Riyaan),
      };
    }));

    setCompletions(results);
  }, [getISTDateKeyToday]);

  useEffect(() => {
    fetchCompletions();

    // Re-fetch when user navigates back to this page
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCompletions();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchCompletions]);

  const CompletionBadges: React.FC<{ gameKey: string }> = ({ gameKey }) => {
    const c = completions[gameKey];
    if (!c || (!c.ayaan && !c.riyaan)) return null;
    return (
      <div className="absolute bottom-2 right-3 flex gap-1">
        {c.ayaan && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md text-[9px] font-black uppercase">
            A<Check size={8} />
          </span>
        )}
        {c.riyaan && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md text-[9px] font-black uppercase">
            R<Check size={8} />
          </span>
        )}
      </div>
    );
  };

  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number } | null>(null);
  const [isGameEnded, setIsGameEnded] = useState(false);

  const endDate = new Date('2027-01-01T00:00:00');

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

  const marketStatus = useMemo(() => {
    const effectiveDate = getEffectiveDate();
    const dateString = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(effectiveDate);
    const isClosed = isMarketHoliday(dateString);
    const detail = getHolidayDetail(dateString);
    return { isClosed, detail };
  }, [getEffectiveDate]);

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

          {/* Integrated Market Info */}
          {!isGameEnded && marketStatus.isClosed && (
            <div className="mt-4 px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-full">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                {marketStatus.detail ? `${marketStatus.detail.name} (${marketStatus.detail.type})` : 'Market Closed'}
              </p>
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
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.additionEnabled
                ? 'hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.additionEnabled ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <PlusCircle size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">ADDITION</span>
                  {!settings.additionEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.additionEnabled && marketStatus.isClosed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Dashboard & History</span>}
                </div>
              </div>
              {settings.additionMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.additionMultiplier}×</span>}
              <CompletionBadges gameKey="addition" />
            </button>

            <button
              onClick={() => settings.subtractionEnabled && onNavigate(ViewType.SUBTRACTION)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.subtractionEnabled
                ? 'hover:shadow-2xl hover:border-orange-200 dark:hover:border-orange-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.subtractionEnabled ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <MinusCircle size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">SUBTRACTION</span>
                  {!settings.subtractionEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.subtractionEnabled && marketStatus.isClosed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Dashboard & History</span>}
                </div>
              </div>
              {settings.subtractionMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.subtractionMultiplier}×</span>}
              <CompletionBadges gameKey="subtraction" />
            </button>

            <button
              onClick={() => settings.multiplicationEnabled && onNavigate(ViewType.MULTIPLICATION)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.multiplicationEnabled
                ? 'hover:shadow-2xl hover:border-violet-200 dark:hover:border-violet-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.multiplicationEnabled ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <XCircle size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">12×12</span>
                  {!settings.multiplicationEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.multiplicationEnabled && marketStatus.isClosed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Dashboard & History</span>}
                </div>
              </div>
              {settings.multiplicationMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.multiplicationMultiplier}×</span>}
              <CompletionBadges gameKey="multiplication" />
            </button>

            <button
              onClick={() => settings.multiplication25Enabled && onNavigate(ViewType.MULTIPLICATION25)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.multiplication25Enabled
                ? 'hover:shadow-2xl hover:border-teal-200 dark:hover:border-teal-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.multiplication25Enabled ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <XCircle size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">25×25</span>
                  {!settings.multiplication25Enabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.multiplication25Enabled && marketStatus.isClosed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Dashboard &amp; History</span>}
                </div>
              </div>
              {settings.multiplication25Multiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.multiplication25Multiplier}×</span>}
              <CompletionBadges gameKey="multiplication25" />
            </button>

            <button
              onClick={() => settings.multiplyEnabled && onNavigate(ViewType.MULTIPLY)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.multiplyEnabled
                ? 'hover:shadow-2xl hover:border-pink-200 dark:hover:border-pink-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.multiplyEnabled ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <XCircle size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">Multiply</span>
                  {!settings.multiplyEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.multiplyEnabled && marketStatus.isClosed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Dashboard &amp; History</span>}
                </div>
              </div>
              {settings.multiplyMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.multiplyMultiplier}×</span>}
              <CompletionBadges gameKey="multiply" />
            </button>

            <button
              onClick={() => settings.divideEnabled && onNavigate(ViewType.DIVIDE)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.divideEnabled
                ? 'hover:shadow-2xl hover:border-sky-200 dark:hover:border-sky-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.divideEnabled ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Divide size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">Divide</span>
                  {!settings.divideEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.divideEnabled && marketStatus.isClosed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Dashboard &amp; History</span>}
                </div>
              </div>
              {settings.divideMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.divideMultiplier}×</span>}
              <CompletionBadges gameKey="divide" />
            </button>

            <button
              onClick={() => settings.mentalmathEnabled && onNavigate(ViewType.MENTALMATH)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.mentalmathEnabled
                ? 'hover:shadow-2xl hover:border-cyan-200 dark:hover:border-cyan-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.mentalmathEnabled ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Brain size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">Mental Math</span>
                  {!settings.mentalmathEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.mentalmathEnabled && marketStatus.isClosed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Dashboard &amp; History</span>}
                </div>
              </div>
              {settings.mentalmathMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.mentalmathMultiplier}×</span>}
              <CompletionBadges gameKey="mentalmath" />
            </button>

            <button
              onClick={() => {
                console.log("Math Mastery clicked", { enabled: settings.mathmasteryEnabled, view: ViewType.MATHMASTERY });
                if (settings.mathmasteryEnabled) onNavigate(ViewType.MATHMASTERY);
              }}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.mathmasteryEnabled
                ? 'hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.mathmasteryEnabled ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <BrainCircuit size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase leading-none mt-1">Math Mastery</span>
                  {!settings.mathmasteryEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.mathmasteryEnabled && marketStatus.isClosed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review Dashboard &amp; History</span>}
                </div>
              </div>
              {settings.mathmasteryMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.mathmasteryMultiplier}×</span>}
              <CompletionBadges gameKey="mathmastery" />
            </button>

            <button
              onClick={() => settings.niftyEnabled && onNavigate(ViewType.NIFTY50)}
              className={`relative flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.niftyEnabled
                ? 'hover:shadow-2xl hover:border-emerald-200 dark:hover:border-emerald-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.niftyEnabled ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <TrendingUp size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">NIFTY 50</span>
                  {!settings.niftyEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.niftyEnabled && marketStatus.isClosed && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Check Picks & Logs</span>}
                </div>
              </div>
              {settings.niftyMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.niftyMultiplier}×</span>}
              <CompletionBadges gameKey="nifty" />
            </button>

            {/* ... inside the section tag in HomeView.tsx, below the Nifty 50 button ... */}

            <button
              onClick={() => settings.sensexEnabled && onNavigate(ViewType.SENSEX)}
              className={`relative flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.sensexEnabled
                ? 'hover:shadow-2xl hover:border-amber-200 dark:hover:border-amber-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.sensexEnabled
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:scale-110'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                  <TrendingUp size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">SENSEX</span>

                  {/* Follows Nifty 50 logic: No caption unless disabled or market is closed */}
                  {!settings.sensexEnabled && (
                    <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1">
                      <ShieldAlert size={10} /> Disabled by Admin
                    </span>
                  )}
                  {settings.sensexEnabled && marketStatus.isClosed && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Review Picks & Logs
                    </span>
                  )}
                </div>
              </div>
              {settings.sensexMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.sensexMultiplier}×</span>}
              <CompletionBadges gameKey="sensex" />
            </button>
            {/* ... followed by the Dashboard button ... */}

            {/* === NEW MODULES === */}

            <button
              onClick={() => settings.sudokuEnabled && onNavigate(ViewType.SUDOKU)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.sudokuEnabled
                ? 'hover:shadow-2xl hover:border-purple-200 dark:hover:border-purple-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.sudokuEnabled ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><Puzzle size={32} /></div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">SUDOKU</span>
                  {!settings.sudokuEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.sudokuEnabled && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">6×6 Logic Puzzle</span>}
                </div>
              </div>
              {settings.sudokuMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.sudokuMultiplier}×</span>}
              <CompletionBadges gameKey="sudoku" />
            </button>

            <button
              onClick={() => settings.memoryEnabled && onNavigate(ViewType.MEMORY)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.memoryEnabled
                ? 'hover:shadow-2xl hover:border-fuchsia-200 dark:hover:border-fuchsia-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.memoryEnabled ? 'bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><Layers size={32} /></div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">MEMORY</span>
                  {!settings.memoryEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.memoryEnabled && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Number Recall Game</span>}
                </div>
              </div>
              {settings.memoryMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.memoryMultiplier}×</span>}
              <CompletionBadges gameKey="memory" />
            </button>

            <button
              onClick={() => settings.wordpowerEnabled && onNavigate(ViewType.WORDPOWER)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.wordpowerEnabled
                ? 'hover:shadow-2xl hover:border-lime-200 dark:hover:border-lime-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.wordpowerEnabled ? 'bg-lime-50 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><BookOpen size={32} /></div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">WORD POWER</span>
                  {!settings.wordpowerEnabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.wordpowerEnabled && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Root Words & Etymology</span>}
                </div>
              </div>
              {settings.wordpowerMultiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.wordpowerMultiplier}×</span>}
              <CompletionBadges gameKey="wordpower" />
            </button>

            <button
              onClick={() => settings.barron800Enabled && onNavigate(ViewType.BARRON800)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.barron800Enabled
                ? 'hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.barron800Enabled ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><GraduationCap size={32} /></div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">BARRON 800</span>
                  {!settings.barron800Enabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.barron800Enabled && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">GRE Vocabulary</span>}
                </div>
              </div>
              {settings.barron800Multiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.barron800Multiplier}×</span>}
              <CompletionBadges gameKey="barron800" />
            </button>

            <button
              onClick={() => settings.manhattan500Enabled && onNavigate(ViewType.MANHATTAN500)}
              className={`relative overflow-hidden flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all group ${settings.manhattan500Enabled
                ? 'hover:shadow-2xl hover:border-cyan-200 dark:hover:border-cyan-500/50 active:scale-[0.98]'
                : 'opacity-50 grayscale cursor-not-allowed'
                }`}
            >
              <div className="flex items-center gap-6 w-full text-left">
                <div className={`p-4 rounded-2xl transition-transform ${settings.manhattan500Enabled ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 group-hover:scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}><Library size={32} /></div>
                <div className="flex flex-col items-start">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">MANHATTAN 500</span>
                  {!settings.manhattan500Enabled && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 uppercase tracking-widest mt-1"><ShieldAlert size={10} /> Disabled by Admin</span>}
                  {settings.manhattan500Enabled && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Prep Vocabulary</span>}
                </div>
              </div>
              {settings.manhattan500Multiplier !== 1 && <span className="absolute top-2 right-3 text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg tabular-nums">₹{settings.manhattan500Multiplier}×</span>}
              <CompletionBadges gameKey="manhattan500" />
            </button>

            <button
              onClick={() => onNavigate(ViewType.DAILYHISTORY)}
              className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:border-amber-200 dark:hover:border-amber-500/50 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform"><CalendarDays size={32} /></div>
                <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">DAILY HISTORY</span>
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