import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Calendar, User, Users, Activity, Clock, ChevronDown, ChevronUp, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
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

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        const entries: GameEntry[] = [];

        for (const gt of GAME_TABLES) {
            try {
                const { data, error } = await supabase.from(gt.table).select('*').order(gt.dateField || 'created_at', { ascending: false }).limit(1000);
                if (error) {
                    console.error(`Error fetching ${gt.game}:`, error);
                }
                if (data) {
                    console.log(`Fetched ${data.length} records for ${gt.game}`);
                    for (const row of data) {
                        const pName = (row.player_id === PLAYER_IDS.Ayaan) ? 'Ayaan' : (row.player_id === PLAYER_IDS.Riyaan) ? 'Riyaan' : (row.player || 'Unknown');
                        const timestamp = new Date(row[gt.dateField] || row.created_at).getTime();
                        entries.push({
                            id: row.id || crypto.randomUUID(),
                            game: gt.game,
                            player: pName,
                            earnings: row[gt.earningsField] || 0,
                            score: gt.scoreField ? (row[gt.scoreField] || 0) : 0,
                            timestamp: timestamp,
                            displayTime: new Date(timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
                            details: row.details || row
                        });
                    }
                }
            } catch (err) {
                console.error(`Exception fetching ${gt.game}:`, err);
            }
        }

        setAllEntries(entries);
        setLoading(false);
    }, []);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const filteredGames = useMemo(() => {
        return allEntries.filter(e => {
            return e.player === playerFilter && getISTDateKey(e.timestamp) === selectedDate;
        }).sort((a, b) => b.timestamp - a.timestamp);
    }, [allEntries, selectedDate, playerFilter]);

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

    const renderGameDetails = (gameName: string, details: any) => {
        if (!details) return <div className="text-xs text-slate-400 italic py-2">No detailed log available</div>;

        switch (gameName) {
            case 'Addition':
            case 'Subtraction':
            case 'Multiplication':
            case 'Multiply':
            case 'Multiplication 25':
            case 'Divide':
            case 'Mental Math':
            case 'Math Mastery':
                const mathResults = Array.isArray(details) ? details : [];
                if (mathResults.length === 0) return <div className="text-xs text-slate-400 italic py-2">No detailed log available</div>;

                return (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left table-auto min-w-[300px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ques</th>
                                    <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-none">Ans</th>
                                    <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-none">Corr</th>
                                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right leading-none">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {mathResults.map((res: any, i: number) => {
                                    // Handle missing time property gracefully, it might not exist on all past logs
                                    let timeStr = '-';
                                    if (res.timeTaken !== undefined && res.timeTaken !== null) {
                                        const t = Number(res.timeTaken);
                                        // If t > 500, we probably saved it as ms. Otherwise assume seconds.
                                        timeStr = t > 500 ? `${(t / 1000).toFixed(1)}s` : `${t.toFixed(1)}s`;
                                    }

                                    // Parse expression for mental math vs generic num1/num2 operations vs Multiplication operand1/operand2
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
                                                <span className={`text-sm font-bold tabular-nums text-slate-900 dark:text-white`}>{correctAnswerStr}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-xs font-bold text-slate-400 tabular-nums uppercase">{timeStr}</span>
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
                const vocabArray = details.details ? details.details : (Array.isArray(details) ? details : []);
                if (vocabArray.length === 0) return <div className="text-xs text-slate-400 italic py-2">No detailed log available</div>;

                return (
                    <div className="space-y-3">
                        {vocabArray.map((d: any, dIdx: number) => {
                            const wordDisplay = d.root || d.word || d.question || 'Word';
                            const meaningDisplay = d.meaning ? `(${d.meaning})` : '';
                            const expectedAnswer = d.options && d.correct !== undefined ? d.options[d.correct] : (d.expectedAnswer || d.correctAnswer || d.answer || '');

                            return (
                                <div key={dIdx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className={`mt-0.5 p-1 rounded-full shrink-0 ${d.isCorrect !== false ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-500'}`}>
                                        {d.isCorrect !== false ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{wordDisplay} {meaningDisplay && <span className="text-slate-400 opacity-70">{meaningDisplay}</span>}</p>
                                            {(d.scoreChange !== undefined && d.scoreChange !== null) && (
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${d.scoreChange > 0 ? 'bg-emerald-100/50 text-emerald-600' : d.scoreChange < 0 ? 'bg-rose-100/50 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                                                    {d.scoreChange > 0 ? '+' : ''}{d.scoreChange}
                                                </span>
                                            )}
                                        </div>
                                        {d.question && <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{d.question}</p>}
                                        {(d.isCorrect === false && expectedAnswer) && (
                                            <p className="text-xs font-bold text-slate-500 mt-2">Expected answer: <span className="text-emerald-600 dark:text-emerald-400">{expectedAnswer}</span></p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );

            case 'Sensex':
                const sData = details || {};
                const sIsWin = sData.is_settled && ((sData.prediction === 'UP' && sData.actual_return >= 0) || (sData.prediction === 'DOWN' && sData.actual_return < 0));
                return (
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Prediction</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sensex</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-4 text-center border-r border-slate-50 dark:border-slate-800/50">
                                        <div className="flex flex-col items-center leading-tight">
                                            <span className={`text-sm font-black ${sData.prediction === 'UP' ? 'text-emerald-500' : 'text-rose-500'}`}>{sData.prediction || '—'}</span>
                                            {sData.is_settled ? (
                                                <span className={`text-xs font-black mt-1 ${sIsWin ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {sData.earnings > 0 ? '+' : ''}{Number(sData.earnings || 0).toFixed(1)}
                                                </span>
                                            ) : <span className="text-[10px] font-bold text-amber-500 uppercase mt-1">Pending</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {sData.is_settled ? (
                                            <div className="flex flex-col items-center leading-tight">
                                                <span className="text-sm font-black dark:text-white">{sData.closing_value?.toLocaleString('en-IN') || '—'}</span>
                                                <span className={`text-xs font-bold mt-1 ${sData.actual_return >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{sData.actual_return?.toFixed(2)}%</span>
                                            </div>
                                        ) : <span className="text-[10px] font-bold text-slate-400 uppercase">Market Open</span>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );

            case 'Nifty 50':
                const nData = details || {};
                const nIsSettled = nData.stock_return !== null && nData.stock_return !== undefined;
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
                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{nData.stock_symbol || '—'}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {nIsSettled ? (
                                            <div className={`text-sm font-black tabular-nums ${nData.stock_return >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {nData.stock_return >= 0 ? '+' : ''}{Number(nData.stock_return).toFixed(2)}%
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
                const sudokuData = details || {};
                const sScore = sudokuData.score || 0;
                const sWrong = sudokuData.wrong !== undefined ? sudokuData.wrong : 0;

                return (
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Correct</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mistakes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-4 text-center border-r border-slate-50 dark:border-slate-800/50">
                                        <span className="text-sm font-black text-emerald-500 tabular-nums">{sScore}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`text-sm font-black tabular-nums ${sWrong > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{sWrong}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );

            case 'Memory':
                const memData = details || {};
                const mScore = memData.score || 0;
                const mLevel = memData.level_reached || 1;

                return (
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Level Reached</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="px-4 py-4 text-center border-r border-slate-50 dark:border-slate-800/50">
                                        <span className="text-sm font-black text-emerald-500 tabular-nums">{mScore}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-sm font-black text-indigo-500 tabular-nums">Lv {mLevel}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse font-black text-slate-400 uppercase tracking-widest">Loading Analytics...</div>
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
                    {gamesGrouped.length === 0 ? (
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
