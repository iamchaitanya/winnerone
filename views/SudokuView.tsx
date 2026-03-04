import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { getISTDateKey } from '../src/lib/dateUtils';

import { useSudokuEngine, SudokuResult } from '../src/hooks/useSudokuEngine';

import { SudokuHub } from '../src/components/sudoku/SudokuHub';
import { AdditionPinEntry } from '../src/components/addition/AdditionPinEntry';
import { SudokuPreEntry } from '../src/components/sudoku/SudokuPreEntry';
import { SudokuGame } from '../src/components/sudoku/SudokuGame';
import { SudokuResults } from '../src/components/sudoku/SudokuResults';
import { SudokuDashboard } from '../src/components/sudoku/SudokuDashboard';
import { SudokuHistory } from '../src/components/sudoku/SudokuHistory';

interface SudokuViewProps { onBack: () => void; }

enum SubView { HUB = 'hub', PIN_ENTRY = 'pin_entry', PRE_ENTRY = 'pre_entry', GAME = 'game', RESULTS = 'results', LOCAL_DASHBOARD = 'local_dashboard', MASTER_HISTORY = 'master_history' }

interface GameSession { id: string; player: string; score: number; wrong: number; earnings: number; timestamp: number; }
interface DailyRecord { dateKey: string; displayDate: string; timestamp: number; ayaanEarnings: number | null; riyaanEarnings: number | null; }

export const SudokuView: React.FC<SudokuViewProps> = ({ onBack }) => {
    const settings = useGameStore(s => s.settings);
    const profiles = useGameStore(s => s.profiles);

    const [subView, setSubView] = useState<SubView>(SubView.HUB);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<'Ayaan' | 'Riyaan'>('Ayaan');

    const dateOverride = settings.dateOverride;
    const isPinEntryEnabled = settings.pinEntryEnabled;
    const isSubmittingRef = useRef(false);

    const [ayaanTotal, setAyaanTotal] = useState(0);
    const [riyaanTotal, setRiyaanTotal] = useState(0);
    const [history, setHistory] = useState<GameSession[]>([]);
    const [finalScore, setFinalScore] = useState(0);
    const [finalWrong, setFinalWrong] = useState(0);
    const [finalEarnings, setFinalEarnings] = useState(0);

    const getUserProfile = useCallback((name: string | null) => profiles.find(p => p.player_name === name), [profiles]);

    const syncWithCloud = useCallback(async () => {
        const { data, error } = await supabase.from('sudoku_logs').select('*').order('played_at', { ascending: false }).limit(500);
        if (error) { console.error("Supabase fetch error for sudoku_logs:", error); return; }
        if (!data) return;
        let aT = 0, rT = 0;
        const h: GameSession[] = data.map((log: any) => {
            const pName = log.player_id === PLAYER_IDS.Ayaan ? 'Ayaan' : 'Riyaan';
            if (pName === 'Ayaan') aT += log.earnings; else rT += log.earnings;
            return { id: log.id, player: pName, score: log.score, wrong: log.wrong_count, earnings: log.earnings, timestamp: new Date(log.played_at).getTime() };
        });
        setAyaanTotal(aT); setRiyaanTotal(rT); setHistory(h);
    }, []);

    useEffect(() => {
        syncWithCloud();
        const channel = supabase.channel('sudoku_logs_live').on('postgres_changes', { event: '*', schema: 'public', table: 'sudoku_logs' }, () => syncWithCloud()).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [syncWithCloud]);

    const getEffectiveDate = useCallback(() => {
        if (dateOverride) {
            const d = new Date(dateOverride);
            if (isNaN(d.getTime())) return new Date();
            if (!dateOverride.includes('T')) {
                const now = new Date();
                const [y, m, day] = dateOverride.split('-').map(Number);
                const ld = new Date(); ld.setFullYear(y, m - 1, day); ld.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
                return ld;
            }
            return d;
        }
        return new Date();
    }, [dateOverride]);

    const isMarketOpenDay = useCallback(() => {
        const d = getEffectiveDate(); const day = d.getDay();
        return !(day === 0 || day === 6) && !isMarketHoliday(getISTDateKey(d));
    }, [getEffectiveDate]);

    const hasPlayedToday = useCallback((player: string | null) => {
        if (!player) return false;
        const todayIST = getISTDateKey(getEffectiveDate());
        return history.some(s => s.player === player && getISTDateKey(s.timestamp) === todayIST);
    }, [history, getEffectiveDate]);

    const getTodaySession = useCallback((player: string | null) => {
        if (!player) return null;
        const todayIST = getISTDateKey(getEffectiveDate());
        return history.find(s => s.player === player && getISTDateKey(s.timestamp) === todayIST) || null;
    }, [history, getEffectiveDate]);

    const finishGame = useCallback(async (result: SudokuResult) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        const earnings = (result.correct - result.wrong) * settings.sudokuMultiplier;
        setFinalScore(result.correct);
        setFinalWrong(result.wrong);
        setFinalEarnings(earnings);

        if (selectedUser) {
            const userProfile = getUserProfile(selectedUser);
            const playerId = userProfile ? userProfile.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);
            const playedAt = new Date(getEffectiveDate().getTime());
            const { error: insertError } = await supabase.from('sudoku_logs').insert({
                player_id: playerId, score: result.correct, wrong_count: result.wrong, earnings,
                details: { grid: result.grid, solution: result.solution },
                played_at: playedAt.toISOString()
            });
            if (insertError) {
                console.error("Supabase insert error for sudoku_logs:", insertError);
            } else {
                setHistory(prev => [{
                    id: crypto.randomUUID(), player: selectedUser, score: result.correct, wrong: result.wrong, earnings, timestamp: playedAt.getTime()
                }, ...prev]);
            }
        }

        setSubView(SubView.RESULTS);
        isSubmittingRef.current = false;
    }, [selectedUser, getEffectiveDate, getUserProfile]);

    const {
        grid, clues, selectedCell, setSelectedCell, timeLeft, isActive,
        startGame: triggerEngineStart, setCellValue, clearCell, submitGrid
    } = useSudokuEngine(finishGame);

    const startGame = () => {
        if (!isMarketOpenDay()) return alert("Market closed!");
        if (hasPlayedToday(selectedUser)) return alert("Already played today!");
        triggerEngineStart();
        setSubView(SubView.GAME);
    };

    const getUserAttempts = (user: string | null) => getUserProfile(user)?.pin_attempts || 0;
    const isUserLocked = (user: string | null) => getUserProfile(user)?.is_locked || false;
    const handleVerifyPin = async (pin: string) => {
        const profile = getUserProfile(selectedUser);
        if (!profile) return false;
        if (pin === profile.pin) { await supabase.from('profiles').update({ pin_attempts: 0 }).eq('id', profile.id); return true; }
        const next = (profile.pin_attempts || 0) + 1;
        const updates: any = { pin_attempts: next }; if (next >= 3) updates.is_locked = true;
        await supabase.from('profiles').update(updates).eq('id', profile.id);
        return false;
    };

    const groupedHistory = useMemo(() => {
        const groups: Record<string, DailyRecord> = {};
        history.forEach(s => {
            const dk = getISTDateKey(s.timestamp);
            if (!groups[dk]) { groups[dk] = { dateKey: dk, displayDate: new Date(s.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' }), timestamp: s.timestamp, ayaanEarnings: null, riyaanEarnings: null }; }
            if (s.player === 'Ayaan') groups[dk].ayaanEarnings = (groups[dk].ayaanEarnings || 0) + s.earnings;
            else groups[dk].riyaanEarnings = (groups[dk].riyaanEarnings || 0) + s.earnings;
        });
        return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
    }, [history]);

    switch (subView) {
        case SubView.HUB:
            return <SudokuHub onBack={onBack} onNavigate={(v) => setSubView(v as SubView)} onUserSelect={(u) => { setSelectedUser(u); setSubView(isPinEntryEnabled ? SubView.PIN_ENTRY : SubView.PRE_ENTRY); }} isMarketWorkingDay={isMarketOpenDay()} dateOverride={dateOverride} isWeekend={getEffectiveDate().getDay() === 0 || getEffectiveDate().getDay() === 6} isPublicHoliday={isMarketHoliday(getISTDateKey(getEffectiveDate()))} hasPlayedToday={hasPlayedToday} isUserLocked={isUserLocked} />;
        case SubView.PIN_ENTRY:
            return <AdditionPinEntry selectedUser={selectedUser} onSuccess={() => setSubView(SubView.PRE_ENTRY)} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.PRE_ENTRY:
            return <SudokuPreEntry selectedUser={selectedUser} isPlayed={hasPlayedToday(selectedUser)} isMarketWorking={isMarketOpenDay()} todaySession={getTodaySession(selectedUser)} onStart={startGame} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.GAME:
            return <SudokuGame grid={grid} clues={clues} selectedCell={selectedCell} onSelectCell={(r, c) => setSelectedCell([r, c])} onSetValue={setCellValue} onClearCell={clearCell} onSubmit={submitGrid} timeLeft={timeLeft} />;
        case SubView.RESULTS:
            return <SudokuResults finalScore={finalScore} finalWrong={finalWrong} finalEarnings={finalEarnings} onExit={() => setSubView(SubView.HUB)} />;
        case SubView.LOCAL_DASHBOARD:
            return <SudokuDashboard ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.MASTER_HISTORY:
            return <SudokuHistory history={history} historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} onBack={() => setSubView(SubView.HUB)} />;
        default: return null;
    }
};
