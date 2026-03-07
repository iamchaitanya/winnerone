import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Calendar, User, Users, Activity, Clock, ChevronDown, ChevronUp, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, handleSupabaseError } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { getISTDateKey } from '../src/lib/dateUtils';

interface DailyHistoryViewProps { onBack: () => void; }

interface GameEntry {
    id: string;
    game: string;
    player: string;
    earnings: number;
    score: number;
    timestamp: number;
    displayTime: string;
    details: any;
}

const GAME_TABLES = [
    { table: 'addition_logs', game: 'Addition', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'subtraction_logs', game: 'Subtraction', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'multiplication_logs', game: 'Multiplication', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'multiplication25_logs', game: 'Multiplication 25', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'multiply_logs', game: 'Multiply', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'divide_logs', game: 'Divide', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'mentalmath_logs', game: 'Mental Math', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'mathmastery_logs', game: 'Math Mastery', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'nifty_logs', game: 'Nifty 50', earningsField: 'earnings', scoreField: null, dateField: 'created_at' },
    { table: 'sensex_logs', game: 'Sensex', earningsField: 'earnings', scoreField: null, dateField: 'created_at' },
    { table: 'sudoku_logs', game: 'Sudoku', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'memory_logs', game: 'Memory', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'wordpower_logs', game: 'Word Power', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'barron800_logs', game: 'Barron 800', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
    { table: 'manhattan500_logs', game: 'Manhattan 500', earningsField: 'earnings', scoreField: 'score', dateField: 'played_at' },
];

type PlayerFilter = 'Ayaan' | 'Riyaan';

export const DailyHistoryView: React.FC<DailyHistoryViewProps> = ({ onBack }) => {
    const [allEntries, setAllEntries] = useState<GameEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState<string>(getISTDateKey(new Date()));
    const [playerFilter, setPlayerFilter] = useState<PlayerFilter>('Ayaan');
    const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());
    const [showSudokuSolutions, setShowSudokuSolutions] = useState<Record<string, boolean>>({});

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        const entries: GameEntry[] = [];

        // Calculate the boundaries of the selected date in IST
        const startOfDay = `${selectedDate}T00:00:00+05:30`;
        const endOfDay = `${selectedDate}T23:59:59+05:30`;

        // The specific player ID we care about right now
        const targetPlayerId = playerFilter === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan;

        for (const gt of GAME_TABLES) {
            try {
                const { data, error } = await supabase
                    .from(gt.table)
                    .select('*')
                    .eq('player_id', targetPlayerId)
                    .gte(gt.dateField, startOfDay)
                    .lte(gt.dateField, endOfDay)
                    .order(gt.dateField, { ascending: false });

                if (error) {
                    console.error(`Error fetching ${gt.game}:`, error);
                }
                if (data) {
                    for (const row of data) {
                        const timestamp = new Date(row[gt.dateField]).getTime();
                        entries.push({
                            id: row.id || crypto.randomUUID(),
                            game: gt.game,
                            player: playerFilter,
                            earnings: row[gt.earningsField] || 0,
                            score: gt.scoreField ? (row[gt.scoreField] || 0) : 0,
                            timestamp: timestamp,
                            displayTime: new Date(timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
                            details: row
                        });
                    }
                }
            } catch (err) {
                console.error(`Exception fetching ${gt.game}:`, err);
            }
        }

        // Sort globally across all games by time purely for grouped ordering consistency
        entries.sort((a, b) => b.timestamp - a.timestamp);
        setAllEntries(entries);
        setLoading(false);
    }, [selectedDate, playerFilter]);

    // Refetch whenever the date or player changes
    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const filteredGames = allEntries;

    // Group the games by Game Name
    const gamesGrouped = useMemo(() => {
        const groups: Record<string, { gameName: string, sessions: GameEntry[], totalEarnings: number }> = {};

        filteredGames.forEach(e => {
            if (!groups[e.game]) {
                groups[e.game] = { gameName: e.game, sessions: [], totalEarnings: 0 };
            }

            // Deduplicate Sensex and Nifty 50 to max 1 session per day (they are already filtered by date and player)
            if (['Sensex', 'Nifty 50'].includes(e.game)) {
                if (groups[e.game].sessions.length === 0) {
                    groups[e.game].sessions.push(e);
                    groups[e.game].totalEarnings += e.earnings;
                }
            } else {
                groups[e.game].sessions.push(e);
                groups[e.game].totalEarnings += e.earnings;
            }
        });

        // Convert to array and order based on the static GAME_TABLES array for consistency
        return Object.values(groups).sort((a, b) => {
            const idxA = GAME_TABLES.findIndex(g => g.game === a.gameName);
            const idxB = GAME_TABLES.findIndex(g => g.game === b.gameName);
            return (idxA !== -1 && idxB !== -1) ? idxA - idxB : 0;
        });
    }, [filteredGames]);

    const totalEarnings = filteredGames.reduce((sum, g) => sum + g.earnings, 0);

    const displayDateString = useMemo(() => {
        const d = new Date(selectedDate);
        if (isNaN(d.getTime())) return selectedDate;
        return d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }, [selectedDate]);

    const toggleGameExpand = (gameName: string) => {
        setExpandedGames(prev => {
            const next = new Set(prev);
            if (next.has(gameName)) next.delete(gameName);
            else next.add(gameName);
            return next;
        });
    };

    const offsetDate = (days: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(getISTDateKey(d));
    };

    const renderGameDetails = (gameName: string, row: any) => {
        if (!row) return <div className="text-xs text-slate-400 italic py-2 px-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl">No detailed log available</div>;

        // Robust data parsing
        const getDetails = (r: any) => {
            if (!r || !r.details) return {};
            if (typeof r.details === 'string') {
                try { return JSON.parse(r.details); } catch (e) { return {}; }
            }
            return r.details;
        };

        const details = getDetails(row);

        switch (gameName) {
            case 'Mental Math':
                if (!details || !details.steps) {
                    return <div className="text-xs text-slate-400 italic py-2 px-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl">No detailed log available</div>;
                }

                const mmIsCorrect = row.wrong_count === 0;
                return (
                    <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0 ${mmIsCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                {mmIsCorrect ? '✓' : '✗'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-slate-900 dark:text-white text-sm">
                                    {row.score} steps → {details.userAnswer ?? '—'} {mmIsCorrect ? '= ' : '≠ '}{details.correctAnswer}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {(details.steps || []).map((step: any, si: number) => (
                                <div key={si} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="w-7 h-7 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg flex items-center justify-center font-black text-[10px]">
                                        {step.stepNumber}
                                    </div>
                                    <span className="font-black text-sm text-slate-900 dark:text-white tabular-nums flex-1">
                                        {step.operator ? `${step.operator === '-' ? '−' : step.operator} ${step.operand}` : step.operand}
                                    </span>
                                    <span className="font-black text-sm text-cyan-500 tabular-nums">= {step.runningTotal}</span>
                                </div>
                            ))}
                            <div className="mt-3 flex justify-between items-center px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Your Answer</p>
                                    <p className={`text-lg font-black tabular-nums ${mmIsCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {details.userAnswer ?? '—'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Correct</p>
                                    <p className="text-lg font-black text-emerald-500 tabular-nums">{details.correctAnswer}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Addition':
            case 'Subtraction':
            case 'Multiplication':
            case 'Multiply':
            case 'Multiplication 25':
            case 'Divide':
            case 'Math Mastery':
                // For these math games, details is an array of questions
                const mathResults = Array.isArray(details) ? details : (details.questions || []);
                if (mathResults.length === 0) return <div className="text-xs text-slate-400 italic py-2">No detailed log available</div>;

                return (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left table-auto min-w-[300px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ques</th>
                                    <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ans</th>
                                    <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Corr</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {mathResults.map((res: any, i: number) => {
                                    let timeStr = '-';
                                    if (res.timeTaken !== undefined && res.timeTaken !== null) {
                                        const t = Number(res.timeTaken);
                                        timeStr = t > 500 ? `${(t / 1000).toFixed(1)}s` : `${t.toFixed(1)}s`;
                                    }

                                    let expression = res.expression || res.equation || res.question;
                                    if (!expression) {
                                        let operator = '+';
                                        if (gameName === 'Subtraction') operator = '-';
                                        if (gameName === 'Multiplication' || gameName === 'Multiply' || gameName === 'Multiplication 25' || res.type === 'multiply') operator = '×';
                                        if (gameName === 'Divide' || res.type === 'divide') operator = '÷';
                                        const op1 = res.operand1 !== undefined ? res.operand1 : res.num1;
                                        const op2 = res.operand2 !== undefined ? res.operand2 : res.num2;
                                        expression = `${op1} ${operator} ${op2}`;
                                    }

                                    const userAnswerStr = res.userAnswer !== undefined ? res.userAnswer : '-';
                                    const correctAnswerStr = res.answer !== undefined ? res.answer : (res.correctAnswer !== undefined ? res.correctAnswer : (res.expectedAnswer !== undefined ? res.expectedAnswer : '-'));

                                    return (
                                        <tr key={i} className={`transition-colors ${res.isCorrect ? 'bg-emerald-50/30 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'bg-rose-50/30 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">{expression}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`text-sm font-bold tabular-nums ${res.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{userAnswerStr}</span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{correctAnswerStr}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-xs text-slate-400 tabular-nums font-bold uppercase">{timeStr}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );

            case 'Word Power':
            case 'Barron 800':
            case 'Manhattan 500':
                const vocabArray = details.details || details.questions || (Array.isArray(details) ? details : []);
                if (vocabArray.length === 0) return <div className="text-xs text-slate-400 italic py-2">No detailed log available</div>;

                return (
                    <div className="space-y-3">
                        {vocabArray.map((vItem: any, i: number) => {
                            // Support both isCorrect (Word Power) and correct (Barron/Manhattan)
                            const isCorrect = vItem.isCorrect !== undefined ? vItem.isCorrect : vItem.correct;
                            const mainLabel = vItem.word || vItem.root || 'WORD';
                            const subLabel = vItem.meaning || vItem.definition;
                            const showSubLabel = subLabel && subLabel.toLowerCase() !== 'n/a';

                            return (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-sm">
                                    <div className={`mt-0.5 p-1 rounded-full flex-shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-500'}`}>
                                        {isCorrect ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest truncate">
                                                {mainLabel} {showSubLabel && <span className="text-slate-400 lowercase italic opacity-80">({subLabel})</span>}
                                            </p>
                                            {vItem.scoreChange !== undefined && (
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded tabular-nums ${vItem.scoreChange > 0 ? 'bg-emerald-100/50 text-emerald-600' : vItem.scoreChange < 0 ? 'bg-rose-100/50 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                                                    {vItem.scoreChange > 0 ? '+' : ''}{vItem.scoreChange}
                                                </span>
                                            )}
                                        </div>
                                        {vItem.question && vItem.question !== vItem.word && (
                                            <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-tight">
                                                {vItem.question}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );

            case 'Sensex':
                return (
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Prediction</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Return</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-4 text-center border-r border-slate-50 dark:border-slate-800/50">
                                        <div className={`text-sm font-black uppercase tracking-tight ${row.prediction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            Sensex {row.prediction}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {row.actual_return !== null && row.actual_return !== undefined ? (
                                            <div className={`text-sm font-black tabular-nums ${row.actual_return >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {row.actual_return >= 0 ? '+' : ''}{Number(row.actual_return).toFixed(2)}%
                                            </div>
                                        ) : <span className="text-[10px] font-bold text-slate-400 uppercase">Market Open</span>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );

            case 'Nifty 50':
                return (
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Return</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-4 text-center border-r border-slate-50 dark:border-slate-800/50">
                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{row.stock_symbol || '—'}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {row.stock_return !== null && row.stock_return !== undefined ? (
                                            <div className={`text-sm font-black tabular-nums ${row.stock_return >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {row.stock_return >= 0 ? '+' : ''}{Number(row.stock_return).toFixed(2)}%
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Pending</span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );

            case 'Sudoku':
                const isSudokuSolutionVisible = showSudokuSolutions[row.id] || false;
                const hasSudokuGrid = details.grid && details.solution && details.clues;
                return (
                    <div className="flex flex-col items-center gap-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-center gap-12 w-full px-6">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{row.score}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wrong</p>
                                <p className="text-2xl font-black text-rose-500 tabular-nums">{row.wrong_count || 0}</p>
                            </div>
                        </div>

                        {hasSudokuGrid ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className={`flex flex-col items-center gap-6 ${isSudokuSolutionVisible ? 'lg:flex-row lg:items-start lg:justify-center' : ''}`}>
                                    {/* User Grid */}
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Your Answer</p>
                                        <div className="p-2 bg-white dark:bg-slate-950 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800">
                                            <div className="grid grid-cols-6 gap-0 border-2 border-slate-700 dark:border-slate-400 rounded-lg overflow-hidden">
                                                {details.grid.map((sRow: number[], r: number) =>
                                                    sRow.map((cell: number, c: number) => {
                                                        const isClue = details.clues[r]?.[c];
                                                        const isCorrect = cell !== 0 && cell === details.solution[r][c];
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
                                                            <div key={`${r}-${c}`} className={`w-8 h-8 flex items-center justify-center text-xs font-black ${lastCol} ${lastRow} ${bgColor} ${textColor}`}>
                                                                {cell !== 0 ? cell : '·'}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Solution Grid */}
                                    {isSudokuSolutionVisible && (
                                        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Correct Solution</p>
                                            <div className="p-2 bg-white dark:bg-slate-950 rounded-xl shadow-inner border border-emerald-100 dark:border-emerald-900/30">
                                                <div className="grid grid-cols-6 gap-0 border-2 border-emerald-500/50 rounded-lg overflow-hidden">
                                                    {details.solution.map((sRow: number[], r: number) =>
                                                        sRow.map((cell: number, c: number) => {
                                                            const isClue = details.clues[r]?.[c];
                                                            const borderRight = c === 2 ? 'border-r-2 border-r-emerald-500/50' : 'border-r border-slate-200 dark:border-slate-700';
                                                            const borderBottom = r === 1 || r === 3 ? 'border-b-2 border-b-emerald-500/50' : 'border-b border-slate-200 dark:border-slate-700';
                                                            const lastCol = c === 5 ? '' : borderRight;
                                                            const lastRow = r === 5 ? '' : borderBottom;

                                                            return (
                                                                <div key={`${r}-${c}`} className={`w-8 h-8 flex items-center justify-center text-xs font-black ${lastCol} ${lastRow} ${isClue ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400'}`}>
                                                                    {cell}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowSudokuSolutions(prev => ({ ...prev, [row.id]: !isSudokuSolutionVisible }))}
                                    className="flex items-center gap-2 px-4 py-2 font-black text-[10px] uppercase tracking-widest bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm text-slate-500"
                                >
                                    <Activity size={12} className={isSudokuSolutionVisible ? 'text-rose-500' : 'text-emerald-500'} />
                                    {isSudokuSolutionVisible ? 'Hide Solution' : 'Show Solution'}
                                </button>

                                <div className="flex items-center justify-center gap-4 flex-wrap mt-2">
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Clue</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Correct</span></div>
                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Wrong</span></div>
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 py-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400 italic mx-4 text-center leading-relaxed">
                                Grid data not available for this session
                            </div>
                        )}
                    </div>
                );

            case 'Memory':
                const hasMemGrid = details.grid && details.clickedNumbers;
                const memSize = details.levelReached === 4 ? 4 : 3;
                return (
                    <div className="flex flex-col items-center gap-6 py-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-center gap-12 w-full px-6">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{row.score}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Level</p>
                                <p className="text-2xl font-black text-indigo-500 tabular-nums">{memSize === 4 ? '4×4' : '3×3'}</p>
                            </div>
                        </div>

                        {hasMemGrid ? (
                            <div className="w-full max-w-[160px] mx-auto p-3 bg-white dark:bg-slate-950 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800 px-4 py-4">
                                <div className={`grid gap-1.5 ${memSize === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                    {details.grid.slice(0, memSize * memSize).map((val: number, idx: number) => {
                                        const isCorrect = details.clickedNumbers.includes(val);
                                        const isWrong = val === details.wrongClick;
                                        return (
                                            <div key={idx} className={`aspect-square flex items-center justify-center rounded-lg text-xs font-black shadow-sm transition-transform ${isCorrect ? 'bg-emerald-500 text-white' :
                                                isWrong ? 'bg-rose-500 text-white animate-pulse' :
                                                    'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                                                }`}>
                                                {val}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 py-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400 italic mx-4 text-center leading-relaxed">
                                Grid data not available for this session
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Correct</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-rose-500"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Wrong</span></div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading && allEntries.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                    <Activity size={20} className="text-indigo-500 animate-bounce" />
                    Fetching Data...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 animate-in fade-in duration-500 pb-32">
            <div className="max-w-4xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Performance Review</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Game Drill-Down</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-full sm:w-72 mt-4 sm:mt-0">
                        <button onClick={() => setPlayerFilter('Ayaan')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${playerFilter === 'Ayaan' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            Ayaan
                        </button>
                        <button onClick={() => setPlayerFilter('Riyaan')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${playerFilter === 'Riyaan' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            Riyaan
                        </button>
                    </div>
                </header>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm px-6 py-4 mb-8 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
                        <Activity size={120} />
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
                            <button
                                onClick={() => offsetDate(-1)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-slate-900 dark:text-white px-2 py-1 font-bold uppercase text-sm focus:outline-none cursor-pointer w-[130px] text-center"
                            />
                            <button
                                onClick={() => offsetDate(1)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-4 text-right">
                        <div className="hidden sm:block">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                Earnings
                            </h2>
                        </div>
                        <div className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tighter ${totalEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {totalEarnings >= 0 ? '+' : ''}₹{totalEarnings.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>

                <div className="space-y-12 relative z-10">
                    {loading && allEntries.length > 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-16 text-center shadow-sm">
                            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 animate-pulse">
                                <Clock size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 animate-pulse">Loading {displayDateString}...</h3>
                        </div>
                    ) : gamesGrouped.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-16 text-center shadow-sm">
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner ${playerFilter === 'Ayaan' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-500'}`}>
                                {playerFilter === 'Ayaan' ? <User size={40} /> : <Users size={40} />}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Games Played</h3>
                            <p className="text-slate-500 text-sm">{playerFilter} hasn't played any games on {displayDateString}.</p>
                        </div>
                    ) : (
                        gamesGrouped.map(group => (
                            <div key={group.gameName} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden pb-4">
                                <div className="p-4 sm:px-6 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">{group.gameName}</h3>
                                    <div className={`text-xl font-black tabular-nums tracking-tighter ${group.totalEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {group.totalEarnings >= 0 ? '+' : ''}₹{group.totalEarnings}
                                    </div>
                                </div>

                                <div className="p-0 space-y-4">
                                    {group.sessions.map((session, idx) => (
                                        <div key={session.id}>
                                            <div className="px-4 sm:px-6 bg-white dark:bg-slate-900">
                                                {renderGameDetails(group.gameName, session.details)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
