import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // New imports
import { HomeView } from './views/HomeView';
import { AdditionView } from './views/AdditionView';
import { SubtractionView } from './views/SubtractionView';
import { MultiplicationView } from './views/MultiplicationView';
import { Multiplication25View } from './views/Multiplication25View';
import { MultiplyView } from './views/MultiplyView';
import { DivideView } from './views/DivideView';
import { MentalMathView } from './views/MentalMathView';
import { MathMasteryView } from './views/MathMasteryView';
import { Nifty50View } from './views/Nifty50View';
import { SensexView } from './views/SensexView';
import { DashboardView } from './views/DashboardView';
import { AdminView } from './views/AdminView';
import { SudokuView } from './views/SudokuView';
import { MemoryView } from './views/MemoryView';
import { WordPowerView } from './views/WordPowerView';
import { Barron800View } from './views/Barron800View';
import { Manhattan500View } from './views/Manhattan500View';
import { DailyHistoryView } from './views/DailyHistoryView';
import { ViewType, AppSetting, Profile } from './src/types';

import { supabase } from './src/lib/supabase';
import { fetchAndCacheHolidays } from './src/lib/holidayManager';
import { useGameStore } from './src/store/useGameStore';
import { StorageWarning } from './src/components/StorageWarning';

const App: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const { setSettings, setProfiles } = useGameStore();
  const [isSyncing, setIsSyncing] = useState(true);

  const mapSettings = useCallback((data: AppSetting[]) => {
    const map = data.reduce((acc: any, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    return {
      dateOverride: map['addition_date_override'] as string || null,
      seasonEndDate: map['season_end_date'] as string || '2027-01-01T00:00:00',
      additionEnabled: map['game_enabled_addition'] !== false,
      subtractionEnabled: map['game_enabled_subtraction'] !== false,
      multiplicationEnabled: map['game_enabled_multiplication'] !== false,
      multiplication25Enabled: map['game_enabled_multiplication25'] !== false,
      multiplyEnabled: map['game_enabled_multiply'] !== false,
      divideEnabled: map['game_enabled_divide'] !== false,
      mentalmathEnabled: map['game_enabled_mentalmath'] !== false,
      mathmasteryEnabled: map['game_enabled_mathmastery'] !== false,
      niftyEnabled: map['game_enabled_nifty'] !== false,
      sensexEnabled: map['game_enabled_sensex'] !== false,
      sudokuEnabled: map['game_enabled_sudoku'] !== false,
      memoryEnabled: map['game_enabled_memory'] !== false,
      wordpowerEnabled: map['game_enabled_wordpower'] !== false,
      barron800Enabled: map['game_enabled_barron800'] !== false,
      manhattan500Enabled: map['game_enabled_manhattan500'] !== false,
      pinEntryEnabled: map['pin_entry_enabled'] !== false,
      additionMultiplier: Number(map['game_multiplier_addition']) || 1,
      subtractionMultiplier: Number(map['game_multiplier_subtraction']) || 1,
      multiplicationMultiplier: Number(map['game_multiplier_multiplication']) || 1,
      multiplication25Multiplier: Number(map['game_multiplier_multiplication25']) || 2,
      multiplyMultiplier: Number(map['game_multiplier_multiply']) || 2,
      divideMultiplier: Number(map['game_multiplier_divide']) || 3,
      mentalmathMultiplier: Number(map['game_multiplier_mentalmath']) || 1,
      mathmasteryMultiplier: Number(map['game_multiplier_mathmastery']) || 1,
      niftyMultiplier: Number(map['game_multiplier_nifty']) || 1,
      sensexMultiplier: Number(map['game_multiplier_sensex']) || 1,
      sudokuMultiplier: Number(map['game_multiplier_sudoku']) || 1,
      memoryMultiplier: Number(map['game_multiplier_memory']) || 1,
      wordpowerMultiplier: Number(map['game_multiplier_wordpower']) || 1,
      barron800Multiplier: Number(map['game_multiplier_barron800']) || 1,
      manhattan500Multiplier: Number(map['game_multiplier_manhattan500']) || 1,
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let settingsChannel: any;
    let profilesChannel: any;

    const syncData = async () => {
      const { data: settingsData } = await supabase.from('app_settings').select('*').returns<AppSetting[]>();
      if (settingsData && isMounted) setSettings(mapSettings(settingsData));

      const { data: profilesData } = await supabase.from('profiles').select('*').returns<Profile[]>();
      if (profilesData && isMounted) setProfiles(profilesData);

      if (isMounted) setIsSyncing(false);
    };

    syncData();
    fetchAndCacheHolidays();

    const timer = setTimeout(() => {
      if (!isMounted) return;

      settingsChannel = supabase
        .channel('app_settings_live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, (payload) => {
          const updatedRow = payload.new as AppSetting;
          if (updatedRow?.key) {
            const keyMap: Record<string, string> = {
              'addition_date_override': 'dateOverride',
              'season_end_date': 'seasonEndDate',
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
              'game_enabled_sudoku': 'sudokuEnabled',
              'game_enabled_memory': 'memoryEnabled',
              'game_enabled_wordpower': 'wordpowerEnabled',
              'game_enabled_barron800': 'barron800Enabled',
              'game_enabled_manhattan500': 'manhattan500Enabled',
              'pin_entry_enabled': 'pinEntryEnabled',
              'game_multiplier_addition': 'additionMultiplier',
              'game_multiplier_subtraction': 'subtractionMultiplier',
              'game_multiplier_multiplication': 'multiplicationMultiplier',
              'game_multiplier_multiplication25': 'multiplication25Multiplier',
              'game_multiplier_multiply': 'multiplyMultiplier',
              'game_multiplier_divide': 'divideMultiplier',
              'game_multiplier_mentalmath': 'mentalmathMultiplier',
              'game_multiplier_mathmastery': 'mathmasteryMultiplier',
              'game_multiplier_nifty': 'niftyMultiplier',
              'game_multiplier_sensex': 'sensexMultiplier',
              'game_multiplier_sudoku': 'sudokuMultiplier',
              'game_multiplier_memory': 'memoryMultiplier',
              'game_multiplier_wordpower': 'wordpowerMultiplier',
              'game_multiplier_barron800': 'barron800Multiplier',
              'game_multiplier_manhattan500': 'manhattan500Multiplier',
            };
            const storeKey = keyMap[updatedRow.key];
            if (storeKey) {
              const isMultiplier = storeKey.endsWith('Multiplier');
              setSettings({ [storeKey]: isMultiplier ? Number(updatedRow.value) : updatedRow.value });
            }
          }
        }).subscribe();

      profilesChannel = supabase
        .channel('global_profiles_live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          const updatedProfile = payload.new as Profile;
          if (updatedProfile) {
            const updatedProfiles = useGameStore.getState().profiles.map(p =>
              p.id === updatedProfile.id ? { ...p, ...updatedProfile } : p
            );
            setProfiles(updatedProfiles);
          }
        }).subscribe();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (settingsChannel) supabase.removeChannel(settingsChannel);
      if (profilesChannel) supabase.removeChannel(profilesChannel);
    };
  }, [mapSettings, setSettings, setProfiles]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Helper to map old Enum navigation to new Routes
  const handleNavigate = (view: ViewType) => {
    const pathMap: Record<ViewType, string> = {
      [ViewType.HOME]: '/',
      [ViewType.ADDITION]: '/addition',
      [ViewType.SUBTRACTION]: '/subtraction',
      [ViewType.MULTIPLICATION]: '/multiplication',
      [ViewType.MULTIPLICATION25]: '/multiplication25',
      [ViewType.MULTIPLY]: '/multiply',
      [ViewType.DIVIDE]: '/divide',
      [ViewType.MENTALMATH]: '/mentalmath',
      [ViewType.MATHMASTERY]: '/mathmastery',
      [ViewType.NIFTY50]: '/nifty50',
      [ViewType.SENSEX]: '/sensex',
      [ViewType.SUDOKU]: '/sudoku',
      [ViewType.MEMORY]: '/memory',
      [ViewType.WORDPOWER]: '/wordpower',
      [ViewType.BARRON800]: '/barron800',
      [ViewType.MANHATTAN500]: '/manhattan500',
      [ViewType.DAILYHISTORY]: '/dailyhistory',
      [ViewType.DASHBOARD]: '/dashboard',
      [ViewType.ADMIN]: '/admin'
    };
    navigate(pathMap[view]);
  };

  if (isSyncing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse font-black text-slate-400 uppercase tracking-widest">
          Syncing with Cloud...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <StorageWarning />
      <main className="max-w-5xl mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={
            <HomeView onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDark={toggleDarkMode} />
          } />
          <Route path="/addition" element={<AdditionView onBack={() => navigate('/')} />} />
          <Route path="/subtraction" element={<SubtractionView onBack={() => navigate('/')} />} />
          <Route path="/multiplication" element={<MultiplicationView onBack={() => navigate('/')} />} />
          <Route path="/multiplication25" element={<Multiplication25View onBack={() => navigate('/')} />} />
          <Route path="/multiply" element={<MultiplyView onBack={() => navigate('/')} />} />
          <Route path="/divide" element={<DivideView onBack={() => navigate('/')} />} />
          <Route path="/mentalmath" element={<MentalMathView onBack={() => navigate('/')} />} />
          <Route path="/mathmastery" element={<MathMasteryView onBack={() => navigate('/')} />} />
          <Route path="/nifty50" element={<Nifty50View onBack={() => navigate('/')} />} />
          <Route path="/sensex" element={<SensexView onBack={() => navigate('/')} />} />
          <Route path="/sudoku" element={<SudokuView onBack={() => navigate('/')} />} />
          <Route path="/memory" element={<MemoryView onBack={() => navigate('/')} />} />
          <Route path="/wordpower" element={<WordPowerView onBack={() => navigate('/')} />} />
          <Route path="/barron800" element={<Barron800View onBack={() => navigate('/')} />} />
          <Route path="/manhattan500" element={<Manhattan500View onBack={() => navigate('/')} />} />
          <Route path="/dailyhistory" element={<DailyHistoryView onBack={() => navigate('/')} />} />
          <Route path="/dashboard" element={<DashboardView onBack={() => navigate('/')} />} />
          <Route path="/admin" element={<AdminView onBack={() => navigate('/')} />} />
          {/* Fallback to Home */}
          <Route path="*" element={<HomeView onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDark={toggleDarkMode} />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;