
import React, { useState } from 'react';
import { ArrowLeft, Settings, Calendar, RotateCcw, ShieldAlert, ToggleLeft, ToggleRight, Gamepad2, Clock, Lock, Key, RefreshCw, UserCheck, Trash2, AlertTriangle, Fingerprint } from 'lucide-react';

interface AdminViewProps {
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // App settings state
  const [dateOverride, setDateOverride] = useState<string | null>(() => localStorage.getItem('addition_date_override'));
  const [isAdditionEnabled, setIsAdditionEnabled] = useState(() => localStorage.getItem('game_enabled_addition') !== 'false');
  const [isNiftyEnabled, setIsNiftyEnabled] = useState(() => localStorage.getItem('game_enabled_nifty') !== 'false');
  const [isPinEntryEnabled, setIsPinEntryEnabled] = useState(() => localStorage.getItem('pin_entry_enabled') !== 'false');
  
  // User PINs & Attempts
  const [ayaanPin, setAyaanPin] = useState(() => localStorage.getItem('pin_ayaan') || '123456');
  const [riyaanPin, setRiyaanPin] = useState(() => localStorage.getItem('pin_riyaan') || '654321');
  const [ayaanAttempts, setAyaanAttempts] = useState(() => Number(localStorage.getItem('pin_attempts_ayaan') || '0'));
  const [riyaanAttempts, setRiyaanAttempts] = useState(() => Number(localStorage.getItem('pin_attempts_riyaan') || '0'));

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

  const togglePinEntry = () => {
    const newVal = !isPinEntryEnabled;
    setIsPinEntryEnabled(newVal);
    localStorage.setItem('pin_entry_enabled', newVal.toString());
  };

  const updateDateOverride = (val: string) => {
    setDateOverride(val);
    localStorage.setItem('addition_date_override', val);
  };

  const clearDateOverride = () => {
    setDateOverride(null);
    localStorage.removeItem('addition_date_override');
  };

  const updatePin = (user: 'ayaan' | 'riyaan', val: string) => {
    if (val.length <= 6 && /^\d*$/.test(val)) {
      if (user === 'ayaan') {
        setAyaanPin(val);
        localStorage.setItem('pin_ayaan', val);
      } else {
        setRiyaanPin(val);
        localStorage.setItem('pin_riyaan', val);
      }
    }
  };

  const resetUserLock = (user: 'ayaan' | 'riyaan') => {
    localStorage.setItem(`pin_attempts_${user}`, '0');
    if (user === 'ayaan') setAyaanAttempts(0);
    else setRiyaanAttempts(0);
  };

  const handleMasterReset = () => {
    const confirmed = window.confirm("Are you absolutely sure? This will delete ALL earnings, histories, PINs, and reset lockouts for ALL users. This cannot be undone.");
    if (confirmed) {
      // All possible user data keys
      const keysToClear = [
        'ayaan_earnings',
        'riyaan_earnings',
        'addition_history',
        'ayaan_nifty_total',
        'riyaan_nifty_total',
        'nifty_history',
        'pin_attempts_ayaan',
        'pin_attempts_riyaan',
        'pin_ayaan',
        'pin_riyaan',
        'addition_date_override',
        'game_enabled_addition',
        'game_enabled_nifty',
        'pin_entry_enabled'
      ];
      
      keysToClear.forEach(key => localStorage.removeItem(key));
      
      // Clear all potential pin_attempts keys (case-insensitive fallback)
      localStorage.removeItem('pin_attempts_ayaan');
      localStorage.removeItem('pin_attempts_riyaan');
      
      // Alert user and then force a reload to refresh all component states
      alert("System has been fully reset. Re-initializing app...");
      window.location.reload();
    }
  };

  // Ensure the value is compatible with datetime-local (YYYY-MM-DDTHH:MM)
  const getInputValue = () => {
    if (!dateOverride) return '';
    if (dateOverride.includes('T')) return dateOverride;
    // If it's an old-style date only string, append a default time
    return `${dateOverride}T00:00`;
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
        {/* User Security Management */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={20} className="text-indigo-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Security Management</h2>
          </div>
          
          <div className="space-y-6">
            {/* PIN Entry Global Toggle */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 mb-2">
              <div className="flex items-center gap-3">
                <Fingerprint size={20} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Require User PIN</span>
              </div>
              <button onClick={togglePinEntry} className="transition-colors">
                {isPinEntryEnabled ? <ToggleRight size={32} className="text-indigo-600" /> : <ToggleLeft size={32} className="text-slate-300 dark:text-slate-700" />}
              </button>
            </div>

            <div className="space-y-8 pt-4 border-t border-slate-50 dark:border-slate-800">
              {/* Ayaan Security */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ayaan PIN</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all tabular-nums tracking-[0.2em]"
                    value={ayaanPin}
                    onChange={(e) => updatePin('ayaan', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Ayaan Attempts</span>
                    <span className={`text-sm font-black ${ayaanAttempts >= 3 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {ayaanAttempts}/3 attempts {ayaanAttempts >= 3 && '(LOCKED)'}
                    </span>
                  </div>
                  {ayaanAttempts > 0 && (
                    <button 
                      onClick={() => resetUserLock('ayaan')}
                      className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      <UserCheck size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Riyaan Security */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Riyaan PIN</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    maxLength={6}
                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all tabular-nums tracking-[0.2em]"
                    value={riyaanPin}
                    onChange={(e) => updatePin('riyaan', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Riyaan Attempts</span>
                    <span className={`text-sm font-black ${riyaanAttempts >= 3 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {riyaanAttempts}/3 attempts {riyaanAttempts >= 3 && '(LOCKED)'}
                    </span>
                  </div>
                  {riyaanAttempts > 0 && (
                    <button 
                      onClick={() => resetUserLock('riyaan')}
                      className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-colors"
                    >
                      <UserCheck size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">System Time Machine</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Override Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 font-bold text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all"
                value={getInputValue()}
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
                <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold leading-relaxed flex items-center gap-2">
                  <Clock size={14} /> Currently Live: <span className="tabular-nums">{new Date().toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-100 dark:border-rose-900/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={20} className="text-rose-500" />
            <h2 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Danger Zone</h2>
          </div>
          <p className="text-[10px] font-bold text-rose-600/60 dark:text-rose-400/60 uppercase tracking-wider mb-4 px-1">
            Careful: This action will permanently delete all scores, transaction history, and stock picks.
          </p>
          <button 
            onClick={handleMasterReset}
            className="w-full h-14 bg-rose-600 dark:bg-rose-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
          >
            <Trash2 size={18} /> Reset All User Data
          </button>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30">
          <div className="flex items-center gap-3">
            <ShieldAlert size={18} className="text-amber-500" />
            <p className="text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest">Admin controls apply system-wide</p>
          </div>
        </div>
      </div>
    </div>
  );
};
