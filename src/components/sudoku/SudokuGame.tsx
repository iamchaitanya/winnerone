import React from 'react';
import { Check, Send } from 'lucide-react';

interface SudokuGameProps {
    grid: number[][];
    clues: boolean[][];
    selectedCell: [number, number] | null;
    onSelectCell: (row: number, col: number) => void;
    onSetValue: (row: number, col: number, value: number) => void;
    onClearCell: (row: number, col: number) => void;
    onSubmit: () => void;
    timeLeft: number;
}

export const SudokuGame: React.FC<SudokuGameProps> = ({
    grid, clues, selectedCell, onSelectCell, onSetValue, onClearCell, onSubmit, timeLeft
}) => {
    const filledCount = grid.flat().filter(v => v !== 0).length;
    const clueCount = clues.flat().filter(v => v).length;
    const userFilled = filledCount - clueCount;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-4 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <header className="grid grid-cols-3 items-center mb-4 max-w-lg mx-auto w-full">
                <div className="flex justify-start">
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                        <span className="font-black text-slate-900 dark:text-white text-xl tabular-nums min-w-[3ch] text-center">{timeLeft}s</span>
                    </div>
                </div>
                <div className="text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                    6×6 SUDOKU
                </div>
                <div className="flex justify-end items-center gap-2 font-black text-emerald-500 text-sm">
                    <Check size={16} />{userFilled}/18
                </div>
            </header>

            {/* Sudoku Grid */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="grid grid-cols-6 gap-0 border-2 border-slate-800 dark:border-slate-300 rounded-lg overflow-hidden max-w-xs mx-auto">
                    {grid.map((row, r) =>
                        row.map((cell, c) => {
                            const isClue = clues[r]?.[c];
                            const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                            const borderRight = c === 2 ? 'border-r-2 border-r-slate-800 dark:border-r-slate-300' : 'border-r border-r-slate-200 dark:border-r-slate-700';
                            const borderBottom = r === 1 || r === 3 ? 'border-b-2 border-b-slate-800 dark:border-b-slate-300' : 'border-b border-b-slate-200 dark:border-b-slate-700';
                            const lastCol = c === 5 ? '' : borderRight;
                            const lastRow = r === 5 ? '' : borderBottom;

                            return (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => !isClue && onSelectCell(r, c)}
                                    className={`
                    w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl font-black transition-all
                    ${lastCol} ${lastRow}
                    ${isClue
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white cursor-default'
                                            : isSelected
                                                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500'
                                                : cell !== 0
                                                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                                    : 'bg-white dark:bg-slate-900 text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }
                  `}
                                >
                                    {cell !== 0 ? cell : ''}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Number input pad */}
                <div className="mt-6 grid grid-cols-6 gap-2 max-w-xs mx-auto w-full">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                        <button
                            key={num}
                            onClick={() => {
                                if (selectedCell && !clues[selectedCell[0]]?.[selectedCell[1]]) {
                                    onSetValue(selectedCell[0], selectedCell[1], num);
                                }
                            }}
                            className="h-14 bg-slate-50 dark:bg-slate-900 text-xl font-black text-slate-900 dark:text-white rounded-2xl active:bg-indigo-100 dark:active:bg-indigo-900/50 shadow-sm transition-transform active:scale-95 border border-slate-200 dark:border-slate-700"
                        >
                            {num}
                        </button>
                    ))}
                </div>

                {/* Clear & Submit buttons */}
                <div className="mt-4 flex gap-3 max-w-xs mx-auto w-full">
                    <button
                        onClick={() => {
                            if (selectedCell && !clues[selectedCell[0]]?.[selectedCell[1]]) {
                                onClearCell(selectedCell[0], selectedCell[1]);
                            }
                        }}
                        className="flex-1 h-12 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm uppercase tracking-wider active:scale-95 transition-transform"
                    >
                        Clear
                    </button>
                    <button
                        onClick={onSubmit}
                        className="flex-1 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
                    >
                        <Send size={16} /> Submit
                    </button>
                </div>
            </div>
        </div>
    );
};
