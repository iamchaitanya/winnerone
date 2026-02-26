import React, { useState } from 'react';
import { ArrowLeft, Crown, ChevronDown, ChevronUp } from 'lucide-react';

interface DailyRecord { dateKey: string; displayDate: string; timestamp: number; ayaanEarnings: number | null; ayaanTime: string | null; riyaanEarnings: number | null; riyaanTime: string | null; }

interface MultiplyDashboardProps {
    ayaanTotal: number; riyaanTotal: number; groupedHistory: DailyRecord[]; onBack: () => void;
}

export const MultiplyDashboard: React.FC<MultiplyDashboardProps> = ({ ayaanTotal, riyaanTotal, groupedHistory, onBack }) => {
    const [expanded, setExpanded] = useState<string | null>(null);
    const isAyaanLeading = ayaanTotal >= riyaanTotal;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Multiply Dashboard</h1>
            </header>

            <div className="max-w-md mx-auto mb-8 grid grid-cols-2 gap-4">
                <div className={`p-5 rounded-[2rem] border text-center ${isAyaanLeading ? 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                    {isAyaanLeading && <Crown size={16} className="text-pink-500 mx-auto mb-1" />}
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ayaan</p>
                    <p className={`text-2xl font-black tabular-nums ${ayaanTotal < 0 ? 'text-rose-500' : 'text-pink-600 dark:text-pink-400'}`}>₹{ayaanTotal}</p>
                </div>
                <div className={`p-5 rounded-[2rem] border text-center ${!isAyaanLeading ? 'bg-fuchsia-50 dark:bg-fuchsia-900/10 border-fuchsia-200 dark:border-fuchsia-800/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                    {!isAyaanLeading && <Crown size={16} className="text-fuchsia-500 mx-auto mb-1" />}
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riyaan</p>
                    <p className={`text-2xl font-black tabular-nums ${riyaanTotal < 0 ? 'text-rose-500' : 'text-fuchsia-600 dark:text-fuchsia-400'}`}>₹{riyaanTotal}</p>
                </div>
            </div>

            <div className="max-w-md mx-auto space-y-2">
                {groupedHistory.map(day => (
                    <div key={day.dateKey} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <button onClick={() => setExpanded(expanded === day.dateKey ? null : day.dateKey)} className="w-full flex items-center justify-between p-4">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{day.displayDate}</span>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 text-sm font-black tabular-nums">
                                    <span className={day.ayaanEarnings !== null ? (day.ayaanEarnings >= 0 ? 'text-pink-600' : 'text-rose-500') : 'text-slate-300'}>
                                        {day.ayaanEarnings !== null ? `₹${day.ayaanEarnings}` : '—'}
                                    </span>
                                    <span className="text-slate-200 dark:text-slate-700">|</span>
                                    <span className={day.riyaanEarnings !== null ? (day.riyaanEarnings >= 0 ? 'text-fuchsia-600' : 'text-rose-500') : 'text-slate-300'}>
                                        {day.riyaanEarnings !== null ? `₹${day.riyaanEarnings}` : '—'}
                                    </span>
                                </div>
                                {expanded === day.dateKey ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </div>
                        </button>
                        {expanded === day.dateKey && (
                            <div className="px-4 pb-4 grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                                    <p className="font-black text-slate-400 uppercase text-[9px] mb-1">Ayaan</p>
                                    <p className="font-black text-slate-900 dark:text-white">{day.ayaanEarnings !== null ? `₹${day.ayaanEarnings}` : 'Not played'}</p>
                                    {day.ayaanTime && <p className="text-[10px] text-slate-400 mt-0.5">Played {day.ayaanTime}</p>}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                                    <p className="font-black text-slate-400 uppercase text-[9px] mb-1">Riyaan</p>
                                    <p className="font-black text-slate-900 dark:text-white">{day.riyaanEarnings !== null ? `₹${day.riyaanEarnings}` : 'Not played'}</p>
                                    {day.riyaanTime && <p className="text-[10px] text-slate-400 mt-0.5">Played {day.riyaanTime}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
