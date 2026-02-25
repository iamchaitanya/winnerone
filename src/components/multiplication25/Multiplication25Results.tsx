import React from 'react';
import { IndianRupee, Eye, ArrowLeft } from 'lucide-react';

interface Multiplication25ResultsProps {
    finalSessionEarnings: number;
    finalScore: number;
    finalWrong: number;
    onReview: () => void;
    onExit: () => void;
}

export const Multiplication25Results: React.FC<Multiplication25ResultsProps> = ({
    finalSessionEarnings, finalScore, finalWrong, onReview, onExit
}) => {
    const skipped = 100 - finalScore - finalWrong;
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${finalSessionEarnings >= 0 ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
                <IndianRupee size={64} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Session Earnings</h2>
            <div className={`text-6xl font-black mb-3 tabular-nums ${finalSessionEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>₹{finalSessionEarnings}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">+₹2 correct · −₹2 wrong</p>
            <div className="grid grid-cols-3 gap-4 mb-12 w-full max-w-xs">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Correct</p>
                    <p className="text-2xl font-black text-emerald-500">{finalScore}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Wrong</p>
                    <p className="text-2xl font-black text-rose-500">{finalWrong}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Skipped</p>
                    <p className="text-2xl font-black text-slate-400">{skipped}</p>
                </div>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button onClick={onReview} className="h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                    <Eye size={18} /> Review Answers
                </button>
                <button onClick={onExit} className="h-16 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                    <ArrowLeft size={18} /> Back to Hub
                </button>
            </div>
        </div>
    );
};
