import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
interface HistoryEntry { player: string; score: number; rootsAttempted: number; earnings: number; timestamp: number; details?: { root: string; meaning: string; question: string; userAnswer: number; correct: number; isCorrect: boolean; scoreChange: number }[]; }
export const WordPowerHistory: React.FC<{ history: HistoryEntry[]; historyFilter: 'Ayaan' | 'Riyaan'; setHistoryFilter: (f: 'Ayaan' | 'Riyaan') => void; onBack: () => void; }> = ({ history, historyFilter, setHistoryFilter, onBack }) => {
    const filtered = history.filter(h => h.player === historyFilter);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500 pb-24">
            <header className="flex items-center gap-4 mb-8"><button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button><h1 className="text-xl font-bold text-slate-900 dark:text-white">Word Power History</h1></header>
            <div className="flex gap-2 mb-6 max-w-md mx-auto">{(['Ayaan', 'Riyaan'] as const).map(name => <button key={name} onClick={() => setHistoryFilter(name)} className={`flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${historyFilter === name ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{name}</button>)}</div>
            <div className="max-w-md mx-auto space-y-3">
                {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No history yet</p>}
                {filtered.map((e, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}>
                            <div><p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(e.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}</p><p className="text-sm font-bold text-slate-600 dark:text-slate-300">Score: {e.score} · {e.rootsAttempted} roots</p></div>
                            <div className="flex items-center gap-3">
                                <span className={`font-black text-lg ${e.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>₹{e.earnings}</span>
                                {e.details && e.details.length > 0 && <div className="text-slate-400">{expandedIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>}
                            </div>
                        </div>
                        {expandedIndex === i && e.details && e.details.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                {e.details.map((d, dIdx) => (
                                    <div key={dIdx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <div className={`mt-0.5 p-1 rounded-full ${d.isCorrect ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-500'}`}>
                                            {d.isCorrect ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{d.root} <span className="text-slate-400 opacity-70">({d.meaning})</span></p>
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${d.scoreChange > 0 ? 'bg-emerald-100/50 text-emerald-600' : d.scoreChange < 0 ? 'bg-rose-100/50 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>{d.scoreChange > 0 ? '+' : ''}{d.scoreChange}</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{d.question}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
