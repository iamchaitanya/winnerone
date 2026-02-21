import React from 'react';
import { ArrowLeft, User, Users, Trophy, History, Lock, CalendarX, Timer, BarChart, Coffee, Clock, Check } from 'lucide-react';

interface NiftyHubProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  onUserSelect: (user: string) => void;
  isMarketOpenDay: boolean;
  isBeforePickDeadline: boolean;
  isAfterMarketClose: boolean;
  dateOverride: string | null;
  effectiveDate: Date;
  isWeekend: (date: Date) => boolean;
  isPublicHoliday: (date: Date) => boolean;
  hasPlayedToday: (player: string) => boolean;
  isUserLocked: (user: string) => boolean;
}

export const NiftyHub: React.FC<NiftyHubProps> = ({
  onBack,
  onNavigate,
  onUserSelect,
  isMarketOpenDay,
  isBeforePickDeadline,
  isAfterMarketClose,
  dateOverride,
  effectiveDate,
  isWeekend,
  isPublicHoliday,
  hasPlayedToday,
  isUserLocked
}) => {
  const ayaanPlayed = hasPlayedToday('Ayaan');
  const riyaanPlayed = hasPlayedToday('Riyaan');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Nifty 50 Game</h1>
              {!isMarketOpenDay && (
                <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase rounded-full tracking-wider border border-rose-200/50 dark:border-rose-800/50">
                  Market Closed
                </span>
              )}
            </div>
            {dateOverride && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Override Active</span>}
          </div>
        </div>
      </header>

      {/* Market Status Widget */}
      <div className="mb-8 max-w-md mx-auto">
        {!isMarketOpenDay ? (
          <div className="p-5 rounded-[2rem] border bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30 flex items-center gap-4 shadow-sm">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
              <CalendarX size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Market Status</p>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {isWeekend(effectiveDate) ? 'Weekend Holiday' : isPublicHoliday(effectiveDate) ? 'Public Holiday' : 'Market Closed'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Picks and trading are disabled today.</p>
            </div>
          </div>
        ) : (
          <div className={`p-5 rounded-[2rem] border shadow-sm ${isBeforePickDeadline ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30' : isAfterMarketClose ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl shadow-lg ${isBeforePickDeadline ? 'bg-indigo-500 text-white shadow-indigo-500/20' : isAfterMarketClose ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-500 text-white shadow-blue-500/20'}`}>
                  {isBeforePickDeadline ? <Timer size={20} /> : isAfterMarketClose ? <BarChart size={20} /> : <Coffee size={20} />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Current Window</p>
                  <p className="text-sm font-black uppercase tracking-tight">
                    {isBeforePickDeadline ? 'Accepting Picks' : isAfterMarketClose ? 'Results Ready' : 'Market Trading'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Settlement</p>
                <p className="text-sm font-black tabular-nums">15:30 IST</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="flex flex-col gap-4 max-w-md mx-auto">
        <button onClick={() => onUserSelect('Ayaan')} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl transition-all group hover:border-indigo-400 active:scale-[0.98]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
              {isUserLocked('Ayaan') ? <Lock size={32} className="text-rose-500" /> : <User size={32} />}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className={`font-black text-2xl tracking-tighter uppercase leading-none ${isUserLocked('Ayaan') ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                AYAAN {isUserLocked('Ayaan') && '(LOCKED)'}
              </span>
              {ayaanPlayed && !isUserLocked('Ayaan') && <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><Check size={10} /> Picked Today</span>}
            </div>
          </div>
        </button>
        
        <button onClick={() => onUserSelect('Riyaan')} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl transition-all group hover:border-rose-400 active:scale-[0.98]">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl group-hover:scale-110 transition-transform">
              {isUserLocked('Riyaan') ? <Lock size={32} className="text-rose-500" /> : <Users size={32} />}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className={`font-black text-2xl tracking-tighter uppercase leading-none ${isUserLocked('Riyaan') ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                RIYAAN {isUserLocked('Riyaan') && '(LOCKED)'}
              </span>
              {riyaanPlayed && !isUserLocked('Riyaan') && <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><Check size={10} /> Picked Today</span>}
            </div>
          </div>
        </button>

        <button onClick={() => onNavigate('dashboard')} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:border-amber-400 transition-all group">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform"><Trophy size={32} /></div>
            <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">LEADERBOARD</span>
          </div>
        </button>

        <button onClick={() => onNavigate('history')} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:border-indigo-400 transition-all group">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform"><History size={32} /></div>
            <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">MARKET LOG</span>
          </div>
        </button>
      </section>
    </div>
  );
};