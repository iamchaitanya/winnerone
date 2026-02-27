import React from 'react';
import { Target, TrendingUp, X, Check, Award, ArrowRight, BookOpen } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

interface MathMasteryResultsProps {
    finalSessionEarnings: number;
    score: number;
    wrong: number;
    onReview: () => void;
    onExit: () => void;
}

export const MathMasteryResults: React.FC<MathMasteryResultsProps> = ({
    finalSessionEarnings, score, wrong, onReview, onExit
}) => {
    const settings = useGameStore(s => s.settings);

    return (
        <div className="min-h-screen bg-indigo-500 dark:bg-indigo-600 flex flex-col p-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">

                <div className="mb-8 relative">
                    <div className="w-32 h-32 bg-white/10 rounded-full absolute inset-0 animate-ping opacity-20" />
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative z-10 border-4 border-indigo-300">
                        <Award size={64} className="text-indigo-500" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Challenge Complete!</h1>
                    <p className="text-indigo-100 font-medium">Math Mastery stats recorded</p>
                </div>

                <div className="w-full bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl mb-8 transform transition-all hover:scale-105">
                    <div className="text-center mb-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Earnings</p>
                        <p className={`text-5xl font-black tracking-tighter tabular-nums ${finalSessionEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {finalSessionEarnings >= 0 ? '+' : ''}₹{finalSessionEarnings}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center">
                            <Check size={24} className="text-emerald-500 mb-1" />
                            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{score}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Correct</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center">
                            <X size={24} className="text-rose-500 mb-1" />
                            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{wrong}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Wrong</span>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-3">
                    <button
                        onClick={onReview}
                        className="w-full h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        <BookOpen size={18} /> Review Answers
                    </button>
                    <button
                        onClick={onExit}
                        className="w-full h-16 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        Return to Hub <ArrowRight size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
};
