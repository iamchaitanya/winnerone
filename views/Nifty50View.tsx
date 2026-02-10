
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, IndianRupee, User, Users, BarChart2, History, ChevronDown, ChevronRight, Play, Eye, TrendingUp, TrendingDown, Crown, AlertCircle, Search, Trophy, Clock, XCircle } from 'lucide-react';

interface Nifty50ViewProps {
  onBack: () => void;
}

enum NiftySubView {
  HUB = 'hub',
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
}

const NIFTY_50_SYMBOLS = [
  'ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'ASIANPAINT', 'AXISBANK', 'BAJAJ-AUTO', 'BAJFINANCE', 'BAJAJFINSV', 'BPCL', 'BHARTIARTL',
  'BRITANNIA', 'CIPLA', 'COALINDIA', 'DIVISLAB', 'DRREDDY', 'EICHERMOT', 'GRASIM', 'HCLTECH', 'HDFCBANK', 'HDFCLIFE',
  'HEROMOTOCO', 'HINDALCO', 'HINDUNILVR', 'ICICIBANK', 'ITC', 'INDUSINDBK', 'INFY', 'JSWSTEEL', 'KOTAKBANK', 'LT',
  'M&M', 'MARUTI', 'NTPC', 'NESTLEIND', 'ONGC', 'POWERGRID', 'RELIANCE', 'SBILIFE', 'SBIN', 'SUNPHARMA',
  'TCS', 'TATACONSUM', 'TATAMOTORS', 'TATASTEEL', 'TECHM', 'TITAN', 'UPL', 'ULTRACEMCO', 'WIPRO'
];

export const Nifty50View: React.FC<Nifty50ViewProps> = ({ onBack }) => {
  const [subView, setSubView] = useState<NiftySubView>(NiftySubView.HUB);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);

  // Persistent State
  const [ayaanNiftyTotal, setAyaanNiftyTotal] = useState<number>(() => Number(localStorage.getItem('ayaan_nifty_total') || '0'));
  const [riyaanNiftyTotal, setRiyaanNiftyTotal] = useState<number>(() => Number(localStorage.getItem('riyaan_nifty_total') || '0'));
  const [niftyHistory, setNiftyHistory] = useState<NiftySession[]>(() => {
    const saved = localStorage.getItem('nifty_history');
    return saved ? JSON.parse(saved) : [];
  });

  const dateOverride = localStorage.getItem('addition_date_override');

  const getEffectiveDate = useCallback(() => {
    if (dateOverride) {
      const d = new Date(dateOverride);
      const now = new Date();
      d.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      return d;
    }
    return new Date();
  }, [dateOverride]);

  const hasPlayedToday = useCallback((player: string | null) => {
    if (!player) return false;
    const today = getEffectiveDate().toDateString();
    return niftyHistory.some(s => s.player === player && new Date(s.timestamp).toDateString() === today);
  }, [niftyHistory, getEffectiveDate]);

  const getSiblingTodaySession = useCallback((player: string | null) => {
    const sibling = player === 'Ayaan' ? 'Riyaan' : 'Ayaan';
    const today = getEffectiveDate().toDateString();
    return niftyHistory.find(s => s.player === sibling && new Date(s.timestamp).toDateString() === today);
  }, [niftyHistory, getEffectiveDate]);

  const getTodaySession = useCallback((player: string | null) => {
    if (!player) return null;
    const today = getEffectiveDate().toDateString();
    return niftyHistory.find(s => s.player === player && new Date(s.timestamp).toDateString() === today);
  }, [niftyHistory, getEffectiveDate]);

  // Generate deterministic returns for the day based on the date string
  const getMarketReturnsForDay = useCallback((dateStr: string) => {
    const seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const returns: Record<string, number> = {};
    NIFTY_50_SYMBOLS.forEach((sym, idx) => {
      returns[sym] = (seededRandom(seed + idx) * 10 - 5);
    });
    return returns;
  }, []);

  const handleStockPick = (symbol: string) => {
    if (hasPlayedToday(selectedUser)) return;

    const todayStr = getEffectiveDate().toDateString();
    const siblingSession = getSiblingTodaySession(selectedUser);
    
    if (siblingSession && siblingSession.symbol === symbol) {
      alert(`${siblingSession.player} already picked ${symbol}! Pick another stock.`);
      return;
    }

    const allReturns = getMarketReturnsForDay(todayStr);
    const myReturn = allReturns[symbol];
    
    let myEarnings = 0;
    let newHistory = [...niftyHistory];
    let newAyaanTotal = ayaanNiftyTotal;
    let newRiyaanTotal = riyaanNiftyTotal;

    if (myReturn < 0) {
      myEarnings = -100;
    } else {
      if (siblingSession) {
        if (myReturn > siblingSession.stockReturn) {
          myEarnings = 100;
          if (siblingSession.earnings === 100) {
            const updatedSibling = { ...siblingSession, earnings: 0 };
            newHistory = newHistory.map(h => h.id === siblingSession.id ? updatedSibling : h);
            if (siblingSession.player === 'Ayaan') newAyaanTotal -= 100;
            else newRiyaanTotal -= 100;
          }
        } else if (myReturn < siblingSession.stockReturn) {
          myEarnings = 0;
          if (siblingSession.stockReturn > 0 && siblingSession.earnings === 0) {
            const updatedSibling = { ...siblingSession, earnings: 100 };
            newHistory = newHistory.map(h => h.id === siblingSession.id ? updatedSibling : h);
            if (siblingSession.player === 'Ayaan') newAyaanTotal += 100;
            else newRiyaanTotal += 100;
          }
        }
      } else {
        myEarnings = 100;
      }
    }

    if (selectedUser === 'Ayaan') newAyaanTotal += myEarnings;
    else newRiyaanTotal += myEarnings;

    const mySession: NiftySession = {
      id: Math.random().toString(36).substr(2, 9),
      player: selectedUser!,
      symbol,
      stockReturn: myReturn,
      earnings: myEarnings,
      timestamp: getEffectiveDate().getTime(),
    };

    newHistory = [mySession, ...newHistory].slice(0, 500);
    
    setNiftyHistory(newHistory);
    setAyaanNiftyTotal(newAyaanTotal);
    setRiyaanNiftyTotal(newRiyaanTotal);
    localStorage.setItem('nifty_history', JSON.stringify(newHistory));
    localStorage.setItem('ayaan_nifty_total', newAyaanTotal.toString());
    localStorage.setItem('riyaan_nifty_total', newRiyaanTotal.toString());
    
    setSubView(NiftySubView.RESULTS);
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

  if (subView === NiftySubView.HUB) {
    const ayaanPlayed = hasPlayedToday('Ayaan');
    const riyaanPlayed = hasPlayedToday('Riyaan');

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Nifty 50 Game</h1>
              {dateOverride && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Override Active</span>}
            </div>
          </div>
        </header>
        <section className="flex flex-col gap-4 max-w-md mx-auto">
          <button onClick={() => { setSelectedUser('Ayaan'); setSubView(NiftySubView.PLAYER_SELECT); }} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl transition-all group hover:border-indigo-400 active:scale-[0.98]">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform"><User size={32} /></div>
              <div className="flex flex-col items-start text-left">
                <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase leading-none">AYAAN</span>
                {ayaanPlayed && <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><Check size={10} /> Picked Today</span>}
              </div>
            </div>
          </button>
          <button onClick={() => { setSelectedUser('Riyaan'); setSubView(NiftySubView.PLAYER_SELECT); }} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl transition-all group hover:border-rose-400 active:scale-[0.98]">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl group-hover:scale-110 transition-transform"><Users size={32} /></div>
              <div className="flex flex-col items-start text-left">
                <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase leading-none">RIYAAN</span>
                {riyaanPlayed && <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><Check size={10} /> Picked Today</span>}
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

  if (subView === NiftySubView.PLAYER_SELECT) {
    const isPlayed = hasPlayedToday(selectedUser);
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
              <Eye size={20} /> VIEW TODAY'S RESULT
            </button>
          </>
        ) : (
          <>
            <p className="text-slate-400 font-medium mb-12 uppercase tracking-widest text-xs px-8 leading-relaxed">Choose a stock. Higher return wins ₹100. Negative return loses ₹100.</p>
            <button onClick={() => setSubView(NiftySubView.STOCK_PICK)} className="w-full max-w-xs h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl mx-auto block">
              <Play size={24} fill="currentColor" /> START
            </button>
          </>
        )}
        <button onClick={() => setSubView(NiftySubView.HUB)} className="mt-8 text-slate-400 font-bold text-sm uppercase tracking-widest">Back</button>
      </div>
    );
  }

  if (subView === NiftySubView.STOCK_PICK) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
        <header className="flex items-center gap-4 mb-8">
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
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pb-12">
          {filteredStocks.map(stock => {
            const isTaken = stock === siblingPick;
            return (
              <button 
                key={stock} 
                disabled={isTaken}
                onClick={() => handleStockPick(stock)}
                className={`h-24 border rounded-2xl flex flex-col items-center justify-center shadow-sm transition-all group ${
                  isTaken 
                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-400 active:scale-95'
                }`}
              >
                <span className={`text-sm font-black ${isTaken ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{stock}</span>
                {isTaken ? (
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
    if (!mySession) return null;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${mySession.earnings > 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : mySession.earnings < 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          {mySession.earnings > 0 ? <Trophy size={48} /> : <IndianRupee size={48} />}
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Today's Earnings</h2>
        <div className={`text-6xl font-black mb-8 tabular-nums ${mySession.earnings > 0 ? 'text-emerald-500' : mySession.earnings < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
          {mySession.earnings > 0 ? '+' : ''}₹{mySession.earnings}
        </div>

        <div className="w-full max-w-sm space-y-4 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
            <div className="p-6 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Your Pick ({mySession.player})</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{mySession.symbol}</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 font-black ${mySession.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {mySession.stockReturn >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {mySession.stockReturn.toFixed(2)}%
                </div>
                {mySession.earnings > 0 && <span className="text-[10px] font-black text-emerald-500 uppercase">WINNER</span>}
                {mySession.earnings < 0 && <span className="text-[10px] font-black text-rose-500 uppercase">NEGATIVE LOSS</span>}
              </div>
            </div>

            {sibSession ? (
              <div className="p-6 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sibling's Pick ({sibSession.player})</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{sibSession.symbol}</p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 font-black ${sibSession.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {sibSession.stockReturn >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {sibSession.stockReturn.toFixed(2)}%
                  </div>
                  {sibSession.earnings > 0 && <span className="text-[10px] font-black text-emerald-500 uppercase">WINNER</span>}
                  {sibSession.earnings < 0 && <span className="text-[10px] font-black text-rose-500 uppercase">NEGATIVE LOSS</span>}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 flex flex-col items-center gap-2">
                <Clock size={20} />
                <p className="text-[10px] font-black uppercase tracking-widest">Waiting for Sibling's Pick...</p>
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
            <button onClick={() => setSubView(NiftySubView.HUB)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
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
                                    <span className={`text-sm font-black ${record.ayaan.earnings > 0 ? 'text-emerald-500' : record.ayaan.earnings < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                      {record.ayaan.earnings > 0 ? '+' : ''}{record.ayaan.earnings}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{record.ayaan.symbol}</span>
                                  </div>
                                ) : <span className="text-slate-200 dark:text-slate-800">—</span>}
                              </td>
                              <td className="px-5 py-5 text-center">
                                {record.riyaan ? (
                                  <div className="flex flex-col">
                                    <span className={`text-sm font-black ${record.riyaan.earnings > 0 ? 'text-emerald-500' : record.riyaan.earnings < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                                      {record.riyaan.earnings > 0 ? '+' : ''}{record.riyaan.earnings}
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
                      
                      {/* Ayaan Column */}
                      <td className="px-6 py-6 text-center border-x border-slate-50 dark:border-slate-800">
                        {record.ayaan ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.ayaan.symbol}</span>
                            <div className={`flex items-center gap-1 mt-1 text-[11px] font-black tabular-nums ${record.ayaan.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {record.ayaan.stockReturn >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {record.ayaan.stockReturn.toFixed(2)}%
                            </div>
                            {record.ayaan.earnings > 0 && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">Winner</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-200 dark:text-slate-800 font-black">—</span>
                        )}
                      </td>

                      {/* Riyaan Column */}
                      <td className="px-6 py-6 text-center">
                        {record.riyaan ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.riyaan.symbol}</span>
                            <div className={`flex items-center gap-1 mt-1 text-[11px] font-black tabular-nums ${record.riyaan.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {record.riyaan.stockReturn >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {record.riyaan.stockReturn.toFixed(2)}%
                            </div>
                            {record.riyaan.earnings > 0 && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">Winner</span>
                              </div>
                            )}
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
