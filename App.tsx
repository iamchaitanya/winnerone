import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // New imports
import { HomeView } from './views/HomeView';
import { AdditionView } from './views/AdditionView';
import { SubtractionView } from './views/SubtractionView';
import { MultiplicationView } from './views/MultiplicationView';
import { Multiplication25View } from './views/Multiplication25View';
import { Nifty50View } from './views/Nifty50View';
import { SensexView } from './views/SensexView';
import { DashboardView } from './views/DashboardView';
import { AdminView } from './views/AdminView';
import { ViewType, AppSetting, Profile } from './src/types';

import { supabase } from './src/lib/supabase';
import { fetchAndCacheHolidays } from './src/lib/holidayManager';
import { useGameStore } from './src/store/useGameStore';

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
      additionEnabled: map['game_enabled_addition'] !== false,
      subtractionEnabled: map['game_enabled_subtraction'] !== false,
      multiplicationEnabled: map['game_enabled_multiplication'] !== false,
      multiplication25Enabled: map['game_enabled_multiplication25'] !== false,
      niftyEnabled: map['game_enabled_nifty'] !== false,
      sensexEnabled: map['game_enabled_sensex'] !== false,
      pinEntryEnabled: map['pin_entry_enabled'] !== false,
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
              'game_enabled_addition': 'additionEnabled',
              'game_enabled_subtraction': 'subtractionEnabled',
              'game_enabled_multiplication': 'multiplicationEnabled',
              'game_enabled_multiplication25': 'multiplication25Enabled',
              'game_enabled_nifty': 'niftyEnabled',
              'game_enabled_sensex': 'sensexEnabled',
              'pin_entry_enabled': 'pinEntryEnabled'
            };
            const storeKey = keyMap[updatedRow.key];
            if (storeKey) setSettings({ [storeKey]: updatedRow.value });
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
      [ViewType.NIFTY50]: '/nifty50',
      [ViewType.SENSEX]: '/sensex',
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
      <main className="max-w-5xl mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={
            <HomeView onNavigate={handleNavigate} isDarkMode={isDarkMode} onToggleDark={toggleDarkMode} />
          } />
          <Route path="/addition" element={<AdditionView onBack={() => navigate('/')} />} />
          <Route path="/subtraction" element={<SubtractionView onBack={() => navigate('/')} />} />
          <Route path="/multiplication" element={<MultiplicationView onBack={() => navigate('/')} />} />
          <Route path="/multiplication25" element={<Multiplication25View onBack={() => navigate('/')} />} />
          <Route path="/nifty50" element={<Nifty50View onBack={() => navigate('/')} />} />
          <Route path="/sensex" element={<SensexView onBack={() => navigate('/')} />} />
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