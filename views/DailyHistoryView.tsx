import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Calendar, User, Users, Activity, Clock, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
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
    { table: 'nifty_logs', game: 'Nifty 50', earningsField: 'earnings', scoreField: null, dateField: 'played_at' },
    { table: 'sensex_logs', game: 'Sensex', earningsField: 'earnings', scoreField: null, dateField: 'played_at' },
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
                const { data } = await supabase.from(gt.table).select('*').order(gt.dateField || 'created_at', { ascending: false }).limit(1000);
                if (data) {
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
                            details: row.details
                        });
                    }
                }
            } catch {
                // Ignore missing tables
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
            groups[e.game].sessions.push(e);
            groups[e.game].totalEarnings += e.earnings;
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
            case 'Multiplication 25':
            case 'Multiply':
            case 'Divide':
            case 'Mental Math':
            case 'Math Mastery':
                if (Array.isArray(details)) {
                    return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {details.map((item: any, i: number) => {
                                // some math games use "equation" others use "num1 operator num2"
                                let questionLabel = item.equation || (item.question ? item.question : `${item.num1} ${item.operator || '?'} ${item.num2}`);
                                return (
                                    <div key={i} className={`p-2 rounded-lg border text-sm flex justify-between items-center ${item.isCorrect !== false && item.correct !== false ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'}`}>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{questionLabel} = </span>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${item.isCorrect !== false && item.correct !== false ? 'text-emerald-600 dark:text-emerald-400' : 'line-through text-rose-400'}`}>
                                                {item.userAnswer}
                                            </span>
                                            {(item.isCorrect === false || item.correct === false) && (
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.correctAnswer || item.expectedAnswer}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }
                return <div className="text-xs text-slate-400 italic py-2">Unrecognized format</div>;

            case 'Word Power':
            case 'Barron 800':
            case 'Manhattan 500':
                // Check if it's the newer nested details or older flat array
                const vocabArray = details.details ? details.details : (Array.isArray(details) ? details : null);
                if (vocabArray) {
                    return (
                        <div className="space-y-2">
                            {vocabArray.map((item: any, i: number) => (
                                <div key={i} className={`p-3 rounded-xl border text-sm ${item.isCorrect !== false ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wide">{item.root || item.word || item.question}</span>
                                            {item.isCorrect === false && <span className="text-xs text-slate-500 block mt-1">Expected: <strong className="text-emerald-600 dark:text-emerald-400">{item.options?.[item.correct]}</strong></span>}
                                        </div>
                                        {item.isCorrect !== false ? <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> : <X size={16} className="text-rose-500 shrink-0 mt-0.5" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }
                return null;

            case 'Sudoku':
            case 'Memory':
            case 'Sensex':
            case 'Nifty 50':
                return <div className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">Detailed granular logs are not supported for this game yet.</div>;

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

                    <div className="flex items-center gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
                        <button onClick={() => setPlayerFilter('Ayaan')} className={`px-6 py-2 rounded-lg text-sm font-black tracking-wider transition-all duration-300 ${playerFilter === 'Ayaan' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            Ayaan
                        </button>
                        <button onClick={() => setPlayerFilter('Riyaan')} className={`px-6 py-2 rounded-lg text-sm font-black tracking-wider transition-all duration-300 ${playerFilter === 'Riyaan' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            Riyaan
                        </button>
                    </div>
                </header>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-6 sm:p-10 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                        <Activity size={180} />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={18} className="text-slate-400" />
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Date</h2>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => offsetDate(-1)} className="px-3 py-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors font-bold text-sm shadow-sm">
                                -1d
                            </button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-5 py-3 rounded-xl font-bold uppercase text-sm border border-slate-200 dark:border-slate-800 shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            />
                            <button onClick={() => offsetDate(1)} className="px-3 py-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors font-bold text-sm shadow-sm" disabled={selectedDate === getISTDateKey(new Date())}>
                                +1d
                            </button>
                        </div>
                    </div>

                    <div className="md:text-right border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-6 md:pt-0 md:pl-8 w-full md:w-auto relative z-10">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            {playerFilter}'s Total Earnings
                        </h2>
                        <div className="text-sm font-bold text-slate-500 mb-2">{displayDateString}</div>
                        <div className={`text-6xl font-black tabular-nums tracking-tighter drop-shadow-sm ${totalEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {totalEarnings >= 0 ? '+' : ''}₹{totalEarnings.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    {gamesGrouped.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-16 text-center shadow-sm">
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner ${playerFilter === 'Ayaan' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-500'}`}>
                                {playerFilter === 'Ayaan' ? <User size={40} /> : <Users size={40} />}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Games Played</h3>
                            <p className="text-slate-500 text-sm">{playerFilter} hasn't played any games on {displayDateString}.</p>
                        </div>
                    ) : (
                        gamesGrouped.map(group => {
                            const isExpanded = expandedGames.has(group.gameName);
                            return (
                                <div key={group.gameName} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
                                    <button
                                        onClick={() => toggleGameExpand(group.gameName)}
                                        className="w-full p-6 sm:px-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                <Activity size={24} className="text-slate-400" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white">{group.gameName}</h3>
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider">
                                                    {group.sessions.length} {group.sessions.length === 1 ? 'Session' : 'Sessions'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className={`text-2xl font-black tabular-nums tracking-tight ${group.totalEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {group.totalEarnings >= 0 ? '+' : ''}₹{group.totalEarnings}
                                            </div>
                                            <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 px-6 py-6 sm:px-8 space-y-8">
                                            {group.sessions.map((session, idx) => (
                                                <div key={session.id} className="relative">
                                                    {idx > 0 && <div className="absolute -top-4 left-0 right-0 h-px bg-slate-200 dark:bg-slate-800"></div>}

                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Session at {session.displayTime}</span>
                                                        </div>
                                                        <div className="flex gap-4 items-center">
                                                            {session.score > 0 && (
                                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score: <span className="text-slate-700 dark:text-slate-300">{session.score}</span></span>
                                                            )}
                                                            <span className={`text-sm font-black tabular-nums ${session.earnings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                                {session.earnings >= 0 ? '+' : ''}₹{session.earnings}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                                                        {renderGameDetails(group.gameName, session.details)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
