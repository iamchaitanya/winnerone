import React, { useState } from 'react';
import { ArrowLeft, History, ChevronDown, ChevronUp } from 'lucide-react';
import { MentalMathReview } from './MentalMathReview';

interface HistoryEntry {
    player: string;
    timestamp: number;
    stepsCompleted: number;
    isCorrect: boolean;
    correctAnswer: number;
    userAnswer: number | null;
    earnings: number;
    details: any; // full MentalMathResult
}

interface MentalMathHistoryProps {
    historyEntries: HistoryEntry[];
    historyFilter: 'Ayaan' | 'Riyaan';
    setHistoryFilter: (f: 'Ayaan' | 'Riyaan') => void;
    onBack: () => void;
}

export const MentalMathHistory: React.FC<MentalMathHistoryProps> = ({
    historyEntries, historyFilter, setHistoryFilter, onBack
}) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300">
            <header className="flex flex-col gap-6 mb-8 max-w-lg mx-auto w-full">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mental Math History</h1>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-full">
                    {(['Ayaan', 'Riyaan'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => { setHistoryFilter(filter); setExpandedIndex(null); }}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${historyFilter === filter
                                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </header>

            <div className="max-w-lg mx-auto space-y-3 mb-12">
                {historyEntries.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm px-5 py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                                <History size={32} className="text-slate-200 dark:text-slate-600" />
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No records found</p>
                        </div>
                    </div>
                )}
                {historyEntries.map((entry, i) => {
                    const isExpanded = expandedIndex === i;
                    return (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <button
                                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                                className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 ${entry.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                    {entry.isCorrect ? '✓' : '✗'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 dark:text-white text-sm">
                                        {entry.stepsCompleted} steps → {entry.userAnswer ?? '—'} {entry.isCorrect ? '= ' : '≠ '}{entry.correctAnswer}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold">
                                        {new Date(entry.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}
                                        {' '}
                                        {new Date(entry.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`font-black tabular-nums ${entry.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        ₹{entry.earnings}
                                    </span>
                                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </div>
                            </button>

                            {isExpanded && entry.details && (
                                <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/20 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-2">
                                        {(entry.details.steps || []).map((step: any, si: number) => (
                                            <div key={si} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <div className="w-7 h-7 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg flex items-center justify-center font-black text-[10px]">
                                                    {step.stepNumber}
                                                </div>
                                                <span className="font-black text-sm text-slate-900 dark:text-white tabular-nums flex-1">
                                                    {step.operator ? `${step.operator === '-' ? '−' : step.operator} ${step.operand}` : step.operand}
                                                </span>
                                                <span className="font-black text-sm text-cyan-500 tabular-nums">= {step.runningTotal}</span>
                                            </div>
                                        ))}
                                        <div className="mt-3 flex justify-between items-center px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Your Answer</p>
                                                <p className={`text-lg font-black tabular-nums ${entry.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {entry.userAnswer ?? '—'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase">Correct</p>
                                                <p className="text-lg font-black text-emerald-500 tabular-nums">{entry.correctAnswer}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
