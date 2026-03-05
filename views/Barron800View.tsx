import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { getISTDateKey } from '../src/lib/dateUtils';
import { barron800 } from '../src/lib/barron800Data';
import { useVocabEngine, VocabResult, VocabWord } from '../src/hooks/useVocabEngine';
import { VocabHub } from '../src/components/shared/VocabHub';
import { AdditionPinEntry } from '../src/components/addition/AdditionPinEntry';
import { VocabPreEntry } from '../src/components/shared/VocabPreEntry';
import { VocabGame } from '../src/components/shared/VocabGame';
import { VocabResults } from '../src/components/shared/VocabResults';
import { VocabDashboard } from '../src/components/shared/VocabDashboard';
import { VocabHistory } from '../src/components/shared/VocabHistory';

interface Props { onBack: () => void; }
enum SubView { HUB = 'hub', PIN = 'pin', PRE = 'pre', GAME = 'game', RESULTS = 'results', DASH = 'dash', HISTORY = 'history' }
interface GameSession { id: string; player: string; score: number; wrongCount: number; earnings: number; timestamp: number; }
interface DailyRecord { dateKey: string; displayDate: string; timestamp: number; ayaanEarnings: number | null; riyaanEarnings: number | null; }

const BARRON_RULES = [
    'Synonym or antonym question for each word',
    '4 options per question',
    'Wrong answer = game over',
    '50 seconds total timer',
    '+1 per correct · −1 per wrong',
    'One attempt per day'
];

export const Barron800View: React.FC<Props> = ({ onBack }) => {
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
    const [finalScore, setFinalScore] = useState(0);
    const [finalWrong, setFinalWrong] = useState(0);
    const [finalEarnings, setFinalEarnings] = useState(0);

    const getUserProfile = useCallback((name: string | null) => profiles.find(p => p.player_name === name), [profiles]);
    const syncWithCloud = useCallback(async () => {
        const { data } = await supabase.from('barron800_logs').select('*').order('played_at', { ascending: false }).limit(500);
        if (!data) return;
        let aT = 0, rT = 0;
        const h: GameSession[] = data.map((log: any) => {
            const pName = log.player_id === PLAYER_IDS.Ayaan ? 'Ayaan' : 'Riyaan';
            if (pName === 'Ayaan') aT += log.earnings; else rT += log.earnings;
            return { id: log.id, player: pName, score: log.score, wrongCount: log.wrong_count, earnings: log.earnings, timestamp: new Date(log.played_at).getTime() };
        });
        setAyaanTotal(aT); setRiyaanTotal(rT); setHistory(h);
    }, []);

    useEffect(() => { syncWithCloud(); const ch = supabase.channel('barron800_logs_live').on('postgres_changes', { event: '*', schema: 'public', table: 'barron800_logs' }, () => syncWithCloud()).subscribe(); return () => { supabase.removeChannel(ch); }; }, [syncWithCloud]);

    const getEffectiveDate = useCallback(() => { if (dateOverride) { const d = new Date(dateOverride); if (isNaN(d.getTime())) return new Date(); if (!dateOverride.includes('T')) { const now = new Date(); const [y, m, day] = dateOverride.split('-').map(Number); const ld = new Date(); ld.setFullYear(y, m - 1, day); ld.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()); return ld; } return d; } return new Date(); }, [dateOverride]);
    const isMarketOpenDay = useCallback(() => { const d = getEffectiveDate(); return !(d.getDay() === 0 || d.getDay() === 6) && !isMarketHoliday(getISTDateKey(d)); }, [getEffectiveDate]);
    const hasPlayedToday = useCallback((p: string | null) => {
        if (!p) return false;
        const t = getISTDateKey(getEffectiveDate());
        if (history.some(s => s.player === p && getISTDateKey(s.timestamp) === t)) return true;
        // Check local storage for crash protection
        return localStorage.getItem(`barron800_attempt_${p}_${t}`) === 'started';
    }, [history, getEffectiveDate]);

    const finishGame = useCallback(async (result: VocabResult) => {
        if (isSubmittingRef.current) return; isSubmittingRef.current = true;
        const earnings = (result.score - result.wrongCount) * settings.barron800Multiplier;
        setFinalScore(result.score); setFinalWrong(result.wrongCount); setFinalEarnings(earnings);
        if (selectedUser) {
            const up = getUserProfile(selectedUser);
            const pid = up ? up.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);
            const playedAt = new Date(getEffectiveDate().getTime());
            await supabase.from('barron800_logs').insert({ player_id: pid, score: result.score, wrong_count: result.wrongCount, earnings, details: { questions: result.questions.map(q => ({ word: q.word, type: q.questionType, correct: q.isCorrect })) }, played_at: playedAt.toISOString() });

            const todayIST = getISTDateKey(playedAt);
            localStorage.removeItem(`barron800_attempt_${selectedUser}_${todayIST}`);

            await syncWithCloud();
        }
        setSubView(SubView.RESULTS); isSubmittingRef.current = false;
    }, [selectedUser, getEffectiveDate, getUserProfile]);

    const { currentQuestion, currentIndex, questions, score, wrongCount, timeLeft, answered, isCorrectAnswer, startGame: triggerStart, handleAnswer } = useVocabEngine(barron800 as VocabWord[], 50, 'barron800', finishGame);

    const startGame = () => {
        if (!isMarketOpenDay()) return alert("Market closed!");
        if (hasPlayedToday(selectedUser)) return alert("Already played today!");

        if (selectedUser) {
            const todayIST = getISTDateKey(getEffectiveDate());
            localStorage.setItem(`barron800_attempt_${selectedUser}_${todayIST}`, 'started');
        }

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
        case SubView.HUB: return <VocabHub title="Barron 800" onBack={onBack} onNavigate={v => setSubView(v as SubView)} onUserSelect={u => { setSelectedUser(u); setSubView(isPinEnabled ? SubView.PIN : SubView.PRE); }} isMarketWorkingDay={isMarketOpenDay()} dateOverride={dateOverride} isWeekend={getEffectiveDate().getDay() === 0 || getEffectiveDate().getDay() === 6} isPublicHoliday={isMarketHoliday(getISTDateKey(getEffectiveDate()))} hasPlayedToday={hasPlayedToday} isUserLocked={isUserLocked} />;
        case SubView.PIN: return <AdditionPinEntry selectedUser={selectedUser} onSuccess={() => setSubView(SubView.PRE)} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.PRE: return <VocabPreEntry title="Barron 800" selectedUser={selectedUser} isPlayed={hasPlayedToday(selectedUser)} isMarketWorking={isMarketOpenDay()} rules={BARRON_RULES} onStart={startGame} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.GAME: return <VocabGame title="Barron 800" currentQuestion={currentQuestion} currentIndex={currentIndex} totalQuestions={questions.length} timeLeft={timeLeft} score={score} answered={answered} isCorrectAnswer={isCorrectAnswer} onAnswer={handleAnswer} />;
        case SubView.RESULTS: return <VocabResults title="Barron 800 Results" finalScore={finalScore} finalWrong={finalWrong} finalEarnings={finalEarnings} onExit={() => setSubView(SubView.HUB)} />;
        case SubView.DASH: return <VocabDashboard title="Barron 800 Dashboard" ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setSubView(SubView.HUB)} />;
        case SubView.HISTORY: return <VocabHistory title="Barron 800 History" history={history} historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} onBack={() => setSubView(SubView.HUB)} />;
        default: return null;
    }
};
