import React from 'react';
import { Check, Send, Delete } from 'lucide-react';
import { MathStep } from '../../hooks/useMentalMathEngine';

interface MentalMathQuizProps {
    phase: 'showing' | 'answering';
    currentStep: MathStep | null;
    stepsCompleted: number;
    timeLeft: number;
    answerTimeLeft: number;
    userInput: string;
    onNext: () => void;
    onKeyClick: (val: string) => void;
    onSubmit: () => void;
}

const operatorSymbol = (op: string | null) => {
    switch (op) {
        case '+': return '+';
        case '-': return '−';
        case '×': return '×';
        case '÷': return '÷';
        default: return '';
    }
};

export const MentalMathQuiz: React.FC<MentalMathQuizProps> = ({
    phase, currentStep, stepsCompleted, timeLeft, answerTimeLeft, userInput, onNext, onKeyClick, onSubmit
}) => {
    if (phase === 'showing') {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-right duration-300">
                <header className="grid grid-cols-3 items-center mb-8 max-w-lg mx-auto w-full">
                    <div className="flex justify-start">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                            <span className="font-black text-slate-900 dark:text-white text-xl tabular-nums min-w-[3ch] text-center">
                                {timeLeft}s
                            </span>
                        </div>
                    </div>
                    <div className="text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                        STEP {stepsCompleted}
                    </div>
                    <div className="flex justify-end items-center gap-2 font-black text-cyan-500 text-xl">
                        <Check size={20} />₹{stepsCompleted}
                    </div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center">
                    {currentStep?.operator === null ? (
                        /* First number — just show the digit */
                        <div className="text-9xl font-black text-slate-900 dark:text-white mb-8 tabular-nums animate-in zoom-in-95 duration-200">
                            {currentStep?.operand}
                        </div>
                    ) : (
                        /* Subsequent steps — show operator + number */
                        <div className="flex items-center gap-8 text-8xl font-black mb-8 animate-in zoom-in-95 duration-200">
                            <span className="text-cyan-500">{operatorSymbol(currentStep?.operator ?? null)}</span>
                            <span className="text-slate-900 dark:text-white tabular-nums">{currentStep?.operand}</span>
                        </div>
                    )}
                </div>

                <div className="mt-8 mb-6 max-w-xs mx-auto w-full">
                    <button
                        onClick={onNext}
                        className="w-full h-20 bg-cyan-500 hover:bg-cyan-600 text-white rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl shadow-cyan-500/20 uppercase tracking-wider"
                    >
                        NEXT
                    </button>
                </div>
            </div>
        );
    }

    // Phase 2: Answer input
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in fade-in duration-300">
            <header className="grid grid-cols-3 items-center mb-8 max-w-lg mx-auto w-full">
                <div className="flex justify-start">
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${answerTimeLeft <= 2 ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                        <span className={`font-black text-xl tabular-nums min-w-[3ch] text-center ${answerTimeLeft <= 2 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-amber-600 dark:text-amber-400'}`}>
                            {answerTimeLeft}s
                        </span>
                    </div>
                </div>
                <div className="text-center font-bold text-amber-500 uppercase tracking-widest text-[10px]">
                    ANSWER NOW
                </div>
                <div className="flex justify-end items-center gap-2 font-black text-cyan-500 text-xl">
                    <Check size={20} />₹{stepsCompleted}
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] mb-6">What is the running total?</p>
                <div className="w-full max-w-xs h-24 bg-slate-50 dark:bg-slate-900/50 rounded-3xl flex items-center justify-center border-2 border-dashed border-cyan-200 dark:border-cyan-800">
                    <span className="text-6xl font-black text-slate-900 dark:text-white tracking-widest tabular-nums">
                        {userInput || '___'}
                    </span>
                </div>
            </div>

            {/* Keypad */}
            <div className="mt-8 grid grid-cols-3 gap-3 mb-6 max-w-xs mx-auto w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => onKeyClick(num.toString())}
                        className="h-16 bg-slate-50 dark:bg-slate-900 text-2xl font-black text-slate-900 dark:text-white rounded-2xl active:bg-slate-200 shadow-sm transition-transform active:scale-95"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={() => onKeyClick('-')}
                    className="h-16 bg-cyan-50 dark:bg-cyan-900/30 text-2xl font-black text-cyan-600 dark:text-cyan-400 rounded-2xl active:bg-cyan-100 shadow-sm transition-transform active:scale-95"
                >
                    −
                </button>
                <button
                    onClick={() => onKeyClick('0')}
                    className="h-16 bg-slate-50 dark:bg-slate-900 text-2xl font-black text-slate-900 dark:text-white rounded-2xl active:bg-slate-200 shadow-sm transition-transform active:scale-95"
                >
                    0
                </button>
                <button
                    onClick={() => onKeyClick('DEL')}
                    className="h-16 bg-rose-50 dark:bg-rose-900/30 text-xl font-black text-rose-600 dark:text-rose-400 rounded-2xl active:bg-rose-100 shadow-sm transition-transform active:scale-95 flex items-center justify-center"
                >
                    <Delete size={22} />
                </button>
            </div>
            <div className="max-w-xs mx-auto w-full mb-4">
                <button
                    onClick={onSubmit}
                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 uppercase tracking-wider"
                >
                    <Send size={18} /> SUBMIT
                </button>
            </div>
        </div>
    );
};
