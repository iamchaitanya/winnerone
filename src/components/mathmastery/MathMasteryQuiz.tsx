import React, { useEffect } from 'react';
import { Check, X, SkipForward, Send } from 'lucide-react';

interface MathMasteryQuizProps {
    currentQ: { question: string; category: string } | null;
    timeLeft: number;
    score: number;
    wrong: number;
    userInput: string;
    onKeyClick: (val: string) => void;
}

export const MathMasteryQuiz: React.FC<MathMasteryQuizProps> = ({
    currentQ,
    timeLeft,
    score,
    wrong,
    userInput,
    onKeyClick
}) => {
    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= '0' && e.key <= '9') onKeyClick(e.key);
            else if (e.key === '.') onKeyClick('.');
            else if (e.key === 'Backspace') onKeyClick('del');
            else if (e.key === 'Enter') onKeyClick('enter');
            else if (e.key === 'Escape') onKeyClick('clear');
            else if (e.key === 'ArrowRight') onKeyClick('skip');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onKeyClick]);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-right duration-300">
            <header className="flex justify-between items-center mb-8 max-w-lg mx-auto w-full">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                    <span className={`font-black text-xl tabular-nums min-w-[3ch] text-center ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                        {timeLeft}s
                    </span>
                </div>
                {currentQ?.category && (
                    <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        {currentQ.category}
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-black text-rose-500 text-lg">
                        <X size={18} />{wrong}
                    </div>
                    <div className="flex items-center gap-1.5 font-black text-emerald-500 text-lg">
                        <Check size={18} />{score}
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center -mt-8">
                <div className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-8 text-center px-4 leading-tight">
                    {currentQ?.question}
                </div>
                <div className="w-full max-w-xs h-20 sm:h-24 bg-slate-50 dark:bg-slate-900/50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-5xl font-black text-indigo-500 tracking-widest tabular-nums">
                        {userInput || ''}
                        <span className="animate-pulse opacity-50">_</span>
                    </span>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-xs mx-auto w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => onKeyClick(num.toString())}
                        className="h-14 sm:h-16 bg-slate-50 dark:bg-slate-900 text-2xl font-black text-slate-900 dark:text-white rounded-2xl active:bg-slate-200 shadow-sm transition-transform active:scale-95"
                    >
                        {num}
                    </button>
                ))}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 max-w-xs mx-auto w-full mb-3">
                <button
                    onClick={() => onKeyClick('.')}
                    className="h-14 sm:h-16 bg-slate-100 dark:bg-slate-800 text-2xl font-black text-slate-900 dark:text-white rounded-2xl active:bg-slate-200 shadow-sm transition-transform active:scale-95 flex items-center justify-center leading-none pb-2"
                >
                    .
                </button>
                <button
                    onClick={() => onKeyClick('0')}
                    className="h-14 sm:h-16 bg-slate-50 dark:bg-slate-900 text-2xl font-black text-slate-900 dark:text-white rounded-2xl active:bg-slate-200 shadow-sm transition-transform active:scale-95"
                >
                    0
                </button>
                <button
                    onClick={() => onKeyClick('del')}
                    className="h-14 sm:h-16 bg-rose-50 dark:bg-rose-900/20 text-2xl font-black text-rose-500 dark:text-rose-400 rounded-2xl active:bg-rose-100 shadow-sm transition-transform active:scale-95 flex items-center justify-center p-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" /><line x1="18" x2="12" y1="9" y2="15" /><line x1="12" x2="18" y1="9" y2="15" /></svg>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto w-full pb-8">
                <button
                    onClick={() => onKeyClick('skip')}
                    className="h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black active:scale-95 transition-transform flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                    <SkipForward size={16} /> Skip
                </button>
                <button
                    onClick={() => onKeyClick('enter')}
                    disabled={!userInput}
                    className={`h-14 rounded-2xl font-black active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs ${userInput ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50'}`}
                >
                    Enter <Send size={16} />
                </button>
            </div>
        </div>
    );
};
