import React from 'react';
import { ArrowLeft, History } from 'lucide-react';

interface HistoryEntry {
    player: string;
    score: number;
    levelReached: number;
    earnings: number;
    timestamp: number;
    grid?: number[];
    clickedNumbers?: number[];
    wrongClick?: number | null;
}

interface MemoryHistoryProps {
    history: HistoryEntry[];
    historyFilter: 'Ayaan' | 'Riyaan';
    setHistoryFilter: (f: 'Ayaan' | 'Riyaan') => void;
    onBack: () => void;
}

const MiniMemoryGrid: React.FC<{ entry: HistoryEntry }> = ({ entry }) => {
    if (!entry.grid || !entry.clickedNumbers) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-medium text-center px-4">Grid data not available</span>
            </div>
        );
    }

    // Determine grid size based on level reached. Level 4 uses 4x4 (16), Level 3 uses 3x3 (9)
    const size = entry.levelReached === 4 ? 4 : 3;
    const totalCells = size * size;
    const is4x4 = size === 4;

    // We only display the cells up to totalCells. The grid array holds the shuffled values.
    const cellsToRender = entry.grid.slice(0, totalCells);

    // Calculate maximum possible clicks for the level (to find if the last click was wrong)
    const hasWrongClick = entry.clickedNumbers.length < totalCells ||
        // If they clicked all numbers, but score is less than max possible, they might have clicked wrong at the very end
        (entry.levelReached === 3 && entry.score < 9) ||
        (entry.levelReached === 4 && entry.score < Math.max(0, 9 + (entry.clickedNumbers.length * 2) - 1));

    let wrongClickValue: number | null = null;
    let actualCorrectClicks = entry.clickedNumbers;

    // If the game ended prematurely (not all correct), the LAST in clickedNumbers is the wrong one, unless it was saved specially.
    // Based on how we save, we don't push the wrong click to clickedNumbers. It's just stopped.
    // Wait, let's look at the result. The engine returns wrongClick: number | null. We didn't save it directly in GameSession.
    // Let's deduce it: The clickedNumbers array ONLY contains correct clicks.
    // If the total sequence is broken before totalCells, they clicked something else.
    // Since we don't have the exact wrong number clicked stored in DB directly the easiest way is to highlight the missing numbers as hidden, and the clicked as correct.
    // However, if we know they made a mistake, the cell they should have clicked next was their failure point.

    return (
        <div className={`grid gap-1 ${is4x4 ? 'grid-cols-4' : 'grid-cols-3'} w-full max-w-[160px] mx-auto`}>
            {cellsToRender.map((value, idx) => {
                const isCorrect = entry.clickedNumbers!.includes(value);
                const isWrongClick = value === entry.wrongClick;

                let cellClass = "aspect-square flex items-center justify-center rounded-sm text-[10px] font-bold sm:rounded-md sm:text-xs text-white ";

                if (isCorrect) {
                    cellClass += "bg-emerald-500 shadow-sm";
                } else if (isWrongClick) {
                    cellClass += "bg-rose-500 shadow-sm";
                } else {
                    cellClass += "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500";
                }

                return (
                    <div key={idx} className={cellClass}>
                        {value}
                    </div>
                );
            })}
        </div>
    );
};

export const MemoryHistory: React.FC<MemoryHistoryProps> = ({
    history, historyFilter, setHistoryFilter, onBack
}) => {
    const filtered = history.filter(h => h.player === historyFilter);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">History</h1>
            </header>

            <div className="flex gap-2 mb-6 max-w-2xl mx-auto">
                {(['Ayaan', 'Riyaan'] as const).map(name => (
                    <button
                        key={name}
                        onClick={() => setHistoryFilter(name)}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all
                            ${historyFilter === name
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-100'
                                : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700 scale-[0.98] hover:scale-100'
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            <div className="w-full max-w-2xl mx-auto mb-4 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Correct</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-rose-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Wrong</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hidden</span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-4 pb-24">
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <History size={48} className="text-slate-200 dark:text-slate-800" />
                        <p className="text-sm text-slate-400 font-medium">No games played yet</p>
                    </div>
                )}
                {filtered.map((entry, i) => (
                    <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                        {new Date(entry.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                        {new Date(entry.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <span className={`font-black text-xl tabular-nums tracking-tighter ${entry.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {entry.earnings >= 0 ? '+' : ''}₹{entry.earnings}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{entry.score}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Level Reached</p>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{entry.levelReached === 4 ? '4×4' : '3×3'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-48 shrink-0 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                            <MiniMemoryGrid entry={entry} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
