import React from 'react';
import { ArrowLeft, IndianRupee } from 'lucide-react';

interface DailyRecord { dateKey: string; displayDate: string; timestamp: number; ayaanEarnings: number | null; riyaanEarnings: number | null; }

interface MemoryDashboardProps {
    ayaanTotal: number;
    riyaanTotal: number;
    groupedHistory: DailyRecord[];
    onBack: () => void;
}

export const MemoryDashboard: React.FC<MemoryDashboardProps> = ({ ayaanTotal, riyaanTotal, groupedHistory, onBack }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
        <header className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Memory Dashboard</h1>
        </header>
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Ayaan</p>
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-slate-900 dark:text-white"><IndianRupee size={20} />{ayaanTotal}</div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Riyaan</p>
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-slate-900 dark:text-white"><IndianRupee size={20} />{riyaanTotal}</div>
            </div>
        </div>
        <div className="max-w-md mx-auto space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Daily History</p>
            {groupedHistory.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No games played yet</p>}
            {groupedHistory.map(r => (
                <div key={r.dateKey} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{r.displayDate}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center"><p className="text-[10px] font-bold text-indigo-400 uppercase">Ayaan</p><p className={`font-black text-lg ${r.ayaanEarnings !== null ? (r.ayaanEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-300'}`}>{r.ayaanEarnings !== null ? `₹${r.ayaanEarnings}` : '—'}</p></div>
                        <div className="text-center"><p className="text-[10px] font-bold text-rose-400 uppercase">Riyaan</p><p className={`font-black text-lg ${r.riyaanEarnings !== null ? (r.riyaanEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-300'}`}>{r.riyaanEarnings !== null ? `₹${r.riyaanEarnings}` : '—'}</p></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
