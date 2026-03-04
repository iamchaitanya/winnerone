import React from 'react';
import { Check, XCircle } from 'lucide-react';

interface MemoryGameProps {
    level: 3 | 4;
    grid: number[];
    isRevealed: boolean;
    clickedNumbers: number[];
    nextExpected: number;
    timeLeft: number;
    gameOver: boolean;
    wrongClick: number | null;
    onCellClick: (value: number) => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
    level, grid, isRevealed, clickedNumbers, nextExpected, timeLeft, gameOver, wrongClick, onCellClick
}) => {
    const gridSize = level === 3 ? 3 : 4;
    const totalCells = gridSize * gridSize;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-4 animate-in slide-in-from-right duration-300">
            <header className="grid grid-cols-3 items-center mb-6 max-w-lg mx-auto w-full">
                <div className="flex justify-start">
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                        <span className="font-black text-slate-900 dark:text-white text-xl tabular-nums min-w-[3ch] text-center">{timeLeft}s</span>
                    </div>
                </div>
                <div className="text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                    {level === 3 ? '3×3 GRID' : '4×4 GRID'}
                </div>
                <div className="flex justify-end items-center gap-2 font-black text-emerald-500 text-sm">
                    <Check size={16} />{clickedNumbers.length}/{totalCells}
                </div>
            </header>

            {isRevealed && (
                <div className="text-center mb-4">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">Memorize the numbers!</span>
                </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className={`grid gap-2 ${level === 3 ? 'grid-cols-3' : 'grid-cols-4'} max-w-xs mx-auto`}>
                    {grid.map((value, idx) => {
                        const isClicked = clickedNumbers.includes(value);
                        const isWrong = wrongClick === value;

                        return (
                            <button
                                key={idx}
                                onClick={() => onCellClick(value)}
                                disabled={isClicked || gameOver || isRevealed}
                                className={`
                  ${level === 3 ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16 sm:w-20 sm:h-20'} 
                  rounded-2xl font-black text-2xl flex items-center justify-center transition-all active:scale-95 border-2
                  ${isWrong
                                        ? 'bg-rose-100 dark:bg-rose-900/30 border-rose-400 text-rose-500'
                                        : isClicked
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                                            : isRevealed
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300'
                                                : 'bg-slate-900 dark:bg-slate-200 border-slate-800 dark:border-slate-300 text-transparent cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-300'
                                    }
                `}
                            >
                                {isRevealed || isClicked || isWrong ? value : '?'}
                            </button>
                        );
                    })}
                </div>

                {gameOver && (
                    <div className="mt-8 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center gap-3">
                        <XCircle size={24} className="text-rose-500" />
                        <div>
                            <p className="font-black text-rose-600 dark:text-rose-400 text-sm uppercase">Game Over!</p>
                            <p className="text-xs text-slate-500">You clicked {wrongClick} instead of {nextExpected}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
