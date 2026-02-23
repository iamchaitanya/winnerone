import React, { useState, useEffect, useCallback } from 'react';
import { HomeView } from './views/HomeView';
import { AdditionView } from './views/AdditionView';
import { Nifty50View } from './views/Nifty50View';
import { DashboardView } from './views/DashboardView';
import { AdminView } from './views/AdminView';
import { ViewType, AppSetting, Profile } from './types';

import { supabase } from './src/lib/supabase';
import { fetchAndCacheHolidays } from './src/lib/holidayManager';
import { useGameStore } from './src/store/useGameStore';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // We only need the setter actions here; the views consume the data
  const { setSettings, setProfiles } = useGameStore();
  const [isSyncing, setIsSyncing] = useState(true);

  const mapSettings = useCallback((data: AppSetting[]) => {
    const map = data.reduce((acc: any, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    return {
      dateOverride: map['addition_date_override'] as string || null,
      additionEnabled: map['game_enabled_addition'] !== false,
      niftyEnabled: map['game_enabled_nifty'] !== false,
      pinEntryEnabled: map['pin_entry_enabled'] !== false,
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let settingsChannel: any;
    let profilesChannel: any;

    const syncData = async () => {
      // 1. Initial Fetch
      const { data: settingsData } = await supabase.from('app_settings').select('*').returns<AppSetting[]>();
      if (settingsData && isMounted) setSettings(mapSettings(settingsData));

      const { data: profilesData } = await supabase.from('profiles').select('*').returns<Profile[]>();
      if (profilesData && isMounted) setProfiles(profilesData);
      
      if (isMounted) setIsSyncing(false);
    };

    syncData();
    fetchAndCacheHolidays();

    // 2. Real-time Subscription Setup
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
              'game_enabled_nifty': 'niftyEnabled',
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

  // Theme Management
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  if (isSyncing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse font-black text-slate-400 uppercase tracking-widest">
          Syncing with Cloud...
        </div>
      </div>
    );
  }

  // Look how clean this is now! No more drilling.
  const renderView = () => {
    switch (currentView) {
      case ViewType.HOME:
        return <HomeView onNavigate={setCurrentView} isDarkMode={isDarkMode} onToggleDark={toggleDarkMode} />;
      case ViewType.ADDITION:
        return <AdditionView onBack={() => setCurrentView(ViewType.HOME)} />;
      case ViewType.NIFTY50:
        return <Nifty50View onBack={() => setCurrentView(ViewType.HOME)} />;
      case ViewType.DASHBOARD:
        return <DashboardView onBack={() => setCurrentView(ViewType.HOME)} />;
      case ViewType.ADMIN:
        return <AdminView onBack={() => setCurrentView(ViewType.HOME)} />;
      default:
        return <HomeView onNavigate={setCurrentView} isDarkMode={isDarkMode} onToggleDark={toggleDarkMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <main className="max-w-5xl mx-auto min-h-screen">
        {renderView()}
      </main>
    </div>
  );
};

export default App;