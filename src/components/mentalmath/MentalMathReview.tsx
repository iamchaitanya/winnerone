import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { MentalMathResult } from '../../hooks/useMentalMathEngine';

interface MentalMathReviewProps {
    result: MentalMathResult | null;
    onBack: () => void;
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

export const MentalMathReview: React.FC<MentalMathReviewProps> = ({ result, onBack }) => {
    if (!result) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Step-by-Step Review</h1>
            </header>

            <div className="max-w-md mx-auto space-y-3">
                {result.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="w-10 h-10 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center font-black text-sm">
                            {step.stepNumber}
                        </div>
                        <div className="flex-1">
                            <span className="font-black text-lg text-slate-900 dark:text-white tabular-nums">
                                {step.operator ? `${operatorSymbol(step.operator)} ${step.operand}` : step.operand}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                            <p className="font-black text-lg text-cyan-500 tabular-nums">{step.runningTotal}</p>
                        </div>
                    </div>
                ))}

                <div className="mt-6 p-5 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Your Answer</p>
                            <p className={`text-2xl font-black tabular-nums ${result.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {result.userAnswer ?? '—'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Correct Answer</p>
                            <p className="text-2xl font-black text-emerald-500 tabular-nums">{result.correctAnswer}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
