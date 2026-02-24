import React from 'react';
import { ArrowLeft, Trophy, User, Users, Calendar, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface SensexLeaderboardProps {
  ayaanTotal: number;
  riyaanTotal: number;
  groupedHistory: any[];
  onBack: () => void;
}

export const SensexLeaderboard: React.FC<SensexLeaderboardProps> = ({ 
  ayaanTotal, 
  riyaanTotal, 
  groupedHistory, 
  onBack 
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-right duration-500">
      <header className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sensex Standings</h1>
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Global Ranking</span>
        </div>
      </header>

      {/* Premium Player Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {[
          { name: 'Ayaan', total: ayaanTotal, icon: User, color: 'indigo', rank: ayaanTotal >= riyaanTotal ? 1 : 2 },
          { name: 'Riyaan', total: riyaanTotal, icon: Users, color: 'rose', rank: riyaanTotal > ayaanTotal ? 1 : 2 }
        ].sort((a, b) => a.rank - b.rank).map((player) => (
          <div key={player.name} className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-between group">
            <div className={`absolute top-0 left-0 w-2 h-full ${player.color === 'indigo' ? 'bg-indigo-500' : 'bg-rose-500'}`} />
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${player.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600'}`}>
                <player.icon size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{player.name}</span>
                  {player.rank === 1 && <Trophy size={14} className="text-amber-500" fill="currentColor" />}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank #{player.rank}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Earnings</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">₹{player.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Battle History Feed */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Target size={14} /> Performance Log
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pb-10 pr-1">
          {groupedHistory.map((day) => (
            <div key={day.date} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day.date}</span>
                <span className="text-[8px] font-bold text-indigo-500 uppercase mt-1">Sensex Directional Dual</span>
              </div>
              
              <div className="flex gap-4 items-center">
                <div className="flex flex-col items-center">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${day.ayaan?.earnings > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {day.ayaan?.prediction === 'UP' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                   </div>
                   <span className="text-[8px] font-black uppercase text-slate-400">A</span>
                </div>
                <div className="flex flex-col items-center">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${day.riyaan?.earnings > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {day.riyaan?.prediction === 'UP' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                   </div>
                   <span className="text-[8px] font-black uppercase text-slate-400">R</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};