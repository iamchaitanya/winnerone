import React from 'react';
import { IndianRupee, Check, XCircle, Award } from 'lucide-react';

interface MemoryResultsProps {
    level3Correct: number;
    level4Correct: number;
    totalScore: number;
    reachedLevel4: boolean;
    finalEarnings: number;
    onExit: () => void;
}

export const MemoryResults: React.FC<MemoryResultsProps> = ({
    level3Correct, level4Correct, totalScore, reachedLevel4, finalEarnings, onExit
}) => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${finalEarnings >= 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
            <IndianRupee size={64} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Memory Results</h2>
        <div className={`text-6xl font-black mb-8 tabular-nums ${finalEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>₹{finalEarnings}</div>
        <div className="grid grid-cols-2 gap-4 mb-4 w-full max-w-xs mx-auto">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">3×3 Grid</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{level3Correct}/9</p>
                <p className="text-[10px] text-slate-400">+{level3Correct} pts</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">4×4 Grid</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{reachedLevel4 ? `${level4Correct}/16` : '—'}</p>
                <p className="text-[10px] text-slate-400">{reachedLevel4 ? `+${level4Correct * 2} pts` : 'Not reached'}</p>
            </div>
        </div>
        {reachedLevel4 && (
            <div className="flex items-center gap-2 text-amber-500 font-bold text-sm mb-6">
                <Award size={16} /> Advanced to Level 4!
            </div>
        )}
        <button onClick={onExit} className="w-full max-w-sm h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg tracking-widest uppercase shadow-xl active:scale-95 transition-all mx-auto block">EXIT</button>
    </div>
);
