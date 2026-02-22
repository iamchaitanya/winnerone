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

  // App Settings from Supabase
  const [appSettings, setAppSettings] = useState<any>({
    dateOverride: null,
    additionEnabled: true,
    niftyEnabled: true
  });
  const [isSyncing, setIsSyncing] = useState(true);

  // 1. Fetch Global Settings on Boot
  useEffect(() => {
    const syncSettings = async () => {
      const { data } = await supabase.from('app_settings').select('*');
      if (data) {
        const map = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
        setAppSettings({
          dateOverride: map['addition_date_override'] || null,
          additionEnabled: map['game_enabled_addition'] !== false,
          niftyEnabled: map['game_enabled_nifty'] !== false
        });
      }
      setIsSyncing(false);
    };

    syncSettings();
    fetchAndCacheHolidays();
  }, []);

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
        return <AdditionView onBack={() => setCurrentView(ViewType.HOME)} settings={appSettings} />;
      case ViewType.NIFTY50:
        return <Nifty50View onBack={() => setCurrentView(ViewType.HOME)} settings={appSettings} />;
      case ViewType.DASHBOARD:
        return <DashboardView onBack={() => setCurrentView(ViewType.HOME)} />;
      case ViewType.ADMIN:
        return <AdminView onBack={() => setCurrentView(ViewType.HOME)} />;
      default:
        return <HomeView onNavigate={setCurrentView} isDarkMode={isDarkMode} onToggleDark={toggleDarkMode} settings={appSettings} />;
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