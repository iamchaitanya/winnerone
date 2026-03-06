import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase, handleSupabaseError } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { getISTDateKey } from '../src/lib/dateUtils';
import { useMemoryEngine, MemoryResult } from '../src/hooks/useMemoryEngine';

import { MemoryHub } from '../src/components/memory/MemoryHub';
import { AdditionPinEntry } from '../src/components/addition/AdditionPinEntry';
import { MemoryPreEntry } from '../src/components/memory/MemoryPreEntry';
import { MemoryGame } from '../src/components/memory/MemoryGame';
import { MemoryResults } from '../src/components/memory/MemoryResults';
import { MemoryDashboard } from '../src/components/memory/MemoryDashboard';
import { MemoryHistory } from '../src/components/memory/MemoryHistory';

interface MemoryViewProps { onBack: () => void; }
enum SubView { HUB = 'hub', PIN_ENTRY = 'pin_entry', PRE_ENTRY = 'pre_entry', GAME = 'game', RESULTS = 'results', LOCAL_DASHBOARD = 'local_dashboard', MASTER_HISTORY = 'master_history' }
interface GameSession { id: string; player: string; score: number; levelReached: number; earnings: number; timestamp: number; grid?: number[]; clickedNumbers?: number[]; wrongClick?: number | null; }
interface DailyRecord { dateKey: string; displayDate: string; timestamp: number; ayaanEarnings: number | null; ayaanTime: string | null; riyaanEarnings: number | null; riyaanTime: string | null; }

export const MemoryView: React.FC<MemoryViewProps> = ({ onBack }) => {
    const settings = useGameStore(s => s.settings);
    const profiles = useGameStore(s => s.profiles);

    const [subView, setSubView] = useState<SubView>(SubView.HUB);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<'Ayaan' | 'Riyaan'>('Ayaan');
    const isPinEntryEnabled = settings.pinEntryEnabled;
    const dateOverride = settings.dateOverride;
    const isSubmittingRef = useRef(false);

    const [ayaanTotal, setAyaanTotal] = useState(0);
    const [riyaanTotal, setRiyaanTotal] = useState(0);
    const [history, setHistory] = useState<GameSession[]>([]);
    const [finalResult, setFinalResult] = useState<MemoryResult | null>(null);
    const [finalEarnings, setFinalEarnings] = useState(0);

    const getUserProfile = useCallback((name: string | null) => profiles.find(p => p.player_name === name), [profiles]);

    const syncWithCloud = useCallback(async () => {
        const { data, error } = await supabase.from('memory_logs').select('*').order('played_at', { ascending: false }).limit(500);
        if (error || !data) return;
        let aT = 0, rT = 0;
        const h: GameSession[] = data.map((log: any) => {
            const pName = log.player_id === PLAYER_IDS.Ayaan ? 'Ayaan' : 'Riyaan';
            if (pName === 'Ayaan') aT += log.earnings; else rT += log.earnings;
            const details = log.details || {};
            return { id: log.id, player: pName, score: log.score, levelReached: log.level_reached, earnings: log.earnings, timestamp: new Date(log.played_at).getTime(), grid: details.grid, clickedNumbers: details.clickedNumbers, wrongClick: details.wrongClick };
        });
        setAyaanTotal(aT); setRiyaanTotal(rT); setHistory(h);
    }, []);

    useEffect(() => {
        syncWithCloud();
        const ch = supabase.channel('memory_logs_live').on('postgres_changes', { event: '*', schema: 'public', table: 'memory_logs' }, () => syncWithCloud()).subscribe();
        return () => { supabase.removeChannel(ch); };
    }, [syncWithCloud]);

    const getEffectiveDate = useCallback(() => {
        if (dateOverride) {
            const d = new Date(dateOverride); if (isNaN(d.getTime())) return new Date();
            if (!dateOverride.includes('T')) { const now = new Date(); const [y, m, day] = dateOverride.split('-').map(Number); const ld = new Date(); ld.setFullYear(y, m - 1, day); ld.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()); return ld; }
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
        if (history.some(s => s.player === player && getISTDateKey(s.timestamp) === todayIST)) return true;
        // Check local storage for crash protection
        return localStorage.getItem(`memory_attempt_${player}_${todayIST}`) === 'started';
    }, [history, getEffectiveDate]);

    const finishGame = useCallback(async (result: MemoryResult) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        const earnings = result.totalScore * settings.memoryMultiplier;
        setFinalResult(result);
        setFinalEarnings(earnings);

        if (selectedUser) {
            const userProfile = getUserProfile(selectedUser);
            const playerId = userProfile ? userProfile.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);
            const playedAt = new Date(getEffectiveDate().getTime());
            const { error } = await supabase.from('memory_logs').insert({
                player_id: playerId, score: result.totalScore, level_reached: result.reachedLevel4 ? 4 : 3, earnings,
                details: result, played_at: playedAt.toISOString()
            });

            if (!error) {
                const todayIST = getISTDateKey(playedAt);
                localStorage.removeItem(`memory_attempt_${selectedUser}_${todayIST}`);
            }
            await syncWithCloud();
        }
        setSubView(SubView.RESULTS);
        isSubmittingRef.current = false;
    }, [selectedUser, getEffectiveDate, getUserProfile]);

    const { level, grid, isRevealed, clickedNumbers, nextExpected, timeLeft, gameOver, wrongClick, startGame: triggerStart, handleCellClick } = useMemoryEngine(finishGame);

    const startGame = () => {
        if (!isMarketOpenDay()) return alert("Market closed!");
        if (hasPlayedToday(selectedUser)) return alert("Already played today!");

        if (selectedUser) {
            const todayIST = getISTDateKey(getEffectiveDate());
            localStorage.setItem(`memory_attempt_${selectedUser}_${todayIST}`, 'started');
        }

        triggerStart();
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
        await supabase.from('profiles').update(updates).eq('id', profile.id); return false;
    };

    const groupedHistory = useMemo(() => {
        const groups: Record<string, DailyRecord> = {};
        history.forEach(s => {
            const dk = getISTDateKey(s.timestamp);
            if (!groups[dk]) groups[dk] = { dateKey: dk, displayDate: new Date(s.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' }), timestamp: s.timestamp, ayaanEarnings: null, ayaanTime: null, riyaanEarnings: null, riyaanTime: null };

            if (s.player === 'Ayaan') {
                groups[dk].ayaanEarnings = (groups[dk].ayaanEarnings || 0) + s.earnings;
                groups[dk].ayaanTime = new Date(s.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            } else {
                groups[dk].riyaanEarnings = (groups[dk].riyaanEarnings || 0) + s.earnings;
                groups[dk].riyaanTime = new Date(s.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            }
        });
        return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
    }, [history]);

    switch (subView) {
        case SubView.HUB: return <MemoryHub onBack={onBack} onNavigate={(v) => setSubView(v as SubView)} onUserSelect={(u) => { setSelectedUser(u); setSubView(isPinEntryEnabled ? SubView.PIN_ENTRY : SubView.PRE_ENTRY); }} isMarketWorkingDay={isMarketOpenDay()} dateOverride={dateOverride} isWeekend={getEffectiveDate().getDay() === 0 || getEffectiveDate().getDay() === 6} isPublicHoliday={isMarketHoliday(getISTDateKey(getEffectiveDate()))} hasPlayedToday={hasPlayedToday} isUserLocked={isUserLocked} />;
        case SubView.PIN_ENTRY: return <AdditionPinEntry selectedUser={selectedUser} onSuccess={() => setSubView(SubView.PRE_ENTRY)} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.PRE_ENTRY: return <MemoryPreEntry selectedUser={selectedUser} isPlayed={hasPlayedToday(selectedUser)} isMarketWorking={isMarketOpenDay()} onStart={startGame} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.GAME: return <MemoryGame level={level} grid={grid} isRevealed={isRevealed} clickedNumbers={clickedNumbers} nextExpected={nextExpected} timeLeft={timeLeft} gameOver={gameOver} wrongClick={wrongClick} onCellClick={handleCellClick} />;
        case SubView.RESULTS: return finalResult ? <MemoryResults level3Correct={finalResult.level3Correct} level4Correct={finalResult.level4Correct} totalScore={finalResult.totalScore} reachedLevel4={finalResult.reachedLevel4} finalEarnings={finalEarnings} onExit={() => setSubView(SubView.HUB)} /> : null;
        case SubView.LOCAL_DASHBOARD: return <MemoryDashboard ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.MASTER_HISTORY: return <MemoryHistory history={history} historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} onBack={() => setSubView(SubView.HUB)} />;
        default: return null;
    }
};
