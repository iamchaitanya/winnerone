import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';

interface HistoryEntry {
    player: string;
    score: number;
    wrongCount: number;
    earnings: number;
    timestamp: number;
    details?: any;
}

const HistoryCard: React.FC<{ e: HistoryEntry }> = ({ e }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const questions: any[] = e.details?.questions || [];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        {new Date(e.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {e.score} correct · {e.wrongCount} wrong
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`font-black text-lg ${e.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        ₹{e.earnings}
                    </span>
                    {questions.length > 0 && (
                        <div className="text-slate-400">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                    )}
                </div>
            </button>

            {isExpanded && questions.length > 0 && (
                <div className="px-4 pb-4 pt-1 space-y-2 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {questions.map((q, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/50 shadow-sm">
                                {q.correct ? (
                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                ) : (
                                    <XCircle size={14} className="text-rose-500 shrink-0" />
                                )}
                                <span className={`text-xs font-bold uppercase tracking-wide truncate ${q.correct ? 'text-slate-700 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {q.word || q.root || 'Unknown Word'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const VocabHistory: React.FC<{
    title: string;
    history: HistoryEntry[];
    historyFilter: 'Ayaan' | 'Riyaan';
    setHistoryFilter: (f: 'Ayaan' | 'Riyaan') => void;
    onBack: () => void;
}> = ({ title, history, historyFilter, setHistoryFilter, onBack }) => {
    const filtered = history.filter(h => h.player === historyFilter);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
            </header>

            <div className="flex gap-2 mb-6 max-w-md mx-auto">
                {(['Ayaan', 'Riyaan'] as const).map(name => (
                    <button
                        key={name}
                        onClick={() => setHistoryFilter(name)}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${historyFilter === name
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                                : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            <div className="max-w-md mx-auto space-y-3 pb-20">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                            <ArrowLeft size={24} className="rotate-45" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium italic">No history yet</p>
                    </div>
                ) : (
                    filtered.map((e, i) => <HistoryCard key={i} e={e} />)
                )}
            </div>
        </div>
    );
};
