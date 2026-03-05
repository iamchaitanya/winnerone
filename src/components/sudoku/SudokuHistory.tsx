import React, { useState } from 'react';
import { ArrowLeft, History, Eye, EyeOff } from 'lucide-react';

interface HistoryEntry {
    player: string;
    score: number;
    wrong: number;
    earnings: number;
    timestamp: number;
    grid?: number[][];
    solution?: number[][];
    clues?: boolean[][];
}

interface SudokuHistoryProps {
    history: HistoryEntry[];
    historyFilter: 'Ayaan' | 'Riyaan';
    setHistoryFilter: (f: 'Ayaan' | 'Riyaan') => void;
    onBack: () => void;
}

const MiniSudokuGrid: React.FC<{ grid: number[][]; solution: number[][]; clues: boolean[][]; label: string }> = ({ grid, solution, clues, label }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <div className="grid grid-cols-6 gap-0 border-2 border-slate-700 dark:border-slate-400 rounded-lg overflow-hidden">
                {grid.map((row, r) =>
                    row.map((cell, c) => {
                        const isClue = clues[r]?.[c];
                        const isCorrect = cell !== 0 && cell === solution[r][c];
                        const isEmpty = cell === 0;
                        const borderRight = c === 2 ? 'border-r-2 border-r-slate-700 dark:border-r-slate-400' : 'border-r border-r-slate-200 dark:border-r-slate-700';
                        const borderBottom = r === 1 || r === 3 ? 'border-b-2 border-b-slate-700 dark:border-b-slate-400' : 'border-b border-b-slate-200 dark:border-b-slate-700';
                        const lastCol = c === 5 ? '' : borderRight;
                        const lastRow = r === 5 ? '' : borderBottom;

                        let bgColor = 'bg-white dark:bg-slate-900';
                        let textColor = 'text-slate-900 dark:text-white';

                        if (isClue) {
                            bgColor = 'bg-slate-100 dark:bg-slate-800';
                            textColor = 'text-slate-500 dark:text-slate-400';
                        } else if (isEmpty) {
                            bgColor = 'bg-amber-50 dark:bg-amber-900/20';
                            textColor = 'text-amber-400';
                        } else if (isCorrect) {
                            bgColor = 'bg-emerald-50 dark:bg-emerald-900/20';
                            textColor = 'text-emerald-600 dark:text-emerald-400';
                        } else {
                            bgColor = 'bg-rose-50 dark:bg-rose-900/20';
                            textColor = 'text-rose-600 dark:text-rose-400';
                        }

                        return (
                            <div
                                key={`${r}-${c}`}
                                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-black ${lastCol} ${lastRow} ${bgColor} ${textColor}`}
                            >
                                {cell !== 0 ? cell : '·'}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const SolutionGrid: React.FC<{ solution: number[][]; clues: boolean[][] }> = ({ solution, clues }) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Solution</p>
            <div className="grid grid-cols-6 gap-0 border-2 border-emerald-500/50 rounded-lg overflow-hidden">
                {solution.map((row, r) =>
                    row.map((cell, c) => {
                        const isClue = clues[r]?.[c];
                        const borderRight = c === 2 ? 'border-r-2 border-r-emerald-500/50' : 'border-r border-r-slate-200 dark:border-r-slate-700';
                        const borderBottom = r === 1 || r === 3 ? 'border-b-2 border-b-emerald-500/50' : 'border-b border-b-slate-200 dark:border-b-slate-700';
                        const lastCol = c === 5 ? '' : borderRight;
                        const lastRow = r === 5 ? '' : borderBottom;

                        return (
                            <div
                                key={`${r}-${c}`}
                                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-black ${lastCol} ${lastRow} ${isClue
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                        : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400'
                                    }`}
                            >
                                {cell}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export const SudokuHistory: React.FC<SudokuHistoryProps> = ({
    history, historyFilter, setHistoryFilter, onBack
}) => {
    const filtered = history.filter(h => h.player === historyFilter);
    const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});

    const toggleSolution = (idx: number) => {
        setShowSolution(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300">
            <header className="flex flex-col gap-6 mb-8 max-w-lg mx-auto w-full">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sudoku History</h1>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-full">
                    {(['Ayaan', 'Riyaan'] as const).map(name => (
                        <button key={name} onClick={() => setHistoryFilter(name)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${historyFilter === name
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}>
                            {name}
                        </button>
                    ))}
                </div>
            </header>

            <div className="max-w-lg mx-auto space-y-6 mb-12">
                {filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm px-5 py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                                <History size={32} className="text-slate-200 dark:text-slate-600" />
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No records found</p>
                        </div>
                    </div>
                ) : (
                    filtered.map((entry, i) => {
                        const date = new Date(entry.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' });
                        const time = new Date(entry.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
                        const hasGridData = entry.grid && entry.solution && entry.clues;
                        const isSolutionVisible = showSolution[i] || false;

                        return (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</p>
                                        <p className="text-[9px] font-medium text-slate-300 dark:text-slate-600 tabular-nums">{time}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-lg font-black tabular-nums ${entry.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            ₹{entry.earnings}
                                        </span>
                                        <p className="text-[9px] font-bold text-slate-400">
                                            {entry.score} correct · {entry.wrong} wrong
                                        </p>
                                    </div>
                                </div>

                                {/* Grids */}
                                {hasGridData ? (
                                    <div className="p-4">
                                        <div className={`flex flex-col items-center gap-4 ${isSolutionVisible ? 'sm:flex-row sm:justify-center sm:items-start sm:gap-6' : ''}`}>
                                            <MiniSudokuGrid grid={entry.grid!} solution={entry.solution!} clues={entry.clues!} label="Your Answer" />
                                            {isSolutionVisible && (
                                                <SolutionGrid solution={entry.solution!} clues={entry.clues!} />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => toggleSolution(i)}
                                            className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
                                        >
                                            {isSolutionVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                            {isSolutionVisible ? 'Hide Solution' : 'Show Solution'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-slate-300 dark:text-slate-700 text-xs italic">
                                        Grid data not available
                                    </div>
                                )}

                                {/* Legend */}
                                <div className="px-5 py-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Clue</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"></div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Correct</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"></div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Wrong</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"></div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Empty</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
