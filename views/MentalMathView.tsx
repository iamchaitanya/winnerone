import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { getISTDateKey } from '../src/lib/dateUtils';

// Hook
import { useMentalMathEngine, MentalMathResult } from '../src/hooks/useMentalMathEngine';

// Components
import { MentalMathHub } from '../src/components/mentalmath/MentalMathHub';
import { SubtractionPinEntry } from '../src/components/subtraction/SubtractionPinEntry';
import { MentalMathPreEntry } from '../src/components/mentalmath/MentalMathPreEntry';
import { MentalMathQuiz } from '../src/components/mentalmath/MentalMathQuiz';
import { MentalMathResults } from '../src/components/mentalmath/MentalMathResults';
import { MentalMathDashboard } from '../src/components/mentalmath/MentalMathDashboard';
import { MentalMathReview } from '../src/components/mentalmath/MentalMathReview';
import { MentalMathHistory } from '../src/components/mentalmath/MentalMathHistory';

interface MentalMathViewProps {
    onBack: () => void;
}

enum MentalMathSubView {
    HUB = 'hub',
    PIN_ENTRY = 'pin_entry',
    PRE_ENTRY = 'pre_entry',
    QUIZ = 'quiz',
    RESULTS = 'results',
    LOCAL_DASHBOARD = 'local_dashboard',
    REVIEW = 'review',
    MASTER_HISTORY = 'master_history'
}

interface GameSession {
    id: string;
    player: string;
    score: number;
    wrong: number;
    earnings: number;
    timestamp: number;
    details?: any;
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



export const MentalMathView: React.FC<MentalMathViewProps> = ({ onBack }) => {
    const settings = useGameStore((state) => state.settings);
    const profiles = useGameStore((state) => state.profiles);

    const [subView, setSubView] = useState<MentalMathSubView>(MentalMathSubView.HUB);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [historyFilter, setHistoryFilter] = useState<'Ayaan' | 'Riyaan'>('Ayaan');

    const dateOverride = settings.dateOverride;
    const isPinEntryEnabled = settings.pinEntryEnabled;
    const isSubmittingRef = useRef(false);

    const [ayaanTotal, setAyaanTotal] = useState<number>(0);
    const [riyaanTotal, setRiyaanTotal] = useState<number>(0);
    const [history, setHistory] = useState<GameSession[]>([]);
    const [currentResult, setCurrentResult] = useState<MentalMathResult | null>(null);
    const [finalSessionEarnings, setFinalSessionEarnings] = useState(0);
    const [finalStepsCompleted, setFinalStepsCompleted] = useState(0);
    const [finalIsCorrect, setFinalIsCorrect] = useState(false);

    const getUserProfile = useCallback((name: string | null) => {
        return profiles.find(p => p.player_name === name);
    }, [profiles]);

    // ☁️ Cloud Sync
    const syncWithCloud = useCallback(async () => {
        const { data, error } = await supabase
            .from('mentalmath_logs')
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
                details: log.details
            };
        });

        setAyaanTotal(aTotal);
        setRiyaanTotal(rTotal);
        setHistory(cloudHistory);
    }, []);

    useEffect(() => {
        syncWithCloud();

        const channel = supabase
            .channel('mentalmath_logs_live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mentalmath_logs' }, () => {
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
        const inCloud = history.some(s => s.player === player && getISTDateKey(s.timestamp) === todayIST);
        if (inCloud) return true;
        return localStorage.getItem(`mentalmath_attempt_${player}_${todayIST}`) === 'started';
    }, [history, getEffectiveDate]);

    const getTodaySession = useCallback((player: string | null) => {
        if (!player) return null;
        const todayIST = getISTDateKey(getEffectiveDate());
        return history.find(s => s.player === player && getISTDateKey(s.timestamp) === todayIST) || null;
    }, [history, getEffectiveDate]);

    // 🏁 Finish Logic
    const finishQuiz = useCallback(async (stepsCompleted: number, isCorrect: boolean, result: MentalMathResult) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        const earnings = (isCorrect ? stepsCompleted : -stepsCompleted) * settings.mentalmathMultiplier;
        setFinalStepsCompleted(stepsCompleted);
        setFinalIsCorrect(isCorrect);
        setFinalSessionEarnings(earnings);
        setCurrentResult(result);

        const effectiveTime = getEffectiveDate().getTime();

        if (selectedUser) {
            const userProfile = getUserProfile(selectedUser);
            const playerId = userProfile ? userProfile.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);

            const { error: insertError } = await supabase.from('mentalmath_logs').insert({
                player_id: playerId,
                score: stepsCompleted,
                wrong_count: isCorrect ? 0 : 1,
                earnings,
                details: result,
                played_at: new Date(effectiveTime).toISOString()
            });
            if (insertError) {
                console.error('❌ MentalMath log insert failed:', insertError);
            } else {
                console.log('✅ MentalMath log saved successfully');
            }
        }

        setSubView(MentalMathSubView.RESULTS);
        isSubmittingRef.current = false;
    }, [selectedUser, getEffectiveDate, getUserProfile, settings.mentalmathMultiplier]);

    const {
        phase,
        currentStep,
        stepsCompleted,
        timeLeft,
        answerTimeLeft,
        userInput,
        startQuiz: triggerEngineStart,
        handleNext,
        handleKeyClick,
        submitAnswer,
    } = useMentalMathEngine(finishQuiz);

    const startQuiz = () => {
        if (!isMarketOpenDay()) return alert('Market closed!');
        if (hasPlayedToday(selectedUser)) return alert('Already played today!');

        if (selectedUser) {
            const todayIST = getISTDateKey(getEffectiveDate());
            localStorage.setItem(`mentalmath_attempt_${selectedUser}_${todayIST}`, 'started');
        }

        triggerEngineStart();
        setSubView(MentalMathSubView.QUIZ);
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

    const historyEntries = useMemo(() => {
        return history
            .filter(s => s.player === historyFilter)
            .map(s => ({
                player: s.player,
                timestamp: s.timestamp,
                stepsCompleted: s.score,
                isCorrect: s.wrong === 0,
                correctAnswer: s.details?.correctAnswer ?? 0,
                userAnswer: s.details?.userAnswer ?? null,
                earnings: s.earnings,
                details: s.details
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [history, historyFilter]);

    switch (subView) {
        case MentalMathSubView.HUB:
            return (
                <MentalMathHub
                    onBack={onBack}
                    onNavigate={(v) => setSubView(v as MentalMathSubView)}
                    onUserSelect={(u) => {
                        setSelectedUser(u);
                        setSubView(isPinEntryEnabled ? MentalMathSubView.PIN_ENTRY : MentalMathSubView.PRE_ENTRY);
                    }}
                    isMarketWorkingDay={isMarketOpenDay()}
                    dateOverride={dateOverride}
                    isWeekend={getEffectiveDate().getDay() === 0 || getEffectiveDate().getDay() === 6}
                    isPublicHoliday={isMarketHoliday(getISTDateKey(getEffectiveDate()))}
                    hasPlayedToday={hasPlayedToday}
                    isUserLocked={(u) => getUserProfile(u)?.is_locked || false}
                />
            );
        case MentalMathSubView.PIN_ENTRY:
            return (
                <SubtractionPinEntry
                    selectedUser={selectedUser}
                    onSuccess={() => setSubView(MentalMathSubView.PRE_ENTRY)}
                    onBack={() => setSubView(MentalMathSubView.HUB)}
                />
            );
        case MentalMathSubView.PRE_ENTRY:
            return (
                <MentalMathPreEntry
                    selectedUser={selectedUser}
                    isPlayed={hasPlayedToday(selectedUser)}
                    isMarketWorking={isMarketOpenDay()}
                    todaySession={getTodaySession(selectedUser)}
                    onStart={startQuiz}
                    onReview={(s) => {
                        setCurrentResult(s.details);
                        setFinalStepsCompleted(s.score);
                        setFinalIsCorrect(s.wrong === 0);
                        setFinalSessionEarnings(s.earnings);
                        setSubView(MentalMathSubView.REVIEW);
                    }}
                    onBack={() => setSubView(MentalMathSubView.HUB)}
                />
            );
        case MentalMathSubView.QUIZ:
            return (
                <MentalMathQuiz
                    phase={phase as 'showing' | 'answering'}
                    currentStep={currentStep}
                    stepsCompleted={stepsCompleted}
                    timeLeft={timeLeft}
                    answerTimeLeft={answerTimeLeft}
                    userInput={userInput}
                    onNext={handleNext}
                    onKeyClick={handleKeyClick}
                    onSubmit={submitAnswer}
                />
            );
        case MentalMathSubView.RESULTS:
            return (
                <MentalMathResults
                    finalSessionEarnings={finalSessionEarnings}
                    stepsCompleted={finalStepsCompleted}
                    isCorrect={finalIsCorrect}
                    correctAnswer={currentResult?.correctAnswer ?? 0}
                    userAnswer={currentResult?.userAnswer ?? null}
                    onReview={() => setSubView(MentalMathSubView.REVIEW)}
                    onExit={() => setSubView(MentalMathSubView.HUB)}
                />
            );
        case MentalMathSubView.LOCAL_DASHBOARD:
            return (
                <MentalMathDashboard
                    ayaanTotal={ayaanTotal}
                    riyaanTotal={riyaanTotal}
                    groupedHistory={groupedHistory}
                    onBack={() => setSubView(MentalMathSubView.HUB)}
                />
            );
        case MentalMathSubView.REVIEW:
            return (
                <MentalMathReview
                    result={currentResult}
                    onBack={() => setSubView(MentalMathSubView.RESULTS)}
                />
            );
        case MentalMathSubView.MASTER_HISTORY:
            return (
                <MentalMathHistory
                    historyEntries={historyEntries}
                    historyFilter={historyFilter}
                    setHistoryFilter={setHistoryFilter}
                    onBack={() => setSubView(MentalMathSubView.HUB)}
                />
            );
        default:
            return null;
    }
};
