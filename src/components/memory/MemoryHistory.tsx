import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HistoryEntry { player: string; score: number; levelReached: number; earnings: number; timestamp: number; }

interface MemoryHistoryProps {
    history: HistoryEntry[];
    historyFilter: 'Ayaan' | 'Riyaan';
    setHistoryFilter: (f: 'Ayaan' | 'Riyaan') => void;
    onBack: () => void;
}

export const MemoryHistory: React.FC<MemoryHistoryProps> = ({ history, historyFilter, setHistoryFilter, onBack }) => {
    const filtered = history.filter(h => h.player === historyFilter);
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Memory History</h1>
            </header>
            <div className="flex gap-2 mb-6 max-w-md mx-auto">
                {(['Ayaan', 'Riyaan'] as const).map(name => (
                    <button key={name} onClick={() => setHistoryFilter(name)} className={`flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${historyFilter === name ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{name}</button>
                ))}
            </div>
            <div className="max-w-md mx-auto space-y-3">
                {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No history yet</p>}
                {filtered.map((e, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(e.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}</p>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Score: {e.score} · Level: {e.levelReached === 4 ? '4×4' : '3×3'}</p>
                        </div>
                        <span className={`font-black text-lg ${e.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>₹{e.earnings}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
