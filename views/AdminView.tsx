
import React, { useState } from 'react';
import { ArrowLeft, Lock, Settings, Calendar, RotateCcw, ShieldAlert, Trash2, History, Clock, ToggleLeft, ToggleRight, Gamepad2 } from 'lucide-react';

interface AdminViewProps {
  onBack: () => void;
}

interface GameSession {
  id: string;
  player: string;
  score: number;
  wrong: number;
  earnings: number;
  timestamp: number;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // App settings state
  const [dateOverride, setDateOverride] = useState<string | null>(() => localStorage.getItem('addition_date_override'));
  const [isAdditionEnabled, setIsAdditionEnabled] = useState(() => localStorage.getItem('game_enabled_addition') !== 'false');
  const [isNiftyEnabled, setIsNiftyEnabled] = useState(() => localStorage.getItem('game_enabled_nifty') !== 'false');

  const [history, setHistory] = useState<GameSession[]>(() => {
    const saved = localStorage.getItem('addition_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [ayaanTotal, setAyaanTotal] = useState<number>(() => Number(localStorage.getItem('ayaan_earnings') || '0'));
  const [riyaanTotal, setRiyaanTotal] = useState<number>(() => Number(localStorage.getItem('riyaan_earnings') || '0'));

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin') {
      setIsAuthenticated(true);
      setAdminError('');
    } else {
      setAdminError('Incorrect password');
    }
  };

  const toggleAddition = () => {
    const newVal = !isAdditionEnabled;
    setIsAdditionEnabled(newVal);
    localStorage.setItem('game_enabled_addition', newVal.toString());
  };

  const toggleNifty = () => {
    const newVal = !isNiftyEnabled;
    setIsNiftyEnabled(newVal);
    localStorage.setItem('game_enabled_nifty', newVal.toString());
  };

  const updateDateOverride = (val: string) => {
    setDateOverride(val);
    localStorage.setItem('addition_date_override', val);
  };

  const clearDateOverride = () => {
    setDateOverride(null);
    localStorage.removeItem('addition_date_override');
  };

  const deleteSession = (sessionId: string) => {
    const sessionToDelete = history.find(s => s.id === sessionId);
    if (!sessionToDelete) return;

    if (sessionToDelete.player === 'Ayaan') {
      const newVal = Math.max(0, ayaanTotal - sessionToDelete.earnings);
      setAyaanTotal(newVal);
      localStorage.setItem('ayaan_earnings', newVal.toString());
    } else {
      const newVal = Math.max(0, riyaanTotal - sessionToDelete.earnings);
      setRiyaanTotal(newVal);
      localStorage.setItem('riyaan_earnings', newVal.toString());
    }

    const updatedHistory = history.filter(s => s.id !== sessionId);
    setHistory(updatedHistory);
    localStorage.setItem('addition_history', JSON.stringify(updatedHistory));
  };

  const resetAllData = () => {
    if (confirm('Are you absolutely sure? This will delete all scores and history across the app.')) {
      setAyaanTotal(0);
      setRiyaanTotal(0);
      setHistory([]);
      localStorage.removeItem('ayaan_earnings');
      localStorage.removeItem('riyaan_earnings');
      localStorage.removeItem('addition_history');
      localStorage.removeItem('addition_date_override');
      
      // Nifty Specific reset
      localStorage.removeItem('ayaan_nifty_total');
      localStorage.removeItem('riyaan_nifty_total');
      localStorage.removeItem('nifty_history');
      
      setDateOverride(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-slate-900 dark:bg-white rounded-3xl flex items-center justify-center mb-8">
          <Settings size={40} className="text-white dark:text-slate-900" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-widest">Admin Access</h2>
        <form onSubmit={handleAdminLogin} className="w-full max-w-xs space-y-4">
          <input 
            type="password" 
            placeholder="PIN Code"
            autoFocus
            className="w-full h-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-2xl font-black tracking-[0.5em] focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
          {adminError && <p className="text-center text-rose-500 text-xs font-bold uppercase tracking-widest">{adminError}</p>}
          <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Unlock</button>
        </form>
        <button onClick={onBack} className="mt-8 text-slate-400 font-bold text-sm uppercase tracking-widest">Cancel</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">System Admin</h1>
        </div>
      </header>

      <div className="space-y-6 pb-24 max-w-md mx-auto">
        {/* Game Management */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Gamepad2 size={20} className="text-indigo-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Game Management</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Addition Game</span>
              <button onClick={toggleAddition} className="transition-colors">
                {isAdditionEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300 dark:text-slate-700" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Nifty 50 Game</span>
              <button onClick={toggleNifty} className="transition-colors">
                {isNiftyEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300 dark:text-slate-700" />}
              </button>
            </div>
          </div>
        </div>

        {/* App Date Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Calendar size={20} className="text-indigo-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">System Date</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Override Date</label>
              <input 
                type="date" 
                className="w-full h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all"
                value={dateOverride || ''}
                onChange={(e) => updateDateOverride(e.target.value)}
              />
            </div>
            
            {dateOverride && (
              <button 
                onClick={clearDateOverride}
                className="w-full h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:bg-indigo-100 transition-colors"
              >
                <RotateCcw size={18} /> Reset to Real-time
              </button>
            )}
            
            {!dateOverride && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold leading-relaxed">
                  Currently using actual real-time: <span className="tabular-nums">{new Date().toDateString()}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Master Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert size={20} className="text-rose-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Master Controls</h2>
          </div>
          <button 
            onClick={resetAllData}
            className="w-full h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 active:bg-rose-100 transition-colors"
          >
            <Trash2 size={18} /> Reset All App Data
          </button>
        </div>

        {/* Manage Sessions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <History size={18} className="text-indigo-500" /> Manage Sessions
            </h2>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {history.length > 0 ? history.map((session) => (
              <div key={session.id} className="p-4 flex items-center justify-between group">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{session.player}</span>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">{new Date(session.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="text-sm font-black text-emerald-500 tabular-nums">₹{session.earnings} <span className="text-[10px] text-slate-400 font-medium tracking-normal ml-1">({session.score} correct)</span></span>
                </div>
                <button 
                  onClick={() => deleteSession(session.id)}
                  className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )) : (
              <div className="p-12 text-center">
                <p className="text-slate-400 text-xs italic">No history to manage.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
