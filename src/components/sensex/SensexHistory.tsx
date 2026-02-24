import React from 'react';
import { ArrowLeft, Clock, TrendingUp, TrendingDown, ShieldCheck, Timer, Calendar} from 'lucide-react';

interface SensexHistoryProps {
  groupedHistory: any[];
  onBack: () => void;
}

export const SensexHistory: React.FC<SensexHistoryProps> = ({ groupedHistory, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sensex Log</h1>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Trail</span>
        </div>
      </header>

      <div className="space-y-6">
        {groupedHistory.map((day) => (
          <div key={day.date} className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                <Calendar size={10} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{day.date}</span>
              </div>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { name: 'Ayaan', session: day.ayaan, color: 'indigo' },
                { name: 'Riyaan', session: day.riyaan, color: 'rose' }
              ].map((item) => (
                <div key={item.name} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-8 rounded-full ${item.color === 'indigo' ? 'bg-indigo-500' : 'bg-rose-500'}`} />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{item.name}</span>
                      {item.session ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.session.prediction === 'UP' ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                          <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Predicted {item.session.prediction}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tight">No Participation</span>
                      )}
                    </div>
                  </div>
                  
                  {item.session && (
                    <div className="text-right">
                      {item.session.is_settled ? (
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-black ${item.session.earnings > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {item.session.earnings > 0 ? `+₹${item.session.earnings}` : '₹0.00'}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            <ShieldCheck size={10} className="text-emerald-500" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase">Settled</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end opacity-50">
                          <span className="text-sm font-black text-slate-400">---</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Timer size={10} className="text-amber-500" />
                            <span className="text-[8px] font-black text-amber-500 uppercase">Pending</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};