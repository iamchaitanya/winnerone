import React from 'react';
import { Check, X, BookOpen } from 'lucide-react';
import { WordPowerRoot, WordPowerQuestion } from '../../lib/wordPowerRoots';

interface WordPowerGameProps {
    phase: 'root' | 'question';
    currentRoot: WordPowerRoot | null;
    currentQuestion: WordPowerQuestion | null;
    currentQuestionIndex: number;
    timeLeft: number;
    rootTimeLeft: number;
    answered: number | null;
    onAnswer: (index: number) => void;
}

export const WordPowerGame: React.FC<WordPowerGameProps> = ({
    phase, currentRoot, currentQuestion, currentQuestionIndex, timeLeft, rootTimeLeft, answered, onAnswer
}) => {
    if (!currentRoot) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-4 animate-in slide-in-from-right duration-300">
            <header className="grid grid-cols-3 items-center mb-6 max-w-lg mx-auto w-full">
                <div className="flex justify-start">
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                        <span className="font-black text-slate-900 dark:text-white text-xl tabular-nums min-w-[3ch] text-center">{timeLeft}s</span>
                    </div>
                </div>
                <div className="text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                    WORD POWER
                </div>
                <div className="flex justify-end items-center gap-2">
                    <BookOpen size={16} className="text-indigo-500" />
                    <span className="font-black text-indigo-500 text-sm">{currentRoot.root}</span>
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                {phase === 'root' ? (
                    <div className="text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen size={40} className="text-indigo-600" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{currentRoot.root}</h2>
                        <p className="text-xl text-indigo-600 dark:text-indigo-400 font-bold mb-6">"{currentRoot.meaning}"</p>
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <span className="text-sm font-bold text-slate-400">Memorize! Continuing in</span>
                            <span className="text-2xl font-black text-amber-500 tabular-nums animate-pulse">{rootTimeLeft}s</span>
                        </div>
                    </div>
                ) : currentQuestion ? (
                    <div className="w-full animate-in fade-in duration-200">
                        <div className="text-center mb-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Q{currentQuestionIndex + 1}/{currentRoot.questions.length} · Root: {currentRoot.root}
                            </p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentQuestion.word}</h3>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="text-sm text-slate-400 font-bold">What does this word mean?</span>
                                <span className="text-lg font-black text-amber-500 tabular-nums">{rootTimeLeft}s</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, idx) => {
                                const isAnswered = answered !== null;
                                const isSelected = answered === idx;
                                const isCorrect = idx === currentQuestion.correct;

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
                ) : null}
            </div>
        </div>
    );
};
