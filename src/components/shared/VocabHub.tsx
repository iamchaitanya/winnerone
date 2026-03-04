import React from 'react';
import { ArrowLeft, User, Users, BarChart2, History, Check, Lock, CalendarX, Clock } from 'lucide-react';

interface VocabHubProps { title: string; onBack: () => void; onNavigate: (view: any) => void; onUserSelect: (user: string) => void; isMarketWorkingDay: boolean; dateOverride: string | null; isWeekend: boolean; isPublicHoliday: boolean; hasPlayedToday: (user: string) => boolean; isUserLocked: (user: string) => boolean; }

export const VocabHub: React.FC<VocabHubProps> = ({ title, onBack, onNavigate, onUserSelect, isMarketWorkingDay, dateOverride, isWeekend, isPublicHoliday, hasPlayedToday, isUserLocked }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h1>{!isMarketWorkingDay && <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase rounded-full tracking-wider border border-rose-200/50 dark:border-rose-800/50">Market Closed</span>}</div>
                        {dateOverride && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Override Active</span>}
                    </div>
                </div>
            </header>
            {!isMarketWorkingDay && <div className="mb-8 max-w-md mx-auto"><div className="p-5 rounded-[2rem] border bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30 flex items-center gap-4 shadow-sm"><div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20"><CalendarX size={20} /></div><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Market Status</p><p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{isWeekend ? 'Weekend Holiday' : isPublicHoliday ? 'Public Holiday' : 'Session Closed'}</p></div></div></div>}
            <section className="flex flex-col gap-4 max-w-md mx-auto">
                {(['Ayaan', 'Riyaan'] as const).map(name => (
                    <button key={name} onClick={() => onUserSelect(name)} className={`flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl transition-all group hover:border-${name === 'Ayaan' ? 'indigo' : 'rose'}-400 active:scale-[0.98]`}>
                        <div className="flex items-center gap-6 w-full">
                            <div className={`p-4 bg-${name === 'Ayaan' ? 'indigo' : 'rose'}-50 dark:bg-${name === 'Ayaan' ? 'indigo' : 'rose'}-900/30 text-${name === 'Ayaan' ? 'indigo' : 'rose'}-600 dark:text-${name === 'Ayaan' ? 'indigo' : 'rose'}-400 rounded-2xl group-hover:scale-110 transition-transform`}>
                                {isUserLocked(name) ? <Lock size={32} className="text-rose-500" /> : name === 'Ayaan' ? <User size={32} /> : <Users size={32} />}
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <span className={`font-black text-2xl tracking-tighter uppercase leading-none ${isUserLocked(name) ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{name.toUpperCase()} {isUserLocked(name) && '(LOCKED)'}</span>
                                {hasPlayedToday(name) && !isUserLocked(name) && <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><Check size={10} /> Completed Today</span>}
                            </div>
                        </div>
                    </button>
                ))}
                <button onClick={() => onNavigate('dash')} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:border-amber-400 transition-all active:scale-[0.98] group"><div className="flex items-center gap-6"><div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform"><BarChart2 size={32} /></div><span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">DASHBOARD</span></div></button>
                <button onClick={() => onNavigate('history')} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:border-indigo-400 transition-all active:scale-[0.98] group"><div className="flex items-center gap-6"><div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform"><History size={32} /></div><span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">HISTORY</span></div></button>
            </section>
        </div>
    );
};
