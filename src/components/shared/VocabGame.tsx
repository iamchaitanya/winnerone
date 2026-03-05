import React from 'react';
import { Check, X } from 'lucide-react';
import { VocabQuizQuestion } from '../../hooks/useVocabEngine';

interface VocabGameProps {
    title: string;
    currentQuestion: VocabQuizQuestion | null;
    currentIndex: number;
    totalQuestions: number;
    timeLeft: number;
    score: number;
    answered: number | null;
    isCorrectAnswer: boolean | null;
    onAnswer: (index: number) => void;
}

export const VocabGame: React.FC<VocabGameProps> = ({
    title, currentQuestion, currentIndex, totalQuestions, timeLeft, score, answered, isCorrectAnswer, onAnswer
}) => {
    if (!currentQuestion) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-4 animate-in slide-in-from-right duration-300">
            <header className="grid grid-cols-3 items-center mb-6 max-w-lg mx-auto w-full">
                <div className="flex justify-start">
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                        <span className="font-black text-slate-900 dark:text-white text-xl tabular-nums min-w-[3ch] text-center">{timeLeft}s</span>
                    </div>
                </div>
                <div className="text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                    Q{currentIndex + 1}/{totalQuestions}
                </div>
                <div className="flex justify-end items-center gap-2 font-black text-emerald-500 text-lg">
                    <Check size={18} />{score}
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${currentQuestion.questionType === 'antonym'
                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {currentQuestion.questionType === 'synonym' ? 'Synonym' :
                            currentQuestion.questionType === 'meaning' ? 'Meaning' : 'Antonym'}
                    </span>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{currentQuestion.word}</h3>
                    <p className="text-sm text-slate-400 font-bold mt-2">
                        Pick the {currentQuestion.questionType === 'synonym' ? 'synonym' :
                            currentQuestion.questionType === 'meaning' ? 'correct meaning' : 'antonym'}
                    </p>
                </div>

                <div className="space-y-3 w-full">
                    {currentQuestion.options.map((option, idx) => {
                        const isAnswered = answered !== null;
                        const isSelected = answered === idx;
                        const isCorrect = idx === currentQuestion.correctIndex;

                        return (
                            <button
                                key={idx}
                                onClick={() => onAnswer(idx)}
                                disabled={isAnswered}
                                className={`w-full p-4 rounded-2xl text-left font-bold text-sm transition-all border-2 ${isAnswered
                                    ? isCorrect
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                                        : isSelected
                                            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-400 text-rose-700 dark:text-rose-300'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400 active:scale-[0.98]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {isAnswered && isCorrect && <Check size={18} className="text-emerald-500" />}
                                    {isAnswered && isSelected && !isCorrect && <X size={18} className="text-rose-500" />}
                                    <span>{option}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
