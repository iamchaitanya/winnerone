import React, { useState } from 'react';
import { ArrowLeft, Crown, IndianRupee, History, ChevronDown, ChevronRight, User, Users } from 'lucide-react';

interface AdditionDashboardProps {
  ayaanTotal: number;
  riyaanTotal: number;
  groupedHistory: any[];
  onBack: () => void;
}

export const AdditionDashboard: React.FC<AdditionDashboardProps> = ({
  ayaanTotal,
  riyaanTotal,
  groupedHistory,
  onBack
}) => {
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);

  const isAyaanLeading = ayaanTotal >= riyaanTotal;
  const leader = isAyaanLeading 
    ? { name: 'Ayaan', total: ayaanTotal, color: 'indigo', icon: User } 
    : { name: 'Riyaan', total: riyaanTotal, color: 'rose', icon: Users };
  const runner = isAyaanLeading 
    ? { name: 'Riyaan', total: riyaanTotal, color: 'rose', icon: Users } 
    : { name: 'Ayaan', total: ayaanTotal, color: 'indigo', icon: User };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300 overflow-x-hidden">
      <div className="max-w-2xl mx-auto w-full">
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Player Earnings</h1>
        </header>
        
        <div className="flex flex-col items-center w-full">
          <div className="relative flex items-center justify-center w-full h-64 sm:h-80 mb-6">
            <div className="flex items-center justify-center">
              <div className={`relative z-20 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-white dark:bg-slate-900 border-[6px] border-${leader.color}-500 flex flex-col items-center justify-center shadow-2xl animate-in zoom-in duration-700 overflow-hidden`}>
                <div className="absolute top-3 sm:top-4 bg-amber-400 text-white p-1.5 sm:p-2 rounded-full shadow-lg ring-4 ring-white dark:ring-slate-950">
                  <Crown size={20} fill="currentColor" />
                </div>
                <leader.icon size={32} className={`text-${leader.color}-500 mb-1 mt-4 sm:mt-6`} />
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{leader.name}</h3>
                <div className="flex items-center justify-center gap-0.5 w-full px-3">
                  <IndianRupee size={16} className="text-slate-400 flex-shrink-0" />
                  <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {leader.total.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className={`relative z-10 -ml-10 sm:-ml-12 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-white dark:bg-slate-900 border-2 border-${runner.color}-300 flex flex-col items-center justify-center shadow-xl animate-in zoom-in duration-1000 delay-300 overflow-hidden`}>
                <runner.icon size={20} className={`text-${runner.color}-400 mb-1`} />
                <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{runner.name}</h3>
                <div className="flex items-center justify-center gap-0.5 w-full px-3">
                  <IndianRupee size={10} className="text-slate-400 flex-shrink-0" />
                  <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                    {runner.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-4 mb-24 px-1">
            <button 
              onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
              className="w-full h-14 flex items-center justify-between gap-2 mb-4 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <History size={18} className="text-indigo-500" />
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Daily Summary</h2>
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                {isHistoryCollapsed ? <ChevronRight size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </div>
            </button>
            
            {!isHistoryCollapsed && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300 w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-left table-auto">
                    <thead>
                      <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ayaan</th>
                        <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Riyaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {groupedHistory.length > 0 ? (
                        groupedHistory.map((record) => (
                          <tr key={record.dateKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-5 whitespace-nowrap">
                              <span className="text-[11px] text-slate-900 dark:text-slate-200 font-bold tabular-nums">{record.displayDate}</span>
                            </td>
                            <td className="px-5 py-5 text-center">
                              {record.ayaanEarnings !== null ? (
                                <div className="flex flex-col items-center">
                                  <span className={`text-sm font-black tabular-nums ${record.ayaanEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {record.ayaanEarnings >= 0 ? '+' : ''}{record.ayaanEarnings.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium tabular-nums whitespace-nowrap">{record.ayaanTime}</span>
                                </div>
                              ) : <span className="text-slate-200 dark:text-slate-800">—</span>}
                            </td>
                            <td className="px-5 py-5 text-center">
                              {record.riyaanEarnings !== null ? (
                                <div className="flex flex-col items-center">
                                  <span className={`text-sm font-black tabular-nums ${record.riyaanEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {record.riyaanEarnings >= 0 ? '+' : ''}{record.riyaanEarnings.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-medium tabular-nums whitespace-nowrap">{record.riyaanTime}</span>
                                </div>
                              ) : <span className="text-slate-200 dark:text-slate-800">—</span>}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-5 py-16 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <History size={32} className="text-slate-200 dark:text-slate-800" />
                              <p className="text-slate-400 text-xs font-medium italic">No entries in history.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};