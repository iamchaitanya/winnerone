import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, IndianRupee, Calendar, User, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { getISTDateKey } from '../src/lib/dateUtils';

interface DailyHistoryViewProps { onBack: () => void; }

interface GameEntry { game: string; player: string; earnings: number; score: number; timestamp: number; }
interface DaySummary {
    dateKey: string;
    displayDate: string;
    games: GameEntry[];
    ayaanTotal: number;
    riyaanTotal: number;
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

export const DailyHistoryView: React.FC<DailyHistoryViewProps> = ({ onBack }) => {
    const [allEntries, setAllEntries] = useState<GameEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedDay, setExpandedDay] = useState<string | null>(null);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        const entries: GameEntry[] = [];

        for (const gt of GAME_TABLES) {
            try {
                const { data } = await supabase.from(gt.table).select('*').order(gt.dateField, { ascending: false }).limit(200);
                if (data) {
                    for (const row of data) {
                        const pName = (row.player_id === PLAYER_IDS.Ayaan) ? 'Ayaan' : (row.player_id === PLAYER_IDS.Riyaan) ? 'Riyaan' : (row.player || 'Unknown');
                        entries.push({
                            game: gt.game,
                            player: pName,
                            earnings: row[gt.earningsField] || 0,
                            score: gt.scoreField ? (row[gt.scoreField] || 0) : 0,
                            timestamp: new Date(row[gt.dateField] || row.created_at).getTime()
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

    const daySummaries = useMemo(() => {
        const groups: Record<string, DaySummary> = {};
        allEntries.forEach(e => {
            const dk = getISTDateKey(e.timestamp);
            if (!groups[dk]) {
                groups[dk] = {
                    dateKey: dk,
                    displayDate: new Date(e.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric' }),
                    games: [],
                    ayaanTotal: 0,
                    riyaanTotal: 0
                };
            }
            groups[dk].games.push(e);
            if (e.player === 'Ayaan') groups[dk].ayaanTotal += e.earnings;
            else if (e.player === 'Riyaan') groups[dk].riyaanTotal += e.earnings;
        });
        return Object.values(groups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    }, [allEntries]);

    // Grand totals
    const grandAyaan = daySummaries.reduce((sum, d) => sum + d.ayaanTotal, 0);
    const grandRiyaan = daySummaries.reduce((sum, d) => sum + d.riyaanTotal, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse font-black text-slate-400 uppercase tracking-widest">Loading History...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Daily History Board</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All games · All players</p>
                </div>
            </header>

            {/* Grand Totals */}
            <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-2 mb-2"><User size={16} className="text-indigo-500" /><p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Ayaan</p></div>
                    <div className={`flex items-center justify-center gap-1 text-2xl font-black ${grandAyaan >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}><IndianRupee size={20} />{grandAyaan}</div>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-2 mb-2"><Users size={16} className="text-rose-500" /><p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Riyaan</p></div>
                    <div className={`flex items-center justify-center gap-1 text-2xl font-black ${grandRiyaan >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}><IndianRupee size={20} />{grandRiyaan}</div>
                </div>
            </div>

            {/* Daily Cards */}
            <div className="max-w-md mx-auto space-y-3">
                {daySummaries.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No games played yet</p>}
                {daySummaries.map(day => (
                    <div key={day.dateKey} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <button onClick={() => setExpandedDay(expandedDay === day.dateKey ? null : day.dateKey)} className="w-full p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-slate-400" />
                                <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">{day.displayDate}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-3 text-sm font-black">
                                    <span className={day.ayaanTotal >= 0 ? 'text-emerald-500' : 'text-rose-500'}>₹{day.ayaanTotal}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className={day.riyaanTotal >= 0 ? 'text-emerald-500' : 'text-rose-500'}>₹{day.riyaanTotal}</span>
                                </div>
                                {expandedDay === day.dateKey ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </div>
                        </button>
                        {expandedDay === day.dateKey && (
                            <div className="px-4 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                                {day.games.map((g, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${g.player === 'Ayaan' ? 'bg-indigo-500' : 'bg-rose-500'}`}></span>
                                            <span className="font-bold text-slate-600 dark:text-slate-300">{g.game}</span>
                                            <span className="text-[10px] text-slate-400">({g.player})</span>
                                        </div>
                                        <span className={`font-black ${g.earnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>₹{g.earnings}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
