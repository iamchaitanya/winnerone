import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { useMultiplyEngine, MulQuestionResult } from '../src/hooks/useMultiplyEngine';
import { MultiplyHub } from '../src/components/multiply/MultiplyHub';
import { MultiplyPinEntry } from '../src/components/multiply/MultiplyPinEntry';
import { MultiplyPreEntry } from '../src/components/multiply/MultiplyPreEntry';
import { MultiplyQuiz } from '../src/components/multiply/MultiplyQuiz';
import { MultiplyResults } from '../src/components/multiply/MultiplyResults';
import { MultiplyDashboard } from '../src/components/multiply/MultiplyDashboard';
import { MultiplyReview } from '../src/components/multiply/MultiplyReview';
import { MultiplyHistory } from '../src/components/multiply/MultiplyHistory';

interface MultiplyViewProps { onBack: () => void; }

enum SV { HUB = 'hub', PIN = 'pin', PRE = 'pre', QUIZ = 'quiz', RESULTS = 'results', DASH = 'dash', REVIEW = 'review', HISTORY = 'history' }

interface GameSession { id: string; player: string; score: number; wrong: number; earnings: number; timestamp: number; results?: MulQuestionResult[]; }
interface DailyRecord { dateKey: string; displayDate: string; timestamp: number; ayaanEarnings: number | null; ayaanTime: string | null; riyaanEarnings: number | null; riyaanTime: string | null; }

const getISTDateKey = (date: Date | number) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));

export const MultiplyView: React.FC<MultiplyViewProps> = ({ onBack }) => {
    const settings = useGameStore(s => s.settings);
    const profiles = useGameStore(s => s.profiles);
    const [subView, setSubView] = useState<SV>(SV.HUB);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<'Ayaan' | 'Riyaan'>('Ayaan');
    const dateOverride = settings.dateOverride;
    const isPinEntryEnabled = settings.pinEntryEnabled;
    const isSubmittingRef = useRef(false);

    const [ayaanTotal, setAyaanTotal] = useState(0);
    const [riyaanTotal, setRiyaanTotal] = useState(0);
    const [history, setHistory] = useState<GameSession[]>([]);
    const [sessionResults, setSessionResults] = useState<MulQuestionResult[]>([]);
    const [finalSessionEarnings, setFinalSessionEarnings] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [finalWrong, setFinalWrong] = useState(0);

    const getUserProfile = useCallback((name: string | null) => profiles.find(p => p.player_name === name), [profiles]);

    const syncWithCloud = useCallback(async () => {
        const { data, error } = await supabase.from('multiply_logs').select('*').order('played_at', { ascending: false }).limit(500);
        if (error || !data) return;
        let aT = 0, rT = 0;
        const ch: GameSession[] = data.map((log: any) => {
            const pName = log.player_id === PLAYER_IDS.Ayaan ? 'Ayaan' : 'Riyaan';
            if (pName === 'Ayaan') aT += log.earnings; else rT += log.earnings;
            return { id: log.id, player: pName, score: log.score, wrong: log.wrong_count, earnings: log.earnings, timestamp: new Date(log.played_at).getTime(), results: log.details };
        });
        setAyaanTotal(aT); setRiyaanTotal(rT); setHistory(ch);
    }, []);

    useEffect(() => {
        syncWithCloud();
        const ch = supabase.channel('multiply_logs_live').on('postgres_changes', { event: '*', schema: 'public', table: 'multiply_logs' }, () => syncWithCloud()).subscribe();
        return () => { supabase.removeChannel(ch); };
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
        if (history.some(s => s.player === player && getISTDateKey(s.timestamp) === todayIST)) return true;
        return localStorage.getItem(`multiply_attempt_${player}_${todayIST}`) === 'started';
    }, [history, getEffectiveDate]);

    const getTodaySession = useCallback((player: string | null) => {
        if (!player) return null;
        const todayIST = getISTDateKey(getEffectiveDate());
        return history.find(s => s.player === player && getISTDateKey(s.timestamp) === todayIST) || null;
    }, [history, getEffectiveDate]);

    const finishQuiz = useCallback(async (fScore: number, fWrong: number, fResults: MulQuestionResult[]) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        const earnings = (fScore - fWrong) * settings.multiplyMultiplier;
        setFinalScore(fScore); setFinalWrong(fWrong); setFinalSessionEarnings(earnings); setSessionResults(fResults);
        if (selectedUser) {
            const up = getUserProfile(selectedUser);
            const pid = up ? up.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);
            await supabase.from('multiply_logs').insert({
                player_id: pid, score: fScore, wrong_count: fWrong, earnings, details: fResults,
                played_at: new Date(getEffectiveDate().getTime()).toISOString()
            });
            await syncWithCloud();
        }
        setSubView(SV.RESULTS); isSubmittingRef.current = false;
    }, [selectedUser, getEffectiveDate, getUserProfile, syncWithCloud, settings.multiplyMultiplier]);

    const { questions, currentIndex, userInput, score, timeLeft, startQuiz: triggerEngineStart, handleKeyClick } = useMultiplyEngine(finishQuiz);

    const startQuiz = () => {
        if (!isMarketOpenDay()) return alert('Market closed!');
        if (hasPlayedToday(selectedUser)) return alert('Already played today!');
        if (selectedUser) { const todayIST = getISTDateKey(getEffectiveDate()); localStorage.setItem(`multiply_attempt_${selectedUser}_${todayIST}`, 'started'); }
        triggerEngineStart(); setSubView(SV.QUIZ);
    };

    const groupedHistory = useMemo(() => {
        const groups: Record<string, DailyRecord> = {};
        history.forEach(s => {
            const dk = getISTDateKey(s.timestamp);
            if (!groups[dk]) { const d = new Date(s.timestamp); groups[dk] = { dateKey: dk, displayDate: d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' }), timestamp: s.timestamp, ayaanEarnings: null, ayaanTime: null, riyaanEarnings: null, riyaanTime: null }; }
            if (s.player === 'Ayaan') { groups[dk].ayaanEarnings = (groups[dk].ayaanEarnings || 0) + s.earnings; groups[dk].ayaanTime = new Date(s.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }); }
            else { groups[dk].riyaanEarnings = (groups[dk].riyaanEarnings || 0) + s.earnings; groups[dk].riyaanTime = new Date(s.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }); }
        });
        return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
    }, [history]);

    const masterQuestionHistory = useMemo(() => {
        const all: Array<MulQuestionResult & { player: string; timestamp: number }> = [];
        history.forEach(s => s.results?.forEach(q => all.push({ ...q, player: s.player, timestamp: s.timestamp })));
        return all.filter(q => q.player === historyFilter).sort((a, b) => b.timestamp - a.timestamp);
    }, [history, historyFilter]);

    switch (subView) {
        case SV.HUB: return <MultiplyHub onBack={onBack} onNavigate={v => setSubView(v as SV)} onUserSelect={u => { setSelectedUser(u); setSubView(isPinEntryEnabled ? SV.PIN : SV.PRE); }} isMarketWorkingDay={isMarketOpenDay()} dateOverride={dateOverride} isWeekend={getEffectiveDate().getDay() === 0 || getEffectiveDate().getDay() === 6} isPublicHoliday={isMarketHoliday(getISTDateKey(getEffectiveDate()))} hasPlayedToday={hasPlayedToday} isUserLocked={u => getUserProfile(u)?.is_locked || false} />;
        case SV.PIN: return <MultiplyPinEntry selectedUser={selectedUser} onSuccess={() => setSubView(SV.PRE)} onBack={() => setSubView(SV.HUB)} />;
        case SV.PRE: return <MultiplyPreEntry selectedUser={selectedUser} isPlayed={hasPlayedToday(selectedUser)} isMarketWorking={isMarketOpenDay()} todaySession={getTodaySession(selectedUser)} onStart={startQuiz} onReview={s => { setSessionResults(s.results); setFinalScore(s.score); setFinalWrong(s.wrong); setFinalSessionEarnings(s.earnings); setSubView(SV.REVIEW); }} onBack={() => setSubView(SV.HUB)} />;
        case SV.QUIZ: return <MultiplyQuiz currentQ={questions[currentIndex]} currentIndex={currentIndex} timeLeft={timeLeft} score={score} userInput={userInput} onKeyClick={handleKeyClick} />;
        case SV.RESULTS: return <MultiplyResults finalSessionEarnings={finalSessionEarnings} finalScore={finalScore} finalWrong={finalWrong} onReview={() => setSubView(SV.REVIEW)} onExit={() => setSubView(SV.HUB)} />;
        case SV.DASH: return <MultiplyDashboard ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setSubView(SV.HUB)} />;
        case SV.REVIEW: return <MultiplyReview sessionResults={sessionResults} onBack={() => setSubView(SV.RESULTS)} />;
        case SV.HISTORY: return <MultiplyHistory masterQuestionHistory={masterQuestionHistory} historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} onBack={() => setSubView(SV.HUB)} />;
        default: return null;
    }
};
