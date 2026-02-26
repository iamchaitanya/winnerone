import React from 'react';
import { Check } from 'lucide-react';
import { MulQuestion } from '../../hooks/useMultiplyEngine';

interface MultiplyQuizProps {
    currentQ: MulQuestion | undefined;
    currentIndex: number;
    timeLeft: number;
    score: number;
    userInput: string;
    onKeyClick: (val: string) => void;
}

export const MultiplyQuiz: React.FC<MultiplyQuizProps> = ({
    currentQ, currentIndex, timeLeft, score, userInput, onKeyClick
}) => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <header className="grid grid-cols-3 items-center mb-8 max-w-lg mx-auto w-full">
                <div className="flex justify-start">
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                        <span className="font-black text-slate-900 dark:text-white text-xl tabular-nums min-w-[3ch] text-center">{timeLeft}s</span>
                    </div>
                </div>
                <div className="text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">Q {currentIndex + 1}/100</div>
                <div className="flex justify-end items-center gap-2 font-black text-emerald-500 text-xl">
                    <Check size={20} />{score}
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center">
                <span className="mb-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                    Multiplication
                </span>
                <div className="flex items-center gap-6 text-7xl font-black text-slate-900 dark:text-white mb-4">
                    <span>{currentQ?.num1}</span>
                    <span className="text-pink-500">×</span>
                    <span>{currentQ?.num2}</span>
                </div>
                <div className="w-full max-w-xs h-24 bg-slate-50 dark:bg-slate-900/50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-6xl font-black text-slate-900 dark:text-white tracking-widest tabular-nums">
                        {userInput || '____'}
                    </span>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 mb-6 max-w-xs mx-auto w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button key={num} onClick={() => onKeyClick(num.toString())}
                        className="h-16 bg-slate-50 dark:bg-slate-900 text-2xl font-black text-slate-900 dark:text-white rounded-2xl active:bg-slate-200 shadow-sm transition-transform active:scale-95">
                        {num}
                    </button>
                ))}
                <div />
                <button onClick={() => onKeyClick('0')}
                    className="h-16 bg-slate-50 dark:bg-slate-900 text-2xl font-black text-slate-900 dark:text-white rounded-2xl active:bg-slate-200 shadow-sm transition-transform active:scale-95">
                    0
                </button>
                <div />
            </div>
        </div>
    );
};
