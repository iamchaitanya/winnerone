import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, IndianRupee, Calendar, User, Users, Activity, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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
}

const GAME_TABLES = [
    { table: 'addition_logs', game: 'Addition', earningsField: 'earnings', scoreField: 'score', dateField: 'created_at' },
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

type PlayerFilter = 'All' | 'Ayaan' | 'Riyaan';

export const DailyHistoryView: React.FC<DailyHistoryViewProps> = ({ onBack }) => {
    const [allEntries, setAllEntries] = useState<GameEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const [dateFilter, setDateFilter] = useState<string>(''); // '' means All Days
    const [playerFilter, setPlayerFilter] = useState<PlayerFilter>('All');
    const [expandedDay, setExpandedDay] = useState<string | null>(getISTDateKey(new Date()));

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        const entries: GameEntry[] = [];

        for (const gt of GAME_TABLES) {
            try {
                // Fetch 1000 so we capture many historical days
                const { data } = await supabase.from(gt.table).select('*').order(gt.dateField, { ascending: false }).limit(1000);
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
                            displayTime: new Date(timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
                        });
                    }
                }
            } catch {
                // Table might not exist yet, skip
            }
        }

        setAllEntries(entries);
        setLoading(false);
    }, []);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const filteredGames = useMemo(() => {
        return allEntries.filter(e => {
            const playerMatch = playerFilter === 'All' || e.player === playerFilter;
            const dateMatch = dateFilter === '' || getISTDateKey(e.timestamp) === dateFilter;
            return playerMatch && dateMatch;
        });
    }, [allEntries, dateFilter, playerFilter]);

    const daySummaries = useMemo(() => {
        const groups: Record<string, { dateKey: string, displayDate: string, games: GameEntry[], totalEarnings: number }> = {};

        filteredGames.forEach(e => {
            const dk = getISTDateKey(e.timestamp);
            if (!groups[dk]) {
                groups[dk] = {
                    dateKey: dk,
                    displayDate: new Date(e.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
                    games: [],
                    totalEarnings: 0
                };
            }
            groups[dk].games.push(e);
            groups[dk].totalEarnings += e.earnings;
        });

        Object.values(groups).forEach(g => {
            g.games.sort((a, b) => b.timestamp - a.timestamp);
        });

        return Object.values(groups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    }, [filteredGames]);

    const grandTotal = daySummaries.reduce((sum, d) => sum + d.totalEarnings, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse font-black text-slate-400 uppercase tracking-widest">Loading History...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 animate-in fade-in duration-500 pb-32">
            <div className="max-w-2xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Timeline</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All games · Combined view</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                        <button onClick={() => setPlayerFilter('All')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${playerFilter === 'All' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            All
                        </button>
                        <button onClick={() => setPlayerFilter('Ayaan')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${playerFilter === 'Ayaan' ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            Ayaan
                        </button>
                        <button onClick={() => setPlayerFilter('Riyaan')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${playerFilter === 'Riyaan' ? 'bg-rose-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            Riyaan
                        </button>
                    </div>
                </header>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl p-6 sm:p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Calendar size={120} />
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-slate-400" />
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Date</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => { setDateFilter(''); setExpandedDay(getISTDateKey(new Date())); }}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${dateFilter === '' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
                                    All Days
                                </button>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => { setDateFilter(e.target.value); setExpandedDay(e.target.value); }}
                                    className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-xl font-bold uppercase text-sm border-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer w-40"
                                />
                            </div>
                        </div>

                        <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-6 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                {playerFilter === 'All' ? 'Combined Total' : `${playerFilter}'s Total`}
                                {dateFilter !== '' ? ' (Selected Date)' : ' (All Time)'}
                            </h2>
                            <div className={`text-4xl font-black tabular-nums tracking-tight ${grandTotal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {grandTotal >= 0 ? '+' : ''}₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {daySummaries.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                            <Activity size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Activity Found</h3>
                            <p className="text-slate-500 text-sm">No games match the current filters.</p>
                        </div>
                    ) : (
                        daySummaries.map(day => (
                            <div key={day.dateKey} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <button onClick={() => setExpandedDay(expandedDay === day.dateKey ? null : day.dateKey)} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className={`transition-colors ${expandedDay === day.dateKey ? 'text-indigo-500' : 'text-slate-400'}`} />
                                        <span className={`font-black text-sm uppercase tracking-wider ${expandedDay === day.dateKey ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                                            {day.displayDate}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md hidden sm:inline-block">
                                            {day.games.length} {day.games.length === 1 ? 'game' : 'games'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-black tabular-nums tracking-tight ${day.totalEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {day.totalEarnings >= 0 ? '+' : ''}₹{day.totalEarnings}
                                            </span>
                                        </div>
                                        {expandedDay === day.dateKey ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                    </div>
                                </button>

                                {expandedDay === day.dateKey && (
                                    <div className="px-3 pb-3 sm:px-4 sm:pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 bg-slate-50/50 dark:bg-slate-900/50">
                                        {day.games.map((game) => (
                                            <div key={game.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${game.player === 'Ayaan' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' :
                                                            game.player === 'Riyaan' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' :
                                                                'bg-slate-50 dark:bg-slate-800 text-slate-500'
                                                        }`}>
                                                        {game.player === 'Ayaan' ? <User size={20} /> : game.player === 'Riyaan' ? <Users size={20} /> : <Activity size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{game.game}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${game.player === 'Ayaan' ? 'text-indigo-500' : 'text-rose-500'
                                                                }`}>
                                                                {game.player}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                                <Clock size={10} />
                                                                {game.displayTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className={`text-base font-black tabular-nums ${game.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {game.earnings >= 0 ? '+' : ''}₹{game.earnings}
                                                    </div>
                                                    {game.score > 0 && typeof game.score === 'number' && (
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            Score: {game.score}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
