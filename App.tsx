import React, { useState, useEffect } from 'react';
import { HomeView } from './views/HomeView';
import { AdditionView } from './views/AdditionView';
import { Nifty50View } from './views/Nifty50View';
import { DashboardView } from './views/DashboardView';
import { AdminView } from './views/AdminView';
import { ViewType } from './types';

import { supabase } from './src/lib/supabase';
import { fetchAndCacheHolidays } from './src/lib/holidayManager';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // App Settings state (Updated to include Security Data)
  const [appSettings, setAppSettings] = useState<any>({
    dateOverride: null,
    additionEnabled: true,
    niftyEnabled: true,
    pinEntryEnabled: true
  });
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);

  // 1. Fetch Global Settings and Profiles, Listen for Real-Time Changes
  useEffect(() => {
    let isMounted = true;
    let settingsChannel: any;
    let profilesChannel: any;

    const syncData = async () => {
      // Fetch Settings
      const { data: settingsData } = await supabase.from('app_settings').select('*');
      if (settingsData && isMounted) {
        const map = settingsData.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        setAppSettings({
          dateOverride: map['addition_date_override'] || null,
          additionEnabled: map['game_enabled_addition'] !== false,
          niftyEnabled: map['game_enabled_nifty'] !== false,
          pinEntryEnabled: map['pin_entry_enabled'] !== false,
        });
      }

      // Fetch Profiles
      const { data: profilesData } = await supabase.from('profiles').select('*');
      if (profilesData && isMounted) {
        setProfiles(profilesData);
      }
      
      if (isMounted) setIsSyncing(false);
    };

    syncData();
    fetchAndCacheHolidays();

    const timer = setTimeout(() => {
      if (!isMounted) return;

      // Settings Realtime Listener
      settingsChannel = supabase
        .channel('app_settings_live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, (payload) => {
          const updatedRow = payload.new as any;
          if (updatedRow && updatedRow.key) {
            setAppSettings((prev: any) => ({
              ...prev,
              dateOverride: updatedRow.key === 'addition_date_override' ? updatedRow.value : prev.dateOverride,
              additionEnabled: updatedRow.key === 'game_enabled_addition' ? (updatedRow.value !== false) : prev.additionEnabled,
              niftyEnabled: updatedRow.key === 'game_enabled_nifty' ? (updatedRow.value !== false) : prev.niftyEnabled,
              pinEntryEnabled: updatedRow.key === 'pin_entry_enabled' ? (updatedRow.value !== false) : prev.pinEntryEnabled,
            }));
          }
        }).subscribe();

      // Profiles Realtime Listener
      profilesChannel = supabase
        .channel('global_profiles_live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          const updatedProfile = payload.new as any;
          if (updatedProfile) {
            setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? { ...p, ...updatedProfile } : p));
          }
        }).subscribe();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (settingsChannel) supabase.removeChannel(settingsChannel);
      if (profilesChannel) supabase.removeChannel(profilesChannel);
    };
  }, []);

  // Theme Management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // Real-time optimistic update function
  const handleUpdateSetting = async (key: string, value: any) => {
    setAppSettings((prev: any) => ({
      ...prev,
      dateOverride: key === 'addition_date_override' ? value : prev.dateOverride,
      additionEnabled: key === 'game_enabled_addition' ? value : prev.additionEnabled,
      niftyEnabled: key === 'game_enabled_nifty' ? value : prev.niftyEnabled,
      pinEntryEnabled: key === 'pin_entry_enabled' ? value : prev.pinEntryEnabled,
    }));
    await supabase.from('app_settings').upsert({ key, value });
  };

  if (isSyncing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse font-black text-slate-400 uppercase tracking-widest">
          Loading WinnerOne...
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case ViewType.HOME:
        return (
          <HomeView 
            onNavigate={setCurrentView} 
            isDarkMode={isDarkMode} 
            onToggleDark={toggleDarkMode}
            settings={appSettings} 
          />
        );
      case ViewType.ADDITION:
        return (
          <AdditionView 
            onBack={() => setCurrentView(ViewType.HOME)} 
            settings={appSettings} 
            profiles={profiles} 
          />
        );
      case ViewType.NIFTY50:
        return (
          <Nifty50View 
            onBack={() => setCurrentView(ViewType.HOME)} 
            settings={appSettings} 
            profiles={profiles} 
          />
        );
      case ViewType.DASHBOARD:
        return <DashboardView onBack={() => setCurrentView(ViewType.HOME)} />;
      case ViewType.ADMIN:
        return (
          <AdminView 
            onBack={() => setCurrentView(ViewType.HOME)} 
            settings={appSettings}
            profiles={profiles}
            onUpdateSetting={handleUpdateSetting}
          />
        );
      default:
        return (
          <HomeView 
            onNavigate={setCurrentView} 
            isDarkMode={isDarkMode} 
            onToggleDark={toggleDarkMode} 
            settings={appSettings} 
          />
        );
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