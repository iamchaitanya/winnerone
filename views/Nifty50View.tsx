import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, IndianRupee, User, Users, History, ChevronDown, ChevronRight, Play, Eye, TrendingUp, TrendingDown, Crown, AlertCircle, Search, Trophy, Clock, XCircle, TrendingUpDown, Timer, Coffee, BarChart, CalendarX, Lock, Delete, ShieldAlert, Medal } from 'lucide-react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { fetchAllLiveReturns, fetchStockReturn } from '../src/lib/stockFetcher';
import { NIFTY_50_SYMBOLS } from '../src/lib/constants';
import { supabase } from '../src/lib/supabase';

interface Nifty50ViewProps {
  onBack: () => void;
}

enum NiftySubView {
  HUB = 'hub',
  PIN_ENTRY = 'pin_entry',
  PLAYER_SELECT = 'player_select',
  STOCK_PICK = 'stock_pick',
  RESULTS = 'results',
  DASHBOARD = 'dashboard',
  HISTORY = 'history'
}

interface NiftySession {
  id: string;
  player: string;
  symbol: string;
  stockReturn: number;
  earnings: number;
  timestamp: number;
  isSettled?: boolean;
}

export const Nifty50View: React.FC<Nifty50ViewProps> = ({ onBack }) => {
  const [subView, setSubView] = useState<NiftySubView>(NiftySubView.HUB);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  // NEW: State to track if live data failed
  const [liveDataError, setLiveDataError] = useState(false);

  // 1. State to hold our live market data
  const [liveStockData, setLiveStockData] = useState<Record<string, { price: number; changesPercentage: number }>>({});

  // Settings
  const isPinEntryEnabled = localStorage.getItem('pin_entry_enabled') !== 'false';
  const dateOverride = localStorage.getItem('addition_date_override');

  // Persistent State
  const [niftyHistory, setNiftyHistory] = useState<NiftySession[]>(() => {
    const saved = localStorage.getItem('nifty_history');
    return saved ? JSON.parse(saved) : [];
  });

  const ayaanNiftyTotal = useMemo(() => {
    return niftyHistory
      .filter(session => session.player === 'Ayaan' && session.isSettled)
      .reduce((total, session) => total + (session.earnings || 0), 0);
  }, [niftyHistory]);

  const riyaanNiftyTotal = useMemo(() => {
    return niftyHistory
      .filter(session => session.player === 'Riyaan' && session.isSettled)
      .reduce((total, session) => total + (session.earnings || 0), 0);
  }, [niftyHistory]);

  const getEffectiveDate = useCallback(() => {
    const now = new Date();
    if (dateOverride) {
      const d = new Date(dateOverride);
      if (isNaN(d.getTime())) return now;

      if (!dateOverride.includes('T')) {
        const [y, m, day] = dateOverride.split('-').map(Number);
        const localDate = new Date();
        localDate.setFullYear(y, m - 1, day);
        localDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        return localDate;
      }
      d.setSeconds(now.getSeconds(), now.getMilliseconds());
      return d;
    }
    return now;
  }, [dateOverride]);

  // Holiday Check Helpers
  const isWeekend = useCallback((date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }, []);

  const isPublicHoliday = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return isMarketHoliday(dateStr);
  }, []);

  const isMarketOpenDay = useCallback(() => {
    const d = getEffectiveDate();
    return !isWeekend(d) && !isPublicHoliday(d);
  }, [getEffectiveDate, isWeekend, isPublicHoliday]);

  // Lockout logic
  const getUserAttempts = (user: string | null) => {
    if (!user) return 0;
    return Number(localStorage.getItem(`pin_attempts_${user.toLowerCase()}`) || '0');
  };

  const isUserLocked = (user: string | null) => {
    return getUserAttempts(user) >= 3;
  };

  const incrementAttempts = (user: string) => {
    const key = `pin_attempts_${user.toLowerCase()}`;
    const attempts = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, attempts.toString());
    return attempts;
  };

  const resetAttempts = (user: string) => {
    localStorage.setItem(`pin_attempts_${user.toLowerCase()}`, '0');
  };

  // Market Timing Helpers
  const isBeforePickDeadline = useCallback(() => {
    const d = getEffectiveDate();
    return d.getHours() < 9 && isMarketOpenDay();
  }, [getEffectiveDate, isMarketOpenDay]);

  const isAfterMarketClose = useCallback(() => {
    if (!isMarketOpenDay()) return false;
    const d = getEffectiveDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    return hours > 15 || (hours === 15 && minutes >= 30);
  }, [getEffectiveDate, isMarketOpenDay]);

  const hasPlayedToday = useCallback((player: string | null) => {
    if (!player) return false;
    const today = getEffectiveDate().toDateString();
    return niftyHistory.some(s => s.player === player && new Date(s.timestamp).toDateString() === today);
  }, [niftyHistory, getEffectiveDate]);

  const getTodaySession = useCallback((player: string | null) => {
    if (!player) return null;
    const today = getEffectiveDate().toDateString();
    return niftyHistory.find(s => s.player === player && new Date(s.timestamp).toDateString() === today);
  }, [niftyHistory, getEffectiveDate]);

  const getSiblingTodaySession = useCallback((player: string | null) => {
    const sibling = player === 'Ayaan' ? 'Riyaan' : 'Ayaan';
    const today = getEffectiveDate().toDateString();
    return niftyHistory.find(s => s.player === sibling && new Date(s.timestamp).toDateString() === today);
  }, [niftyHistory, getEffectiveDate]);

  const handleStockPick = async (symbol: string) => {
    if (isSubmitting) return; 
    
    if (!isMarketOpenDay()) {
      alert("Market is closed today (Weekend/Holiday).");
      return;
    }
    if (!isBeforePickDeadline()) {
      alert("Market entry closed! Picks must be made before 9:00 AM.");
      return;
    }
    if (hasPlayedToday(selectedUser)) return;

    const siblingSession = getSiblingTodaySession(selectedUser);
    if (siblingSession && siblingSession.symbol === symbol) {
      alert(`${siblingSession.player} already picked ${symbol}! Pick another stock.`);
      return;
    }

    setIsSubmitting(true); 

    const todayDateString = getEffectiveDate().toISOString().split('T')[0];

    try {
      const { error } = await supabase
        .from('nifty_logs')
        .insert([
          {
            date: todayDateString,
            player: selectedUser!,
            stock_symbol: symbol
          }
        ]);

      if (error) {
        console.error("Supabase insert error:", error);
        alert("Could not connect to the database. Pick not saved.");
        setIsSubmitting(false); 
        return; 
      }

      const mySession: NiftySession = {
        id: Math.random().toString(36).substr(2, 9),
        player: selectedUser!,
        symbol,
        stockReturn: 0,
        earnings: 0,
        timestamp: getEffectiveDate().getTime(),
        isSettled: false
      };

      const newHistory = [mySession, ...niftyHistory].slice(0, 500);
      setNiftyHistory(newHistory);
      localStorage.setItem('nifty_history', JSON.stringify(newHistory));
      
      setSubView(NiftySubView.RESULTS);
      
    } catch (err) {
      console.error('Error saving pick:', err);
      alert('Failed to save your pick to the server. Please check your connection.');
    } finally {
      setIsSubmitting(false); 
    }
  };

  const filteredStocks = useMemo(() => {
    return NIFTY_50_SYMBOLS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const siblingPick = useMemo(() => {
    return getSiblingTodaySession(selectedUser)?.symbol;
  }, [getSiblingTodaySession, selectedUser]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, any> = {};
    niftyHistory.forEach(s => {
      const dateKey = new Date(s.timestamp).toDateString();
      if (!groups[dateKey]) groups[dateKey] = { date: dateKey, ayaan: null, riyaan: null };
      if (s.player === 'Ayaan') groups[dateKey].ayaan = s;
      else groups[dateKey].riyaan = s;
    });
    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [niftyHistory]);

  const handleUserClick = (user: string) => {
    setSelectedUser(user);
    if (isPinEntryEnabled) {
      setPinInput('');
      setPinError(false);
      setSubView(NiftySubView.PIN_ENTRY);
    } else {
      setSubView(NiftySubView.PLAYER_SELECT);
    }
  };

  const handlePinKey = (num: string) => {
    if (isUserLocked(selectedUser) || pinError) return;
    if (pinInput.length < 6) {
      const nextVal = pinInput + num;
      setPinInput(nextVal);
      if (nextVal.length === 6) {
        verifyPin(nextVal);
      }
    }
  };

  const handlePinDelete = () => {
    if (isUserLocked(selectedUser) || pinError) return;
    setPinInput(pinInput.slice(0, -1));
    setPinError(false);
  };

  const verifyPin = (pin: string) => {
    const correctPin = selectedUser === 'Ayaan' 
      ? (localStorage.getItem('pin_ayaan') || '123456') 
      : (localStorage.getItem('pin_riyaan') || '654321');
    
    if (pin === correctPin) {
      resetAttempts(selectedUser!);
      setSubView(NiftySubView.PLAYER_SELECT);
    } else {
      setPinError(true);
      incrementAttempts(selectedUser!);
      setTimeout(() => {
        setPinInput('');
        setPinError(false);
      }, 600);
    }
  };

  // 3. Full Cloud Sync 
  useEffect(() => {
    const syncCloudHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('nifty_logs')
          .select('*')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });

        if (error || !data) return;

        const updatedHistory: NiftySession[] = data.map(dbPick => ({
          id: dbPick.id || Math.random().toString(36).substr(2, 9),
          player: dbPick.player,
          symbol: dbPick.stock_symbol,
          stockReturn: dbPick.stock_return || 0,
          earnings: dbPick.earnings || 0,
          timestamp: new Date(dbPick.created_at || `${dbPick.date}T09:00:00`).getTime(),
          isSettled: dbPick.stock_return !== null
        }));

        setNiftyHistory(updatedHistory);
        localStorage.setItem('nifty_history', JSON.stringify(updatedHistory));
      } catch (err) {
        console.error("Failed to sync cloud picks:", err);
      }
    };

    syncCloudHistory();
    
    // Background polling every 30 seconds
    const interval = setInterval(syncCloudHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  // 1. FOR THE PICKING SCREEN: Fetch Live Returns with Error Handling
  useEffect(() => {
    if (subView === NiftySubView.STOCK_PICK) {
      const loadLivePrices = async () => {
        setLiveDataError(false);
        try {
          const data = await fetchAllLiveReturns(); 
          if (data && Object.keys(data).length > 0) {
            setLiveStockData(data); 
          } else {
            console.error("Market Data fetch returned empty results.");
            setLiveDataError(true);
          }
        } catch (e) {
          console.error("Failed to fetch market data:", e);
          setLiveDataError(true);
        }
      };
      loadLivePrices();
    }
  }, [subView]); 


  if (subView === NiftySubView.HUB) {
    const ayaanPlayed = hasPlayedToday('Ayaan');
    const riyaanPlayed = hasPlayedToday('Riyaan');
    const isPickOpen = isBeforePickDeadline();
    const effectiveDate = getEffectiveDate();
    const isMarketWorkingDay = isMarketOpenDay();

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Nifty 50 Game</h1>
                {!isMarketWorkingDay && (
                  <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase rounded-full tracking-wider border border-rose-200/50 dark:border-rose-800/50">
                    Market Closed
                  </span>
                )}
              </div>
              {dateOverride && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Override Active</span>}
            </div>
          </div>
        </header>

        {/* Market Status Widget */}
        <div className="mb-8 max-w-md mx-auto">
          {!isMarketWorkingDay ? (
            <div className="p-5 rounded-[2rem] border bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30 flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                <CalendarX size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Market Status</p>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isWeekend(effectiveDate) ? 'Weekend Holiday' : isPublicHoliday(effectiveDate) ? 'Public Holiday' : 'Market Closed'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Picks and trading are disabled today.</p>
              </div>
            </div>
          ) : (
            <div className={`p-5 rounded-[2rem] border shadow-sm ${isPickOpen ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30' : isAfterMarketClose() ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl shadow-lg ${isPickOpen ? 'bg-indigo-500 text-white shadow-indigo-500/20' : isAfterMarketClose() ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-500 text-white shadow-blue-500/20'}`}>
                    {isPickOpen ? <Timer size={20} /> : isAfterMarketClose() ? <BarChart size={20} /> : <Coffee size={20} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Current Window</p>
                    <p className="text-sm font-black uppercase tracking-tight">
                      {isPickOpen ? 'Accepting Picks' : isAfterMarketClose() ? 'Results Ready' : 'Market Trading'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Settlement</p>
                  <p className="text-sm font-black tabular-nums">15:30 IST</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="flex flex-col gap-4 max-w-md mx-auto">
          <button onClick={() => handleUserClick('Ayaan')} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl transition-all group hover:border-indigo-400 active:scale-[0.98]">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                {isUserLocked('Ayaan') ? <Lock size={32} className="text-rose-500" /> : <User size={32} />}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className={`font-black text-2xl tracking-tighter uppercase leading-none ${isUserLocked('Ayaan') ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  AYAAN {isUserLocked('Ayaan') && '(LOCKED)'}
                </span>
                {ayaanPlayed && !isUserLocked('Ayaan') && <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><Check size={10} /> Picked Today</span>}
              </div>
            </div>
          </button>
          <button onClick={() => handleUserClick('Riyaan')} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl transition-all group hover:border-rose-400 active:scale-[0.98]">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl group-hover:scale-110 transition-transform">
                {isUserLocked('Riyaan') ? <Lock size={32} className="text-rose-500" /> : <Users size={32} />}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className={`font-black text-2xl tracking-tighter uppercase leading-none ${isUserLocked('Riyaan') ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  RIYAAN {isUserLocked('Riyaan') && '(LOCKED)'}
                </span>
                {riyaanPlayed && !isUserLocked('Riyaan') && <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><Check size={10} /> Picked Today</span>}
              </div>
            </div>
          </button>
          <button onClick={() => setSubView(NiftySubView.DASHBOARD)} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:border-amber-400 transition-all group">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform"><Trophy size={32} /></div>
              <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">LEADERBOARD</span>
            </div>
          </button>
          <button onClick={() => setSubView(NiftySubView.HISTORY)} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:border-indigo-400 transition-all group">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform"><History size={32} /></div>
              <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">MARKET LOG</span>
            </div>
          </button>
        </section>
      </div>
    );
  }

  if (subView === NiftySubView.PIN_ENTRY) {
    const locked = isUserLocked(selectedUser);
    const attempts = getUserAttempts(selectedUser);
    const attemptsLeft = Math.max(0, 3 - attempts);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-300">
        <div className="mb-8 text-center">
          <div className={`w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-800 ${locked ? 'ring-4 ring-rose-500/20' : ''}`}>
            {locked ? <ShieldAlert size={32} className="text-rose-500 animate-pulse" /> : <Lock size={32} className="text-indigo-500" />}
          </div>
          <h2 className={`text-2xl font-black uppercase tracking-tighter ${locked ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
            {locked ? 'Account Locked' : 'Enter PIN'}
          </h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Hello, {selectedUser}</p>
        </div>

        {locked ? (
          <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-800/50 max-w-xs text-center mb-8">
            <p className="text-rose-600 dark:text-rose-400 font-bold text-sm leading-relaxed">Too many wrong attempts. Please contact the administrator to unlock your account.</p>
          </div>
        ) : (
          <>
            <div className={`flex gap-3 mb-6 ${pinError ? 'animate-shake' : ''}`}>
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                    pinError ? 'bg-rose-500 border-rose-500 scale-110 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 
                    i < pinInput.length ? 'bg-indigo-500 border-indigo-500 scale-110 shadow-[0_0_12px_rgba(99,102,241,0.3)]' : 'bg-transparent border-slate-200 dark:border-slate-800'
                  }`}
                />
              ))}
            </div>

            <div className="h-10 mb-8 flex flex-col items-center justify-center">
              {pinError ? (
                <p className="text-rose-500 font-black text-xs uppercase tracking-[0.2em] animate-bounce">Incorrect PIN</p>
              ) : (
                attempts > 0 && (
                  <p className={`text-[10px] font-black uppercase tracking-widest ${attemptsLeft === 1 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                    {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
                  </p>
                )
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num} 
                  disabled={pinError}
                  onClick={() => handlePinKey(num.toString())}
                  className="h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-2xl font-black text-slate-900 dark:text-white active:scale-90 transition-transform disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <div />
              <button 
                disabled={pinError}
                onClick={() => handlePinKey('0')}
                className="h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-2xl font-black text-slate-900 dark:text-white active:scale-90 transition-transform disabled:opacity-50"
              >
                0
              </button>
              <button 
                disabled={pinError}
                onClick={handlePinDelete}
                className="h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 active:scale-90 transition-transform disabled:opacity-50"
              >
                <Delete size={24} />
              </button>
            </div>
          </>
        )}

        <button onClick={() => setSubView(NiftySubView.HUB)} className="mt-12 text-slate-400 font-bold text-sm uppercase tracking-widest">Back</button>
      </div>
    );
  }

  if (subView === NiftySubView.PLAYER_SELECT) {
    const isPlayed = hasPlayedToday(selectedUser);
    const isPickWindow = isBeforePickDeadline();
    const isMarketWorking = isMarketOpenDay();

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
            <button onClick={() => setSubView(NiftySubView.RESULTS)} className="w-full max-w-xs h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl mx-auto block">
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
                <button onClick={() => setSubView(NiftySubView.STOCK_PICK)} className="w-full max-w-xs h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl mx-auto block">
                  <Play size={24} fill="currentColor" /> CHOOSE STOCK
                </button>
              </>
            )}
          </>
        )}
        <button onClick={() => setSubView(NiftySubView.HUB)} className="mt-8 text-slate-400 font-bold text-sm uppercase tracking-widest">Back</button>
      </div>
    );
  }

  if (subView === NiftySubView.STOCK_PICK) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
        <header className="flex flex-col gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSubView(NiftySubView.PLAYER_SELECT)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
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
        
        {/* NEW: Warning Banner for Empty Live Data */}
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
                onClick={() => handleStockPick(stock)}
                className={`h-24 border rounded-2xl flex flex-col items-center justify-center shadow-sm transition-all group ${
                  isTaken 
                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed' 
                  : isSubmitting
                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-70 cursor-wait'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-400 active:scale-95'
                }`}
              >
                <span className={`text-sm font-black ${isTaken ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{stock}</span>
                
                {/* Use the new object structure safely */}
                {liveStockData && liveStockData[stock] ? (
                  <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${liveStockData[stock].changesPercentage >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    ₹{(liveStockData[stock].price || 0).toFixed(2)} 
                    ({liveStockData[stock].changesPercentage > 0 ? '+' : ''}{(liveStockData[stock].changesPercentage || 0).toFixed(2)}%)
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
  }

  if (subView === NiftySubView.RESULTS) {
    const mySession = getTodaySession(selectedUser);
    const sibSession = getSiblingTodaySession(selectedUser);
    const isReady = isAfterMarketClose();

    if (!mySession) return null;

    // Show a loading state while fetching real NSE prices
    if (isSettling || (isReady && !mySession.isSettled)) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Fetching NSE Data</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Connecting to Market via FMP...</p>
        </div>
      );
    }

    // Winner & Overall Performance Logic
    const hasWinner = isReady && sibSession && mySession.stockReturn !== sibSession.stockReturn;
    const winnerPlayer = hasWinner 
      ? (mySession.stockReturn > sibSession.stockReturn ? mySession.player : sibSession.player)
      : null;
    
    const dailyTotalEarnings = isReady ? (mySession.earnings + (sibSession?.earnings || 0)) : 0;
    const isDailyTotalPositive = dailyTotalEarnings > 0;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500 text-center">
        {!isReady ? (
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 animate-pulse">
            <Clock size={48} />
          </div>
        ) : (
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${mySession.earnings > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : mySession.earnings < 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            {mySession.earnings > 0 ? <TrendingUp size={48} /> : mySession.earnings < 0 ? <TrendingDown size={48} /> : <TrendingUpDown size={48} />}
          </div>
        )}

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          {isReady ? "Market Result" : "Market Live"}
        </h2>
        
        {isReady ? (
          <div className={`text-6xl font-black mb-8 tabular-nums ${mySession.earnings > 0 ? 'text-emerald-500' : mySession.earnings < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
            {mySession.earnings > 0 ? '+' : ''}₹{mySession.earnings.toLocaleString()}
          </div>
        ) : (
          <div className="px-8 py-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trading Hours</p>
            <p className="text-lg font-black text-blue-500 uppercase tracking-tight">Closes at 15:30</p>
          </div>
        )}

        {/* Overall Summary Badge */}
        {isReady && (
          <div className={`mb-8 px-6 py-2 rounded-full border flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${isDailyTotalPositive ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-800' : dailyTotalEarnings < 0 ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            Daily Group Status: <span className="tabular-nums">₹{dailyTotalEarnings.toLocaleString()}</span>
            {isDailyTotalPositive ? <TrendingUp size={12} /> : dailyTotalEarnings < 0 ? <TrendingDown size={12} /> : null}
          </div>
        )}

        <div className="w-full max-w-sm space-y-4 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
            {/* My Pick Card */}
            <div className={`p-6 flex items-center justify-between transition-colors relative ${winnerPlayer === mySession.player ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''}`}>
              {winnerPlayer === mySession.player && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                  <Medal size={8} fill="currentColor" /> Day's Top Pick
                </div>
              )}
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                  Your Pick ({mySession.player}) 
                  {winnerPlayer === mySession.player && <span className="text-amber-500"><Trophy size={10} fill="currentColor" /></span>}
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{mySession.symbol}</p>
              </div>
              <div className="text-right">
                {isReady ? (
                  <div className={`flex flex-col items-end`}>
                    <div className={`flex items-center gap-1 font-black ${mySession.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {mySession.stockReturn >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {mySession.stockReturn.toFixed(2)}%
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">₹{mySession.earnings}</p>
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                )}
              </div>
            </div>

            {/* Sibling Pick Card */}
            {sibSession && (
              <div className={`p-6 flex items-center justify-between transition-colors relative ${winnerPlayer === sibSession.player ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
                {winnerPlayer === sibSession.player && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                    <Medal size={8} fill="currentColor" /> Day's Top Pick
                  </div>
                )}
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                    Sibling's Pick ({sibSession.player})
                    {winnerPlayer === sibSession.player && <span className="text-amber-500"><Trophy size={10} fill="currentColor" /></span>}
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{sibSession.symbol}</p>
                </div>
                <div className="text-right">
                  {isReady ? (
                    <div className={`flex flex-col items-end`}>
                      <div className={`flex items-center gap-1 font-black ${sibSession.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {sibSession.stockReturn >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {sibSession.stockReturn.toFixed(2)}%
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">₹{sibSession.earnings}</p>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setSubView(NiftySubView.HUB)} className="w-full max-w-sm h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg tracking-widest uppercase shadow-xl active:scale-95 transition-all mx-auto block">CONTINUE</button>
      </div>
    );
  }

  if (subView === NiftySubView.DASHBOARD) {
    const isAyaanLeading = ayaanNiftyTotal >= riyaanNiftyTotal;
    const leader = isAyaanLeading ? { name: 'Ayaan', total: ayaanNiftyTotal, color: 'indigo', icon: User } : { name: 'Riyaan', total: riyaanNiftyTotal, color: 'rose', icon: Users };
    const runner = isAyaanLeading ? { name: 'Riyaan', total: riyaanNiftyTotal, color: 'rose', icon: Users } : { name: 'Ayaan', total: ayaanNiftyTotal, color: 'indigo', icon: User };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300 overflow-x-hidden">
        <div className="max-w-2xl mx-auto w-full">
          <header className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nifty Leaderboard</h1>
          </header>
          
          <div className="flex flex-col items-center w-full">
            <div className="relative flex items-center justify-center w-full h-64 sm:h-80 mb-6">
              <div className="flex items-center justify-center">
                <div className={`relative z-20 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-white dark:bg-slate-900 border-[6px] border-${leader.color}-500 flex flex-col items-center justify-center shadow-2xl animate-in zoom-in duration-700 overflow-hidden`}>
                  <div className="absolute top-3 sm:top-4 bg-amber-400 text-white p-1.5 sm:p-2 rounded-full shadow-lg ring-4 ring-white dark:ring-slate-950"><Crown size={20} fill="currentColor" /></div>
                  <leader.icon size={32} className={`text-${leader.color}-500 mb-1 mt-4 sm:mt-6`} />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{leader.name}</h3>
                  <div className="flex items-center justify-center gap-0.5 w-full px-3">
                    <IndianRupee size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{leader.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className={`relative z-10 -ml-10 sm:-ml-12 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-white dark:bg-slate-900 border-2 border-${runner.color}-300 flex flex-col items-center justify-center shadow-xl animate-in zoom-in duration-1000 delay-300 overflow-hidden`}>
                  <runner.icon size={20} className={`text-${runner.color}-400 mb-1`} />
                  <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{runner.name}</h3>
                  <div className="flex items-center justify-center gap-0.5 w-full px-3">
                    <IndianRupee size={10} className="text-slate-400 flex-shrink-0" />
                    <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{runner.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full mt-4 mb-24 px-1">
              <button onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)} className="w-full h-14 flex items-center justify-between gap-2 mb-4 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <History size={18} className="text-indigo-500" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Summary</h2>
                </div>
                {isHistoryCollapsed ? <ChevronRight size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              
              {!isHistoryCollapsed && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300 w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                      <thead>
                        <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                          <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                          <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ayaan</th>
                          <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Riyaan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {groupedHistory.length > 0 ? (
                          groupedHistory.map((record: any) => (
                            <tr key={record.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-5 whitespace-nowrap">
                                <span className="text-[11px] text-slate-900 dark:text-slate-200 font-bold tabular-nums">{record.date.split(' ').slice(1, 3).join(' ')}</span>
                              </td>
                              <td className="px-5 py-5 text-center">
                                {record.ayaan ? (
                                  <div className="flex flex-col">
                                    <span className={`text-sm font-black ${record.ayaan.isSettled ? (record.ayaan.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-400'}`}>
                                      {record.ayaan.isSettled ? (record.ayaan.earnings > 0 ? '+' : '') + record.ayaan.earnings.toLocaleString() : 'PENDING'}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{record.ayaan.symbol}</span>
                                  </div>
                                ) : <span className="text-slate-200 dark:text-slate-800">—</span>}
                              </td>
                              <td className="px-5 py-5 text-center">
                                {record.riyaan ? (
                                  <div className="flex flex-col">
                                    <span className={`text-sm font-black ${record.riyaan.isSettled ? (record.riyaan.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-400'}`}>
                                      {record.riyaan.isSettled ? (record.riyaan.earnings > 0 ? '+' : '') + record.riyaan.earnings.toLocaleString() : 'PENDING'}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{record.riyaan.symbol}</span>
                                  </div>
                                ) : <span className="text-slate-200 dark:text-slate-800">—</span>}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={3} className="px-5 py-16 text-center text-slate-400 text-xs italic">No entries yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subView === NiftySubView.HISTORY) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300">
        <header className="flex flex-col gap-6 mb-8 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => setSubView(NiftySubView.HUB)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Market Log</h1>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden max-w-2xl mx-auto w-full mb-24">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto border-collapse">
              <thead>
                <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] text-center border-x border-slate-50 dark:border-slate-800">Ayaan</th>
                  <th className="px-6 py-5 text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.2em] text-center">Riyaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {groupedHistory.length > 0 ? (
                  groupedHistory.map((record: any) => (
                    <tr key={record.date} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                          {record.date.split(' ').slice(1, 3).join(' ')}
                        </span>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                          {record.date.split(' ')[3]}
                        </div>
                      </td>
                      
                      <td className="px-6 py-6 text-center border-x border-slate-50 dark:border-slate-800">
                        {record.ayaan ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.ayaan.symbol}</span>
                            <div className={`flex items-center gap-1 mt-1 text-[11px] font-black tabular-nums ${record.ayaan.isSettled ? (record.ayaan.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-400'}`}>
                              {record.ayaan.isSettled ? (
                                <>
                                  {record.ayaan.stockReturn >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                  {record.ayaan.stockReturn.toFixed(2)}%
                                </>
                              ) : 'PENDING'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-200 dark:text-slate-800 font-black">—</span>
                        )}
                      </td>

                      <td className="px-6 py-6 text-center">
                        {record.riyaan ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.riyaan.symbol}</span>
                            <div className={`flex items-center gap-1 mt-1 text-[11px] font-black tabular-nums ${record.riyaan.isSettled ? (record.riyaan.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-400'}`}>
                              {record.riyaan.isSettled ? (
                                <>
                                  {record.riyaan.stockReturn >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                  {record.riyaan.stockReturn.toFixed(2)}%
                                </>
                              ) : 'PENDING'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-200 dark:text-slate-800 font-black">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                          <History size={32} className="text-slate-200 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">No market picks logged yet</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
};