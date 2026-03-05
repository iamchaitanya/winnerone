import React from 'react';
import { IndianRupee, Check, XCircle, BookOpen, Clock } from 'lucide-react';
export const WordPowerResults: React.FC<{ totalCorrect: number; totalWrong: number; totalUnanswered: number; totalScore: number; rootsAttempted: number; finalEarnings: number; onExit: () => void; }> = ({ totalCorrect, totalWrong, totalUnanswered, totalScore, rootsAttempted, finalEarnings, onExit }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${finalEarnings >= 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}><IndianRupee size={64} /></div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Word Power Results</h2>
        <div className={`text-6xl font-black mb-8 tabular-nums ${finalEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>₹{finalEarnings}</div>
        <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm mx-auto">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center"><Check size={20} className="mx-auto mb-1 text-emerald-500" /><p className="text-2xl font-black text-emerald-500">{totalCorrect}</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Correct</p></div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center"><XCircle size={20} className="mx-auto mb-1 text-rose-500" /><p className="text-2xl font-black text-rose-500">{totalWrong}</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Wrong</p></div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center"><Clock size={20} className="mx-auto mb-1 text-slate-400" /><p className="text-2xl font-black text-slate-500 dark:text-slate-400">{totalUnanswered}</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Unanswered</p></div>
        </div>
        <button onClick={onExit} className="w-full max-w-sm h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg tracking-widest uppercase shadow-xl active:scale-95 transition-all mx-auto block">EXIT</button>
    </div>
);
