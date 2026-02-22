import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Calendar, RotateCcw, ToggleLeft, ToggleRight, Gamepad2, Clock, Lock, UserCheck, Trash2, AlertTriangle, Fingerprint, ShieldAlert } from 'lucide-react';
import { supabase } from '../src/lib/supabase'; 

interface AdminViewProps {
  onBack: () => void;
  settings: {
    dateOverride: string | null;
    additionEnabled: boolean;
    niftyEnabled: boolean;
    pinEntryEnabled: boolean;
  };
  profiles: any[];
  onUpdateSetting: (key: string, value: any) => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack, settings, profiles, onUpdateSetting }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Local state for smooth typing, synced with global profiles
  const [localProfiles, setLocalProfiles] = useState<any[]>([]);

  useEffect(() => {
    setLocalProfiles(profiles);
  }, [profiles]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fetch the secure PIN from Supabase
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'admin_pin')
      .single();

    if (error || !data) {
      setAdminError('System Error: admin_pin not configured in database');
      return;
    }

    if (adminPassword === data.value) {
      setIsAuthenticated(true);
      setAdminError('');
    } else {
      setAdminError('Incorrect PIN');
    }
  };

  // 2. Updated Toggle functions using lifted state
  const toggleAddition = () => {
    onUpdateSetting('game_enabled_addition', !settings.additionEnabled);
  };

  const toggleNifty = () => {
    onUpdateSetting('game_enabled_nifty', !settings.niftyEnabled);
  };

  const togglePinEntry = () => {
    onUpdateSetting('pin_entry_enabled', !settings.pinEntryEnabled);
  };

  const updateDateOverride = (val: string) => {
    onUpdateSetting('addition_date_override', val);
  };

  const clearDateOverride = () => {
    onUpdateSetting('addition_date_override', null);
  };

  // 3. Updated PIN and lock management to use 'profiles' table
  const updatePin = async (id: string, val: string) => {
    if (val.length <= 6 && /^\d*$/.test(val)) {
      setLocalProfiles(prev => prev.map(p => p.id === id ? { ...p, pin: val } : p));
      await supabase.from('profiles').update({ pin: val }).eq('id', id);
    }
  };

  const resetUserLock = async (id: string) => {
    setLocalProfiles(prev => prev.map(p => p.id === id ? { ...p, pin_attempts: 0, is_locked: false } : p));
    await supabase.from('profiles').update({ pin_attempts: 0, is_locked: false }).eq('id', id);
  };

  const handleMasterReset = async () => {
    const confirmed = window.confirm("⚠️ DANGER ZONE ⚠️\n\nThis will permanently DELETE ALL DATA from the Cloud Database.");
    if (confirmed) {
      setIsResetting(true);
      try {
        await supabase.from('addition_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('nifty_logs').delete().neq('id', 0);
        await supabase.from('game_attempts').delete().neq('id', 0);
        alert("✅ Cloud Wiped. App will restart.");
        window.location.reload();
      } catch (error) {
        alert("❌ Reset Failed.");
        setIsResetting(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
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
          <button type="submit" className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl">Unlock</button>
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={20} className="text-indigo-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Security Management</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 mb-2">
              <div className="flex items-center gap-3">
                <Fingerprint size={20} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Require User PIN</span>
              </div>
              <button onClick={togglePinEntry}>
                {settings.pinEntryEnabled ? <ToggleRight size={32} className="text-indigo-600" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>

            <div className="space-y-8 pt-4 border-t border-slate-50 dark:border-slate-800">
              {localProfiles.map(profile => (
                <div key={profile.id} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{profile.player_name} PIN</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 font-bold text-slate-900 dark:text-white outline-none transition-all tabular-nums tracking-[0.2em]"
                      value={profile.pin}
                      onChange={(e) => updatePin(profile.id, e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Attempts</span>
                      <span className={`text-sm font-black ${profile.pin_attempts >= 3 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {profile.pin_attempts}/3 {profile.pin_attempts >= 3 && '(LOCKED)'}
                      </span>
                    </div>
                    {profile.pin_attempts > 0 && (
                      <button 
                        onClick={() => resetUserLock(profile.id)}
                        className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"
                      >
                        <UserCheck size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Gamepad2 size={20} className="text-indigo-500" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Game Management</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Addition Game</span>
              <button onClick={toggleAddition}>
                {settings.additionEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Nifty 50 Game</span>
              <button onClick={toggleNifty}>
                {settings.niftyEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
          </div>
        </div>

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
                value={settings.dateOverride || ''}
                onChange={(e) => updateDateOverride(e.target.value)}
              />
            </div>
            {settings.dateOverride && (
              <button 
                onClick={clearDateOverride}
                className="w-full h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Reset to Real-time
              </button>
            )}
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-100 dark:border-rose-900/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={20} className="text-rose-500" />
            <h2 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Danger Zone</h2>
          </div>
          <button 
            onClick={handleMasterReset}
            disabled={isResetting}
            className="w-full h-14 bg-rose-600 dark:bg-rose-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
          >
            {isResetting ? <Clock className="animate-spin" size={18} /> : <Trash2 size={18} />}
            {isResetting ? 'WIPING CLOUD...' : 'MASTER RESET'}
          </button>
        </div>
      </div>
    </div>
  );
};