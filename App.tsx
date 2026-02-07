
import React, { useState, useEffect } from 'react';
import { HomeView } from './views/HomeView';
import { AdditionView } from './views/AdditionView';
import { Nifty50View } from './views/Nifty50View';
import { DashboardView } from './views/DashboardView';
import { ViewType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.HOME);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

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