import React from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { DivQuestionResult } from '../../hooks/useDivideEngine';

interface DivideReviewProps {
    sessionResults: DivQuestionResult[];
    onBack: () => void;
}

export const DivideReview: React.FC<DivideReviewProps> = ({ sessionResults, onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-300">
            <header className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Review Answers</h1>
            </header>
            <div className="max-w-lg mx-auto space-y-2">
                {sessionResults.map((r, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${r.isCorrect ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30'}`}>
                        <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${r.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                {r.isCorrect ? <Check size={14} /> : <X size={14} />}
                            </span>
                            <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                                {r.num1} <span className="text-sky-500">÷</span> {r.num2}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-black tabular-nums">
                            <span className={r.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{r.userAnswer.toFixed(2)}</span>
                            {!r.isCorrect && <span className="text-emerald-600 dark:text-emerald-400">{r.answer.toFixed(2)}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
