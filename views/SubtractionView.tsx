import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { getISTDateKey } from '../src/lib/dateUtils';

// Hook
import { useSubtractionEngine } from '../src/hooks/useSubtractionEngine';

// Components
import { SubtractionHub } from '../src/components/subtraction/SubtractionHub';
import { SubtractionPinEntry } from '../src/components/subtraction/SubtractionPinEntry';
import { SubtractionPreEntry } from '../src/components/subtraction/SubtractionPreEntry';
import { SubtractionQuiz } from '../src/components/subtraction/SubtractionQuiz';
import { SubtractionResults } from '../src/components/subtraction/SubtractionResults';
import { SubtractionDashboard } from '../src/components/subtraction/SubtractionDashboard';
import { SubtractionReview } from '../src/components/subtraction/SubtractionReview';
import { SubtractionHistory } from '../src/components/subtraction/SubtractionHistory';

interface SubtractionViewProps {
    onBack: () => void;
}

enum SubtractionSubView {
    HUB = 'hub',
    PIN_ENTRY = 'pin_entry',
    PRE_ENTRY = 'pre_entry',
    QUIZ = 'quiz',
    RESULTS = 'results',
    LOCAL_DASHBOARD = 'local_dashboard',
    REVIEW = 'review',
    MASTER_HISTORY = 'master_history'
}

interface Question {
    num1: number;
    num2: number;
    answer: number;
}

interface QuestionResult extends Question {
    userAnswer: number;
    isCorrect: boolean;
    timeTaken?: number;
}

interface GameSession {
    id: string;
    player: string;
    score: number;
    wrong: number;
    earnings: number;
    timestamp: number;
    results?: QuestionResult[];
}

interface DailyRecord {
    dateKey: string;
    displayDate: string;
    timestamp: number;
    ayaanEarnings: number | null;
    ayaanTime: string | null;
    riyaanEarnings: number | null;
    riyaanTime: string | null;
}



export const SubtractionView: React.FC<SubtractionViewProps> = ({ onBack }) => {
    const settings = useGameStore((state) => state.settings);
    const profiles = useGameStore((state) => state.profiles);

    const [subView, setSubView] = useState<SubtractionSubView>(SubtractionSubView.HUB);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<'Ayaan' | 'Riyaan'>('Ayaan');

    const dateOverride = settings.dateOverride;
    const isPinEntryEnabled = settings.pinEntryEnabled;
    const isSubmittingRef = useRef(false);

    const [ayaanTotal, setAyaanTotal] = useState<number>(0);
    const [riyaanTotal, setRiyaanTotal] = useState<number>(0);
    const [history, setHistory] = useState<GameSession[]>([]);
    const [sessionResults, setSessionResults] = useState<QuestionResult[]>([]);
    const [finalSessionEarnings, setFinalSessionEarnings] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [finalWrong, setFinalWrong] = useState(0);

    const getUserProfile = useCallback((name: string | null) => {
        return profiles.find(p => p.player_name === name);
    }, [profiles]);

    // ☁️ Cloud Sync
    const syncWithCloud = useCallback(async () => {
        const { data, error } = await supabase
            .from('subtraction_logs')
            .select('*')
            .order('played_at', { ascending: false })
            .limit(500);

        if (error || !data) return;

        let aTotal = 0;
        let rTotal = 0;

        const cloudHistory: GameSession[] = data.map((log: any) => {
            const pName = log.player_id === PLAYER_IDS.Ayaan ? 'Ayaan' : 'Riyaan';
            if (pName === 'Ayaan') aTotal += log.earnings;
            if (pName === 'Riyaan') rTotal += log.earnings;

            return {
                id: log.id,
                player: pName,
                score: log.score,
                wrong: log.wrong_count,
                earnings: log.earnings,
                timestamp: new Date(log.played_at).getTime(),
                results: log.details
            };
        });

        setAyaanTotal(aTotal);
        setRiyaanTotal(rTotal);
        setHistory(cloudHistory);
    }, []);

    useEffect(() => {
        syncWithCloud();

        const channel = supabase
            .channel('subtraction_logs_live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'subtraction_logs' }, () => {
                syncWithCloud();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [syncWithCloud]);

    const getEffectiveDate = useCallback(() => {
        if (dateOverride) {
            const d = new Date(dateOverride);
            if (isNaN(d.getTime())) return new Date();
            if (!dateOverride.includes('T')) {
                const now = new Date();
                const [y, m, day] = dateOverride.split('-').map(Number);
                const localDate = new Date();
                localDate.setFullYear(y, m - 1, day);
                localDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
                return localDate;
            }
            return d;
        }
        return new Date();
    }, [dateOverride]);

    const isMarketOpenDay = useCallback(() => {
        const d = getEffectiveDate();
        const day = d.getDay();
        const isWknd = day === 0 || day === 6;
        const isHoliday = isMarketHoliday(getISTDateKey(d));
        return !isWknd && !isHoliday;
    }, [getEffectiveDate]);

    const hasPlayedToday = useCallback((player: string | null) => {
        if (!player) return false;
        const todayIST = getISTDateKey(getEffectiveDate());
        // ✅ Check cloud history first
        const inCloud = history.some(s => s.player === player && getISTDateKey(s.timestamp) === todayIST);
        if (inCloud) return true;
        // 🛡️ Also check localStorage — guards against mid-quiz refresh
        return localStorage.getItem(`subtraction_attempt_${player}_${todayIST}`) === 'started';
    }, [history, getEffectiveDate]);

    const getTodaySession = useCallback((player: string | null) => {
        if (!player) return null;
        const todayIST = getISTDateKey(getEffectiveDate());
        return history.find(s => s.player === player && getISTDateKey(s.timestamp) === todayIST) || null;
    }, [history, getEffectiveDate]);

    // 🏁 Finish Logic
    const finishQuiz = useCallback(async (fScore: number, fWrong: number, fResults: QuestionResult[]) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        const earnings = (fScore - fWrong) * settings.subtractionMultiplier;
        setFinalScore(fScore);
        setFinalWrong(fWrong);
        setFinalSessionEarnings(earnings);
        setSessionResults(fResults);

        const effectiveTime = getEffectiveDate().getTime();

        if (selectedUser) {
            const userProfile = getUserProfile(selectedUser);
            const playerId = userProfile ? userProfile.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);

            const { error: insertError } = await supabase.from('subtraction_logs').insert({
                player_id: playerId,
                score: fScore,
                wrong_count: fWrong,
                earnings,
                details: fResults,
                played_at: new Date(effectiveTime).toISOString()
            });
            if (insertError) {
                console.error('❌ Subtraction log insert failed:', insertError);
            } else {
                console.log('✅ Subtraction log saved successfully');
                const todayIST = getISTDateKey(new Date(effectiveTime));
                localStorage.removeItem(`subtraction_attempt_${selectedUser}_${todayIST}`);
            }
            await syncWithCloud();
        }

        setSubView(SubtractionSubView.RESULTS);
        isSubmittingRef.current = false;
    }, [selectedUser, getEffectiveDate, getUserProfile, settings.subtractionMultiplier]);

    const {
        questions,
        currentIndex,
        userInput,
        score,
        timeLeft,
        startQuiz: triggerEngineStart,
        handleKeyClick
    } = useSubtractionEngine(finishQuiz);

    const startQuiz = () => {
        if (!isMarketOpenDay()) return alert('Market closed!');
        if (hasPlayedToday(selectedUser)) return alert('Already played today!');

        if (selectedUser) {
            const todayIST = getISTDateKey(getEffectiveDate());
            localStorage.setItem(`subtraction_attempt_${selectedUser}_${todayIST}`, 'started');
        }

        triggerEngineStart();
        setSubView(SubtractionSubView.QUIZ);
    };

    const groupedHistory = useMemo(() => {
        const groups: Record<string, DailyRecord> = {};
        history.forEach(session => {
            const dateKey = getISTDateKey(session.timestamp);
            if (!groups[dateKey]) {
                const dateObj = new Date(session.timestamp);
                groups[dateKey] = {
                    dateKey,
                    displayDate: dateObj.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' }),
                    timestamp: session.timestamp,
                    ayaanEarnings: null, ayaanTime: null, riyaanEarnings: null, riyaanTime: null,
                };
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
        const all: Array<QuestionResult & { player: string; timestamp: number }> = [];
        history.forEach(s => {
            const arr = Array.isArray(s.results) ? s.results : Array.isArray(s.results?.results) ? s.results.results : null;
            if (arr) arr.forEach((q: any) => all.push({ ...q, player: s.player, timestamp: s.timestamp }));
        });
        return all.filter(q => q.player === historyFilter).sort((a, b) => b.timestamp - a.timestamp);
    }, [history, historyFilter]);

    switch (subView) {
        case SubtractionSubView.HUB:
            return (
                <SubtractionHub
                    onBack={onBack}
                    onNavigate={(v) => setSubView(v as SubtractionSubView)}
                    onUserSelect={(u) => {
                        setSelectedUser(u);
                        setSubView(isPinEntryEnabled ? SubtractionSubView.PIN_ENTRY : SubtractionSubView.PRE_ENTRY);
                    }}
                    isMarketWorkingDay={isMarketOpenDay()}
                    dateOverride={dateOverride}
                    isWeekend={getEffectiveDate().getDay() === 0 || getEffectiveDate().getDay() === 6}
                    isPublicHoliday={isMarketHoliday(getISTDateKey(getEffectiveDate()))}
                    hasPlayedToday={hasPlayedToday}
                    isUserLocked={(u) => getUserProfile(u)?.is_locked || false}
                />
            );
        case SubtractionSubView.PIN_ENTRY:
            return (
                <SubtractionPinEntry
                    selectedUser={selectedUser}
                    onSuccess={() => setSubView(SubtractionSubView.PRE_ENTRY)}
                    onBack={() => setSubView(SubtractionSubView.HUB)}
                />
            );
        case SubtractionSubView.PRE_ENTRY:
            return (
                <SubtractionPreEntry
                    selectedUser={selectedUser}
                    isPlayed={hasPlayedToday(selectedUser)}
                    isMarketWorking={isMarketOpenDay()}
                    todaySession={getTodaySession(selectedUser)}
                    onStart={startQuiz}
                    onReview={(s) => {
                        setSessionResults(s.results);
                        setFinalScore(s.score);
                        setFinalWrong(s.wrong);
                        setFinalSessionEarnings(s.earnings);
                        setSubView(SubtractionSubView.REVIEW);
                    }}
                    onBack={() => setSubView(SubtractionSubView.HUB)}
                />
            );
        case SubtractionSubView.QUIZ:
            return (
                <SubtractionQuiz
                    currentQ={questions[currentIndex]}
                    currentIndex={currentIndex}
                    timeLeft={timeLeft}
                    score={score}
                    userInput={userInput}
                    onKeyClick={handleKeyClick}
                />
            );
        case SubtractionSubView.RESULTS:
            return (
                <SubtractionResults
                    finalSessionEarnings={finalSessionEarnings}
                    finalScore={finalScore}
                    finalWrong={finalWrong}
                    onReview={() => setSubView(SubtractionSubView.REVIEW)}
                    onExit={() => setSubView(SubtractionSubView.HUB)}
                />
            );
        case SubtractionSubView.LOCAL_DASHBOARD:
            return (
                <SubtractionDashboard
                    ayaanTotal={ayaanTotal}
                    riyaanTotal={riyaanTotal}
                    groupedHistory={groupedHistory}
                    onBack={() => setSubView(SubtractionSubView.HUB)}
                />
            );
        case SubtractionSubView.REVIEW:
            return (
                <SubtractionReview
                    sessionResults={sessionResults}
                    onBack={() => setSubView(SubtractionSubView.RESULTS)}
                />
            );
        case SubtractionSubView.MASTER_HISTORY:
            return (
                <SubtractionHistory
                    masterQuestionHistory={masterQuestionHistory}
                    historyFilter={historyFilter}
                    setHistoryFilter={setHistoryFilter}
                    onBack={() => setSubView(SubtractionSubView.HUB)}
                />
            );
        default:
            return null;
    }
};
