import React from 'react';
import { ArrowLeft, Check, X, Clock } from 'lucide-react';
import { MathMasteryResult } from '../../hooks/useMathMasteryEngine';

interface MathMasteryReviewProps {
    results: MathMasteryResult[];
    onBack: () => void;
}

export const MathMasteryReview: React.FC<MathMasteryReviewProps> = ({ results, onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300">
            <header className="flex items-center gap-4 mb-8 max-w-lg mx-auto w-full sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-20 py-4 -mt-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Review Answers</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Math Mastery Challenge</p>
                </div>
            </header>

            <div className="max-w-lg mx-auto space-y-3 pb-24">
                {results.map((r, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${r.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                    {r.isCorrect ? <Check size={16} /> : <X size={16} />}
                                </span>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                        Q{i + 1} • {r.category}
                                    </span>
                                    <p className="font-black text-slate-900 dark:text-white text-lg mt-1">{r.question}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                <Clock size={12} /> {r.timeTaken.toFixed(1)}s
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Your Answer</p>
                                <p className={`font-black text-lg ${r.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {r.userAnswer || 'Skipped'}
                                </p>
                            </div>
                            {!r.isCorrect && (
                                <div className="flex-1 border-l pl-3 border-slate-200 dark:border-slate-700">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Correct Answer</p>
                                    <p className="font-black text-emerald-500 text-lg">{r.answer}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
