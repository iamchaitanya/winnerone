
import React from 'react';
import { ViewType } from '../types';
import { Home, PlusSquare, LineChart, LayoutDashboard } from 'lucide-react';

interface BottomNavProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const items = [
    { type: ViewType.HOME, label: 'Home', icon: Home },
    { type: ViewType.ADDITION, label: 'Add', icon: PlusSquare },
    { type: ViewType.NIFTY50, label: 'Market', icon: LineChart },
    { type: ViewType.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 px-8 py-3 rounded-2xl shadow-2xl flex justify-between items-center transition-all duration-300">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.type;
          return (
            <button
              key={item.type}
              onClick={() => onNavigate(item.type)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
