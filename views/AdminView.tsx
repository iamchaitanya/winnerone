import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Calendar, RotateCcw, ToggleLeft, ToggleRight, Gamepad2, Clock, Lock, UserCheck, Trash2, AlertTriangle, Fingerprint } from 'lucide-react';
import { supabase, handleSupabaseError } from '../src/lib/supabase';
import { useGameStore } from '../src/store/useGameStore'; // Added store import

interface AdminViewProps {
  onBack: () => void;
  // settings, profiles, and onUpdateSetting props removed completely
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  // Grab global state directly from Zustand
  const settings = useGameStore((state) => state.settings);
  const profiles = useGameStore((state) => state.profiles);
  const isStorageFull = useGameStore((state) => state.isStorageFull);
  const setSettings = useGameStore((state) => state.setSettings);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Determine if the current season has ended
  const isSeasonEnded = (() => {
    const now = new Date();
    const endDate = new Date(settings.seasonEndDate || '2027-01-01T00:00:00');
    return now.getTime() >= endDate.getTime();
  })();

  // Local state for smooth typing, synced with global profiles
  const [localProfiles, setLocalProfiles] = useState<any[]>([]);

  useEffect(() => {
    setLocalProfiles(profiles);
  }, [profiles]);

  // Handle saving settings to DB and Store
  const handleUpdateSetting = async (key: string, value: any) => {
    const keyMap: Record<string, string> = {
      'addition_date_override': 'dateOverride',
      'game_enabled_addition': 'additionEnabled',
      'game_enabled_subtraction': 'subtractionEnabled',
      'game_enabled_multiplication': 'multiplicationEnabled',
      'game_enabled_multiplication25': 'multiplication25Enabled',
      'game_enabled_multiply': 'multiplyEnabled',
      'game_enabled_divide': 'divideEnabled',
      'game_enabled_mentalmath': 'mentalmathEnabled',
      'game_enabled_mathmastery': 'mathmasteryEnabled',
      'game_enabled_nifty': 'niftyEnabled',
      'game_enabled_sensex': 'sensexEnabled',
      'pin_entry_enabled': 'pinEntryEnabled',
      'game_multiplier_addition': 'additionMultiplier',
      'game_multiplier_subtraction': 'subtractionMultiplier',
      'game_multiplier_multiplication': 'multiplicationMultiplier',
      'game_multiplier_multiplication25': 'multiplication25Multiplier',
      'game_multiplier_multiply': 'multiplyMultiplier',
      'game_multiplier_divide': 'divideMultiplier',
      'game_multiplier_mentalmath': 'mentalmathMultiplier',
      'game_multiplier_mathmastery': 'mathmasteryMultiplier',
      'game_enabled_sudoku': 'sudokuEnabled',
      'game_enabled_memory': 'memoryEnabled',
      'game_enabled_wordpower': 'wordpowerEnabled',
      'game_enabled_barron800': 'barron800Enabled',
      'game_enabled_manhattan500': 'manhattan500Enabled',
      'game_multiplier_nifty': 'niftyMultiplier',
      'game_multiplier_sensex': 'sensexMultiplier',
      'game_multiplier_sudoku': 'sudokuMultiplier',
      'game_multiplier_memory': 'memoryMultiplier',
      'game_multiplier_wordpower': 'wordpowerMultiplier',
      'game_multiplier_barron800': 'barron800Multiplier',
      'game_multiplier_manhattan500': 'manhattan500Multiplier',
    };

    // Optimistic UI update via Zustand
    const storeKey = keyMap[key];
    if (storeKey) {
      setSettings({ [storeKey]: value });
    }

    // Cloud update
    await supabase.from('app_settings').upsert({ key, value });
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();

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

  // Toggles using the new self-contained update handler
  const toggleAddition = () => handleUpdateSetting('game_enabled_addition', !settings.additionEnabled);
  const toggleSubtraction = () => handleUpdateSetting('game_enabled_subtraction', !settings.subtractionEnabled);
  const toggleMultiplication = () => handleUpdateSetting('game_enabled_multiplication', !settings.multiplicationEnabled);
  const toggleMultiplication25 = () => handleUpdateSetting('game_enabled_multiplication25', !settings.multiplication25Enabled);
  const toggleMultiply = () => handleUpdateSetting('game_enabled_multiply', !settings.multiplyEnabled);
  const toggleDivide = () => handleUpdateSetting('game_enabled_divide', !settings.divideEnabled);
  const toggleMentalMath = () => handleUpdateSetting('game_enabled_mentalmath', !settings.mentalmathEnabled);
  const toggleMathMastery = () => handleUpdateSetting('game_enabled_mathmastery', !settings.mathmasteryEnabled);
  const toggleNifty = () => handleUpdateSetting('game_enabled_nifty', !settings.niftyEnabled);
  const toggleSensex = () => handleUpdateSetting('game_enabled_sensex', !settings.sensexEnabled);
  const toggleSudoku = () => handleUpdateSetting('game_enabled_sudoku', !settings.sudokuEnabled);
  const toggleMemory = () => handleUpdateSetting('game_enabled_memory', !settings.memoryEnabled);
  const toggleWordPower = () => handleUpdateSetting('game_enabled_wordpower', !settings.wordpowerEnabled);
  const toggleBarron800 = () => handleUpdateSetting('game_enabled_barron800', !settings.barron800Enabled);
  const toggleManhattan500 = () => handleUpdateSetting('game_enabled_manhattan500', !settings.manhattan500Enabled);
  const togglePinEntry = () => handleUpdateSetting('pin_entry_enabled', !settings.pinEntryEnabled);
  const updateDateOverride = (val: string) => handleUpdateSetting('addition_date_override', val);
  const clearDateOverride = () => handleUpdateSetting('addition_date_override', null);

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
    const confirmed = window.confirm("⚠️ DANGER ZONE ⚠️\n\nThis will permanently DELETE ALL DATA from the Cloud Database. A backup will be downloaded first.");
    if (confirmed) {
      setIsResetting(true);
      try {
        const safeUUID = '00000000-0000-0000-0000-000000000000';
        const tables = [
          'addition_logs', 'subtraction_logs', 'multiplication_logs',
          'multiplication25_logs', 'multiply_logs', 'divide_logs',
          'mentalmath_logs', 'mathmastery_logs', 'nifty_logs',
          'sensex_logs', 'sudoku_logs', 'memory_logs',
          'wordpower_logs', 'barron800_logs', 'manhattan500_logs',
          'game_attempts'
        ];

        // 1. Fetch all data for backup
        const backupData: Record<string, any[]> = {};
        for (const table of tables) {
          const { data, error } = await supabase.from(table).select('*');
          if (!error && data) {
            backupData[table] = data;
          }
        }

        // 2. Download the backup as a JSON file
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const currentYear = new Date().getFullYear();
        a.download = `winnerone_backup_${currentYear}_season.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 3. Delete all data from all tables
        for (const table of tables) {
          if (table === 'game_attempts') {
            await supabase.from(table).delete().not('id', 'is', null);
          } else {
            await supabase.from(table).delete().neq('id', safeUUID);
          }
        }

        // 4. Update the season end date to Dec 31st of the new current year
        const nextSeasonEnd = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();
        await handleUpdateSetting('season_end_date', nextSeasonEnd);

        alert("✅ Cloud Wiped & New Season Started. App will restart.");
        window.location.reload();
      } catch (error) {
        alert("❌ Reset Failed. Check Console.");
        console.error(error);
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
        {/* Security Management */}
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

        {/* Game Management */}
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
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Subtraction Game</span>
              <button onClick={toggleSubtraction}>
                {settings.subtractionEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">12×12 Game</span>
              <button onClick={toggleMultiplication}>
                {settings.multiplicationEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">25×25 Game</span>
              <button onClick={toggleMultiplication25}>
                {settings.multiplication25Enabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Multiply Game</span>
              <button onClick={toggleMultiply}>
                {settings.multiplyEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Divide Game</span>
              <button onClick={toggleDivide}>
                {settings.divideEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Mental Math</span>
              <button onClick={toggleMentalMath}>
                {settings.mentalmathEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Math Mastery</span>
              <button onClick={toggleMathMastery}>
                {settings.mathmasteryEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Nifty 50 Game</span>
              <button onClick={toggleNifty}>
                {settings.niftyEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Sensex Game</span>
              <button onClick={toggleSensex}>
                {settings.sensexEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Sudoku</span>
              <button onClick={toggleSudoku}>
                {settings.sudokuEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Memory</span>
              <button onClick={toggleMemory}>
                {settings.memoryEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Word Power</span>
              <button onClick={toggleWordPower}>
                {settings.wordpowerEnabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Barron 800</span>
              <button onClick={toggleBarron800}>
                {settings.barron800Enabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Manhattan 500</span>
              <button onClick={toggleManhattan500}>
                {settings.manhattan500Enabled ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-slate-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* Game Multipliers */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">💰</span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Earnings Multiplier</h2>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mb-6">Score is always ±1 per question. Earnings = (correct − wrong) × multiplier.</p>
          <div className="space-y-3">
            {[
              { label: 'Addition', key: 'game_multiplier_addition', value: settings.additionMultiplier },
              { label: 'Subtraction', key: 'game_multiplier_subtraction', value: settings.subtractionMultiplier },
              { label: '12×12', key: 'game_multiplier_multiplication', value: settings.multiplicationMultiplier },
              { label: '25×25', key: 'game_multiplier_multiplication25', value: settings.multiplication25Multiplier },
              { label: 'Multiply', key: 'game_multiplier_multiply', value: settings.multiplyMultiplier },
              { label: 'Divide', key: 'game_multiplier_divide', value: settings.divideMultiplier },
              { label: 'Mental Math', key: 'game_multiplier_mentalmath', value: settings.mentalmathMultiplier },
              { label: 'Math Mastery', key: 'game_multiplier_mathmastery', value: settings.mathmasteryMultiplier },
              { label: 'Nifty 50', key: 'game_multiplier_nifty', value: settings.niftyMultiplier },
              { label: 'Sensex', key: 'game_multiplier_sensex', value: settings.sensexMultiplier },
              { label: 'Sudoku', key: 'game_multiplier_sudoku', value: settings.sudokuMultiplier },
              { label: 'Memory', key: 'game_multiplier_memory', value: settings.memoryMultiplier },
              { label: 'Word Power', key: 'game_multiplier_wordpower', value: settings.wordpowerMultiplier },
              { label: 'Barron 800', key: 'game_multiplier_barron800', value: settings.barron800Multiplier },
              { label: 'Manhattan 500', key: 'game_multiplier_manhattan500', value: settings.manhattan500Multiplier },
            ].map(({ label, key, value }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{label}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => handleUpdateSetting(key, Number(e.target.value))}
                    className="w-20 px-3 py-2 text-right text-sm font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white tabular-nums"
                  />
                  <span className="text-xs font-bold text-slate-400">×</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Time Machine */}
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

        {/* Danger Zone */}
        <div className="bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-100 dark:border-rose-900/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={20} className="text-rose-500" />
            <h2 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Danger Zone</h2>
          </div>
          <button
            onClick={handleMasterReset}
            disabled={isResetting || (!isSeasonEnded && !isStorageFull)}
            className={`w-full h-14 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-colors ${(isResetting || (!isSeasonEnded && !isStorageFull)) ? 'bg-rose-400 dark:bg-rose-900/50 cursor-not-allowed opacity-50' : 'bg-rose-600 dark:bg-rose-700 hover:bg-rose-700 dark:hover:bg-rose-600'
              }`}
          >
            {isResetting ? <Clock className="animate-spin" size={18} /> : <Trash2 size={18} />}
            {isResetting ? 'WIPING CLOUD...' : (!isSeasonEnded && !isStorageFull) ? 'SEASON ACTIVE (DISABLED)' : 'MASTER RESET & DOWNLOAD'}
          </button>
        </div>
      </div>
    </div>
  );
};