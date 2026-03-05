import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { getISTDateKey } from '../src/lib/dateUtils';

import { useMultiplication25Engine, Mul25QuestionResult } from '../src/hooks/useMultiplication25Engine';

import { Multiplication25Hub } from '../src/components/multiplication25/Multiplication25Hub';
import { Multiplication25PinEntry } from '../src/components/multiplication25/Multiplication25PinEntry';
import { Multiplication25PreEntry } from '../src/components/multiplication25/Multiplication25PreEntry';
import { Multiplication25Quiz } from '../src/components/multiplication25/Multiplication25Quiz';
import { Multiplication25Results } from '../src/components/multiplication25/Multiplication25Results';
import { Multiplication25Dashboard } from '../src/components/multiplication25/Multiplication25Dashboard';
import { Multiplication25Review } from '../src/components/multiplication25/Multiplication25Review';
import { Multiplication25History } from '../src/components/multiplication25/Multiplication25History';

interface Multiplication25ViewProps { onBack: () => void; }

enum Mul25SubView {
    HUB = 'hub', PIN_ENTRY = 'pin_entry', PRE_ENTRY = 'pre_entry',
    QUIZ = 'quiz', RESULTS = 'results', LOCAL_DASHBOARD = 'local_dashboard',
    REVIEW = 'review', MASTER_HISTORY = 'master_history'
}

interface GameSession {
    id: string; player: string; score: number; wrong: number;
    earnings: number; timestamp: number; results?: Mul25QuestionResult[];
}

interface DailyRecord {
    dateKey: string; displayDate: string; timestamp: number;
    ayaanEarnings: number | null; ayaanTime: string | null;
    riyaanEarnings: number | null; riyaanTime: string | null;
}



export const Multiplication25View: React.FC<Multiplication25ViewProps> = ({ onBack }) => {
    const settings = useGameStore(s => s.settings);
    const profiles = useGameStore(s => s.profiles);

    const [subView, setSubView] = useState<Mul25SubView>(Mul25SubView.HUB);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<'Ayaan' | 'Riyaan'>('Ayaan');
    const dateOverride = settings.dateOverride;
    const isPinEntryEnabled = settings.pinEntryEnabled;
    const isSubmittingRef = useRef(false);

    const [ayaanTotal, setAyaanTotal] = useState(0);
    const [riyaanTotal, setRiyaanTotal] = useState(0);
    const [history, setHistory] = useState<GameSession[]>([]);
    const [sessionResults, setSessionResults] = useState<Mul25QuestionResult[]>([]);
    const [finalSessionEarnings, setFinalSessionEarnings] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [finalWrong, setFinalWrong] = useState(0);

    const getUserProfile = useCallback((name: string | null) => profiles.find(p => p.player_name === name), [profiles]);

    const syncWithCloud = useCallback(async () => {
        const { data, error } = await supabase.from('multiplication25_logs').select('*').order('played_at', { ascending: false }).limit(500);
        if (error || !data) return;
        let aTotal = 0, rTotal = 0;
        const cloudHistory: GameSession[] = data.map((log: any) => {
            const pName = log.player_id === PLAYER_IDS.Ayaan ? 'Ayaan' : 'Riyaan';
            if (pName === 'Ayaan') aTotal += log.earnings;
            if (pName === 'Riyaan') rTotal += log.earnings;
            return { id: log.id, player: pName, score: log.score, wrong: log.wrong_count, earnings: log.earnings, timestamp: new Date(log.played_at).getTime(), results: log.details };
        });
        setAyaanTotal(aTotal); setRiyaanTotal(rTotal); setHistory(cloudHistory);
    }, []);

    useEffect(() => {
        syncWithCloud();
        const channel = supabase.channel('multiplication25_logs_live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'multiplication25_logs' }, syncWithCloud)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [syncWithCloud]);

    const getEffectiveDate = useCallback(() => {
        if (dateOverride) {
            if (!dateOverride.includes('T')) {
                const now = new Date();
                const [y, m, day] = dateOverride.split('-').map(Number);
                const d = new Date(); d.setFullYear(y, m - 1, day); d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
                return d;
            }
            const d = new Date(dateOverride); if (!isNaN(d.getTime())) return d;
        }
        return new Date();
    }, [dateOverride]);

    const isMarketOpenDay = useCallback(() => {
        const d = getEffectiveDate();
        return d.getDay() !== 0 && d.getDay() !== 6 && !isMarketHoliday(getISTDateKey(d));
    }, [getEffectiveDate]);

    const hasPlayedToday = useCallback((player: string | null) => {
        if (!player) return false;
        const todayIST = getISTDateKey(getEffectiveDate());
        if (history.some(s => s.player === player && getISTDateKey(s.timestamp) === todayIST)) return true;
        return localStorage.getItem(`multiplication25_attempt_${player}_${todayIST}`) === 'started';
    }, [history, getEffectiveDate]);

    const getTodaySession = useCallback((player: string | null) => {
        if (!player) return null;
        const todayIST = getISTDateKey(getEffectiveDate());
        return history.find(s => s.player === player && getISTDateKey(s.timestamp) === todayIST) || null;
    }, [history, getEffectiveDate]);

    const finishQuiz = useCallback(async (fScore: number, fWrong: number, fResults: Mul25QuestionResult[]) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        const earnings = (fScore - fWrong) * settings.multiplication25Multiplier;
        setFinalScore(fScore); setFinalWrong(fWrong); setFinalSessionEarnings(earnings); setSessionResults(fResults);
        const effectiveTime = getEffectiveDate().getTime();
        if (selectedUser) {
            const userProfile = getUserProfile(selectedUser);
            const playerId = userProfile ? userProfile.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);
            const { error: insertError } = await supabase.from('multiplication25_logs').insert({ player_id: playerId, score: fScore, wrong_count: fWrong, earnings, details: fResults, played_at: new Date(effectiveTime).toISOString() });
            if (insertError) {
                console.error('❌ Multiplication25 log insert failed:', insertError);
            } else {
                console.log('✅ Multiplication25 log saved successfully');
                const todayIST = getISTDateKey(new Date(effectiveTime));
                localStorage.removeItem(`multiplication25_attempt_${selectedUser}_${todayIST}`);
            }
        }
        setSubView(Mul25SubView.RESULTS);
        isSubmittingRef.current = false;
    }, [selectedUser, getEffectiveDate, getUserProfile, settings.multiplication25Multiplier]);

    const { questions, currentIndex, userInput, score, timeLeft, startQuiz: triggerEngineStart, handleKeyClick } = useMultiplication25Engine(finishQuiz);

    const startQuiz = () => {
        if (!isMarketOpenDay()) return alert('Market closed!');
        if (hasPlayedToday(selectedUser)) return alert('Already played today!');
        if (selectedUser) localStorage.setItem(`multiplication25_attempt_${selectedUser}_${getISTDateKey(getEffectiveDate())}`, 'started');
        triggerEngineStart();
        setSubView(Mul25SubView.QUIZ);
    };

    const groupedHistory = useMemo(() => {
        const groups: Record<string, DailyRecord> = {};
        history.forEach(session => {
            const dateKey = getISTDateKey(session.timestamp);
            if (!groups[dateKey]) {
                groups[dateKey] = { dateKey, displayDate: new Date(session.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' }), timestamp: session.timestamp, ayaanEarnings: null, ayaanTime: null, riyaanEarnings: null, riyaanTime: null };
            }
            if (session.player === 'Ayaan') {
                groups[dateKey].ayaanEarnings = (groups[dateKey].ayaanEarnings || 0) + session.earnings;
                groups[dateKey].ayaanTime = new Date(session.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            } else {
                groups[dateKey].riyaanEarnings = (groups[dateKey].riyaanEarnings || 0) + session.earnings;
                groups[dateKey].riyaanTime = new Date(session.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
            }
        });
        return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
    }, [history]);

    const masterQuestionHistory = useMemo(() => {
        const all: Array<Mul25QuestionResult & { player: string; timestamp: number }> = [];
        history.forEach(s => s.results?.forEach(q => all.push({ ...q, player: s.player, timestamp: s.timestamp })));
        return all.filter(q => q.player === historyFilter).sort((a, b) => b.timestamp - a.timestamp);
    }, [history, historyFilter]);

    switch (subView) {
        case Mul25SubView.HUB:
            return <Multiplication25Hub onBack={onBack} onNavigate={v => setSubView(v as Mul25SubView)} onUserSelect={u => { setSelectedUser(u); setSubView(isPinEntryEnabled ? Mul25SubView.PIN_ENTRY : Mul25SubView.PRE_ENTRY); }} isMarketWorkingDay={isMarketOpenDay()} dateOverride={dateOverride} isWeekend={[0, 6].includes(getEffectiveDate().getDay())} isPublicHoliday={isMarketHoliday(getISTDateKey(getEffectiveDate()))} hasPlayedToday={hasPlayedToday} isUserLocked={u => getUserProfile(u)?.is_locked || false} />;
        case Mul25SubView.PIN_ENTRY:
            return <Multiplication25PinEntry selectedUser={selectedUser} onSuccess={() => setSubView(Mul25SubView.PRE_ENTRY)} onBack={() => setSubView(Mul25SubView.HUB)} />;
        case Mul25SubView.PRE_ENTRY:
            return <Multiplication25PreEntry selectedUser={selectedUser} isPlayed={hasPlayedToday(selectedUser)} isMarketWorking={isMarketOpenDay()} todaySession={getTodaySession(selectedUser)} onStart={startQuiz} onReview={s => { setSessionResults(s.results || []); setFinalScore(s.score); setFinalWrong(s.wrong); setFinalSessionEarnings(s.earnings); setSubView(Mul25SubView.REVIEW); }} onBack={() => setSubView(Mul25SubView.HUB)} />;
        case Mul25SubView.QUIZ:
            return <Multiplication25Quiz currentQ={questions[currentIndex]} currentIndex={currentIndex} timeLeft={timeLeft} score={score} userInput={userInput} onKeyClick={handleKeyClick} />;
        case Mul25SubView.RESULTS:
            return <Multiplication25Results finalSessionEarnings={finalSessionEarnings} finalScore={finalScore} finalWrong={finalWrong} onReview={() => setSubView(Mul25SubView.REVIEW)} onExit={() => setSubView(Mul25SubView.HUB)} />;
        case Mul25SubView.LOCAL_DASHBOARD:
            return <Multiplication25Dashboard ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setSubView(Mul25SubView.HUB)} />;
        case Mul25SubView.REVIEW:
            return <Multiplication25Review sessionResults={sessionResults} onBack={() => setSubView(Mul25SubView.RESULTS)} />;
        case Mul25SubView.MASTER_HISTORY:
            return <Multiplication25History masterQuestionHistory={masterQuestionHistory} historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} onBack={() => setSubView(Mul25SubView.HUB)} />;
        default: return null;
    }
};
