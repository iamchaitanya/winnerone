import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { getISTDateKey } from '../src/lib/dateUtils';
import { useWordPowerEngine, WordPowerResult } from '../src/hooks/useWordPowerEngine';
import { WordPowerHub } from '../src/components/wordpower/WordPowerHub';
import { AdditionPinEntry } from '../src/components/addition/AdditionPinEntry';
import { WordPowerPreEntry } from '../src/components/wordpower/WordPowerPreEntry';
import { WordPowerGame } from '../src/components/wordpower/WordPowerGame';
import { WordPowerResults } from '../src/components/wordpower/WordPowerResults';
import { WordPowerDashboard } from '../src/components/wordpower/WordPowerDashboard';
import { WordPowerHistory } from '../src/components/wordpower/WordPowerHistory';

interface Props { onBack: () => void; }
enum SubView { HUB = 'hub', PIN = 'pin', PRE = 'pre', GAME = 'game', RESULTS = 'results', DASH = 'dash', HISTORY = 'history' }
interface GameSession { id: string; player: string; score: number; rootsAttempted: number; earnings: number; timestamp: number; details: { root: string; meaning: string; question: string; userAnswer: number; correct: number; isCorrect: boolean }[]; }
interface DailyRecord { dateKey: string; displayDate: string; timestamp: number; ayaanEarnings: number | null; riyaanEarnings: number | null; }

export const WordPowerView: React.FC<Props> = ({ onBack }) => {
    const settings = useGameStore(s => s.settings);
    const profiles = useGameStore(s => s.profiles);
    const [subView, setSubView] = useState<SubView>(SubView.HUB);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<'Ayaan' | 'Riyaan'>('Ayaan');
    const isPinEnabled = settings.pinEntryEnabled;
    const dateOverride = settings.dateOverride;
    const isSubmittingRef = useRef(false);
    const [ayaanTotal, setAyaanTotal] = useState(0);
    const [riyaanTotal, setRiyaanTotal] = useState(0);
    const [history, setHistory] = useState<GameSession[]>([]);
    const [finalResult, setFinalResult] = useState<WordPowerResult | null>(null);
    const [finalEarnings, setFinalEarnings] = useState(0);

    const getUserProfile = useCallback((name: string | null) => profiles.find(p => p.player_name === name), [profiles]);

    const syncWithCloud = useCallback(async () => {
        const { data } = await supabase.from('wordpower_logs').select('*').order('played_at', { ascending: false }).limit(500);
        if (!data) return;
        let aT = 0, rT = 0;
        const h: GameSession[] = data.map((log: any) => {
            const pName = log.player_id === PLAYER_IDS.Ayaan ? 'Ayaan' : 'Riyaan';
            if (pName === 'Ayaan') aT += log.earnings; else rT += log.earnings;
            return { id: log.id, player: pName, score: log.score, rootsAttempted: log.details?.rootsAttempted || 0, earnings: log.earnings, timestamp: new Date(log.played_at).getTime(), details: log.details?.details || [] };
        });
        setAyaanTotal(aT); setRiyaanTotal(rT); setHistory(h);
    }, []);

    useEffect(() => { syncWithCloud(); const ch = supabase.channel('wordpower_logs_live').on('postgres_changes', { event: '*', schema: 'public', table: 'wordpower_logs' }, () => syncWithCloud()).subscribe(); return () => { supabase.removeChannel(ch); }; }, [syncWithCloud]);

    const getEffectiveDate = useCallback(() => { if (dateOverride) { const d = new Date(dateOverride); if (isNaN(d.getTime())) return new Date(); if (!dateOverride.includes('T')) { const now = new Date(); const [y, m, day] = dateOverride.split('-').map(Number); const ld = new Date(); ld.setFullYear(y, m - 1, day); ld.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()); return ld; } return d; } return new Date(); }, [dateOverride]);
    const isMarketOpenDay = useCallback(() => { const d = getEffectiveDate(); return !(d.getDay() === 0 || d.getDay() === 6) && !isMarketHoliday(getISTDateKey(d)); }, [getEffectiveDate]);
    const hasPlayedToday = useCallback((p: string | null) => { if (!p) return false; const t = getISTDateKey(getEffectiveDate()); return history.some(s => s.player === p && getISTDateKey(s.timestamp) === t); }, [history, getEffectiveDate]);

    const finishGame = useCallback(async (result: WordPowerResult) => {
        if (isSubmittingRef.current) return; isSubmittingRef.current = true;
        const earnings = result.totalScore * settings.wordpowerMultiplier;
        setFinalResult(result); setFinalEarnings(earnings);
        if (selectedUser) {
            const up = getUserProfile(selectedUser);
            const pid = up ? up.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);
            const playedAt = new Date(getEffectiveDate().getTime());
            await supabase.from('wordpower_logs').insert({ player_id: pid, score: result.totalScore, wrong_count: result.totalWrong, unanswered_count: result.totalUnanswered, earnings, details: result, played_at: playedAt.toISOString() });
            setHistory(prev => [{
                id: crypto.randomUUID(), player: selectedUser, score: result.totalScore, rootsAttempted: result.rootsAttempted || 0, earnings, timestamp: playedAt.getTime(), details: []
            }, ...prev]);
        }
        setSubView(SubView.RESULTS); isSubmittingRef.current = false;
    }, [selectedUser, getEffectiveDate, getUserProfile]);

    const { phase, currentRoot, currentQuestion, currentQuestionIndex, timeLeft, rootTimeLeft, isActive, answered, startGame: triggerStart, handleAnswer } = useWordPowerEngine(finishGame, selectedUser);

    const startGame = () => {
        if (!isMarketOpenDay()) return alert("Market closed!");
        if (hasPlayedToday(selectedUser)) return alert("Already played today!");
        triggerStart(); setSubView(SubView.GAME);
    };

    const getUserAttempts = (u: string | null) => getUserProfile(u)?.pin_attempts || 0;
    const isUserLocked = (u: string | null) => getUserProfile(u)?.is_locked || false;
    const handleVerifyPin = async (pin: string) => { const p = getUserProfile(selectedUser); if (!p) return false; if (pin === p.pin) { await supabase.from('profiles').update({ pin_attempts: 0 }).eq('id', p.id); return true; } const next = (p.pin_attempts || 0) + 1; const u: any = { pin_attempts: next }; if (next >= 3) u.is_locked = true; await supabase.from('profiles').update(u).eq('id', p.id); return false; };

    const groupedHistory = useMemo(() => {
        const g: Record<string, DailyRecord> = {};
        history.forEach(s => { const dk = getISTDateKey(s.timestamp); if (!g[dk]) g[dk] = { dateKey: dk, displayDate: new Date(s.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' }), timestamp: s.timestamp, ayaanEarnings: null, riyaanEarnings: null }; if (s.player === 'Ayaan') g[dk].ayaanEarnings = (g[dk].ayaanEarnings || 0) + s.earnings; else g[dk].riyaanEarnings = (g[dk].riyaanEarnings || 0) + s.earnings; });
        return Object.values(g).sort((a, b) => b.timestamp - a.timestamp);
    }, [history]);

    switch (subView) {
        case SubView.HUB: return <WordPowerHub onBack={onBack} onNavigate={v => setSubView(v as SubView)} onUserSelect={u => { setSelectedUser(u); setSubView(isPinEnabled ? SubView.PIN : SubView.PRE); }} isMarketWorkingDay={isMarketOpenDay()} dateOverride={dateOverride} isWeekend={getEffectiveDate().getDay() === 0 || getEffectiveDate().getDay() === 6} isPublicHoliday={isMarketHoliday(getISTDateKey(getEffectiveDate()))} hasPlayedToday={hasPlayedToday} isUserLocked={isUserLocked} />;
        case SubView.PIN: return <AdditionPinEntry selectedUser={selectedUser} onSuccess={() => setSubView(SubView.PRE)} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.PRE: return <WordPowerPreEntry selectedUser={selectedUser} isPlayed={hasPlayedToday(selectedUser)} isMarketWorking={isMarketOpenDay()} onStart={startGame} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.GAME: return <WordPowerGame phase={phase} currentRoot={currentRoot} currentQuestion={currentQuestion} currentQuestionIndex={currentQuestionIndex} timeLeft={timeLeft} rootTimeLeft={rootTimeLeft} answered={answered} onAnswer={handleAnswer} />;
        case SubView.RESULTS: return finalResult ? <WordPowerResults totalCorrect={finalResult.totalCorrect} totalWrong={finalResult.totalWrong} totalUnanswered={finalResult.totalUnanswered} totalScore={finalResult.totalScore} rootsAttempted={finalResult.rootsAttempted} finalEarnings={finalEarnings} onExit={() => setSubView(SubView.HUB)} /> : null;
        case SubView.DASH: return <WordPowerDashboard ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.HISTORY: return <WordPowerHistory history={history} historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} onBack={() => setSubView(SubView.HUB)} />;
        default: return null;
    }
};
