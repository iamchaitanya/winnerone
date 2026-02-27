import React from 'react';
import { CheckCircle, XCircle, Eye, ArrowLeft } from 'lucide-react';

interface MentalMathResultsProps {
    finalSessionEarnings: number;
    stepsCompleted: number;
    isCorrect: boolean;
    correctAnswer: number;
    userAnswer: number | null;
    onReview: () => void;
    onExit: () => void;
}

export const MentalMathResults: React.FC<MentalMathResultsProps> = ({
    finalSessionEarnings, stepsCompleted, isCorrect, correctAnswer, userAnswer, onReview, onExit
}) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500 text-center">
            <div className={`w-24 h-24 rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {isCorrect ? <CheckCircle size={48} className="text-white" /> : <XCircle size={48} className="text-white" />}
            </div>

            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                {isCorrect ? 'Correct!' : 'Wrong!'}
            </h2>

            <div className="flex items-center gap-4 mb-8">
                <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Your Answer</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{userAnswer ?? '—'}</p>
                </div>
                <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Correct Answer</p>
                    <p className="text-2xl font-black text-emerald-500 tabular-nums">{correctAnswer}</p>
                </div>
            </div>

            <div className="flex items-center gap-6 mb-12">
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Steps</p>
                    <p className="text-3xl font-black text-cyan-500 tabular-nums">{stepsCompleted}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Earnings</p>
                    <p className={`text-3xl font-black tabular-nums ${finalSessionEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        ₹{finalSessionEarnings}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button onClick={onReview} className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl">
                    <Eye size={20} /> REVIEW STEPS
                </button>
                <button onClick={onExit} className="w-full h-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg">
                    <ArrowLeft size={20} /> BACK TO HUB
                </button>
            </div>
        </div>
    );
};
