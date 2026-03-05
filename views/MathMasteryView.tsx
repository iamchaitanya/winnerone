import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../src/lib/supabase';
import { useGameStore } from '../src/store/useGameStore';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { PLAYER_IDS } from '../src/lib/constants';
import { getISTDateKey } from '../src/lib/dateUtils';

import { MathMasteryHub } from '../src/components/mathmastery/MathMasteryHub';
import { MathMasteryPreEntry } from '../src/components/mathmastery/MathMasteryPreEntry';
import { MathMasteryQuiz } from '../src/components/mathmastery/MathMasteryQuiz';
import { MathMasteryResults } from '../src/components/mathmastery/MathMasteryResults';
import { MathMasteryReview } from '../src/components/mathmastery/MathMasteryReview';
import { MathMasteryDashboard } from '../src/components/mathmastery/MathMasteryDashboard';
import { MathMasteryHistory } from '../src/components/mathmastery/MathMasteryHistory';
import { SubtractionPinEntry as MathMasteryPinEntry } from '../src/components/subtraction/SubtractionPinEntry';
import { useMathMasteryEngine, MathMasteryResult } from '../src/hooks/useMathMasteryEngine';

type ViewMode = 'hub' | 'pin_entry' | 'pre_entry' | 'quiz' | 'results' | 'review' | 'local_dashboard' | 'master_history';

interface GameSession {
    id: string;
    player: string;
    score: number;
    wrong: number;
    earnings: number;
    timestamp: number;
    results: MathMasteryResult[];
}

interface MathMasteryViewProps {
    onBack: () => void;
}

export const MathMasteryView: React.FC<MathMasteryViewProps> = ({ onBack }) => {
    const { settings, profiles, setSettings } = useGameStore();
    const dateOverride = settings.dateOverride;
    const isPinEntryEnabled = settings.pinEntryEnabled;
    const isSubmittingRef = useRef(false);

    const [view, setView] = useState<ViewMode>('hub');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    const [ayaanTotal, setAyaanTotal] = useState<number>(0);
    const [riyaanTotal, setRiyaanTotal] = useState<number>(0);
    const [history, setHistory] = useState<GameSession[]>([]);
    const [sessionResults, setSessionResults] = useState<MathMasteryResult[]>([]);
    const [finalSessionEarnings, setFinalSessionEarnings] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [finalWrong, setFinalWrong] = useState(0);

    const getUserProfile = useCallback((name: string | null) => {
        return profiles.find(p => p.player_name === name);
    }, [profiles]);

    const syncWithCloud = useCallback(async () => {
        const { data, error } = await supabase
            .from('mathmastery_logs')
            .select('*')
            .order('played_at', { ascending: false })
            .limit(500);

        if (error || !data) {
            console.error('Error fetching mathmastery_logs:', error);
            return;
        }

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
        const channel = supabase.channel('mathmastery_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'mathmastery_logs' }, () => {
                syncWithCloud();
            }).subscribe();
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

    const hasPlayedToday = useCallback((userName: string) => {
        const todayIST = getISTDateKey(getEffectiveDate());
        // 🛡️ Also check localStorage — guards against mid-quiz refresh
        if (localStorage.getItem(`mathmastery_attempt_${userName}_${todayIST}`) === 'started') return true;
        return history.some(log => {
            if (log.player !== userName) return false;
            const logDate = new Date(log.timestamp);
            return getISTDateKey(logDate) === todayIST;
        });
    }, [history, getEffectiveDate]);

    const isUserLocked = useCallback((userName: string) => {
        const profile = getUserProfile(userName);
        return profile?.is_locked ?? false;
    }, [getUserProfile]);

    const finishQuiz = useCallback(async (fScore: number, fWrong: number, fResults: MathMasteryResult[]) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        const earnings = (fScore - fWrong) * settings.mathmasteryMultiplier;
        setFinalScore(fScore);
        setFinalWrong(fWrong);
        setFinalSessionEarnings(earnings);
        setSessionResults(fResults);

        const effectiveTime = getEffectiveDate().getTime();

        if (selectedUser) {
            const userProfile = getUserProfile(selectedUser);
            const playerId = userProfile ? userProfile.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);

            const { error: insertError } = await supabase.from('mathmastery_logs').insert({
                player_id: playerId,
                score: fScore,
                wrong_count: fWrong,
                earnings,
                details: fResults,
                played_at: new Date(effectiveTime).toISOString()
            });
            if (insertError) {
                console.error('❌ Math Mastery log insert failed:', insertError);
            } else {
                console.log('✅ Math Mastery log saved successfully');
                const todayIST = getISTDateKey(new Date(effectiveTime));
                localStorage.removeItem(`mathmastery_attempt_${selectedUser}_${todayIST}`);
            }
            await syncWithCloud();
        }

        setView('results');
        isSubmittingRef.current = false;
    }, [selectedUser, settings.mathmasteryMultiplier, getEffectiveDate, getUserProfile]);

    const {
        isPlaying, timeLeft, score, wrong, currentQuestion, userInput,
        startQuiz, handleKeyClick
    } = useMathMasteryEngine(finishQuiz);

    const handleUserSelect = (u: string) => {
        if (isUserLocked(u)) return;
        setSelectedUser(u);
        const userProfile = getUserProfile(u);
        if (isPinEntryEnabled && userProfile?.pin) {
            setView('pin_entry');
        } else {
            setView('pre_entry');
        }
    };

    const handlePinSuccess = () => setView('pre_entry');

    const handleStartQuiz = () => {
        if (hasPlayedToday(selectedUser!) || !isMarketOpenDay()) return;
        // 🛡️ Lock via localStorage so refresh mid-quiz counts as played
        const todayIST = getISTDateKey(getEffectiveDate());
        localStorage.setItem(`mathmastery_attempt_${selectedUser}_${todayIST}`, 'started');
        setView('quiz');
        startQuiz();
    };

    const groupedHistory = useMemo(() => {
        const groups: Record<string, { displayDate: string; ayaanEarnings: number | null; riyaanEarnings: number | null; ayaanTime: string; riyaanTime: string; timestamp: number }> = {};
        history.forEach(log => {
            const d = new Date(log.timestamp);
            const key = getISTDateKey(d);
            if (!groups[key]) {
                groups[key] = {
                    displayDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    ayaanEarnings: null, riyaanEarnings: null, ayaanTime: '', riyaanTime: '', timestamp: d.getTime()
                };
            }
            if (log.player === 'Ayaan') {
                groups[key].ayaanEarnings = (groups[key].ayaanEarnings || 0) + log.earnings;
                if (!groups[key].ayaanTime) groups[key].ayaanTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                groups[key].riyaanEarnings = (groups[key].riyaanEarnings || 0) + log.earnings;
                if (!groups[key].riyaanTime) groups[key].riyaanTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        });
        return Object.entries(groups).map(([k, v]) => ({ dateKey: k, ...v })).sort((a, b) => b.timestamp - a.timestamp);
    }, [history]);

    const [historyFilter, setHistoryFilter] = useState('Ayaan');
    const masterQuestionHistory = useMemo(() => {
        const all: Array<MathMasteryResult & { player: string; timestamp: number }> = [];
        history.forEach(s => {
            const arr = Array.isArray(s.results) ? s.results : Array.isArray((s.results as any)?.results) ? (s.results as any).results : null;
            if (arr) arr.forEach((q: any) => all.push({ ...q, player: s.player, timestamp: s.timestamp }));
        });
        return all.filter(q => q.player === historyFilter).sort((a, b) => b.timestamp - a.timestamp);
    }, [history, historyFilter]);

    if (view === 'quiz') {
        return (
            <MathMasteryQuiz
                currentQ={currentQuestion}
                timeLeft={timeLeft}
                score={score}
                wrong={wrong}
                userInput={userInput}
                onKeyClick={handleKeyClick}
            />
        );
    }
    if (view === 'results') {
        return (
            <MathMasteryResults
                finalSessionEarnings={finalSessionEarnings}
                score={finalScore}
                wrong={finalWrong}
                onReview={() => setView('review')}
                onExit={() => { setView('hub'); setSelectedUser(null); }}
            />
        );
    }
    if (view === 'review') {
        return <MathMasteryReview results={sessionResults} onBack={() => setView('results')} />;
    }
    if (view === 'pin_entry' && selectedUser) {
        const userProfile = getUserProfile(selectedUser);
        if (userProfile?.pin) {
            return <MathMasteryPinEntry selectedUser={selectedUser} onSuccess={handlePinSuccess} onBack={() => { setView('hub'); setSelectedUser(null); }} />;
        }
        // If profile loaded but has no pin, skip to pre_entry
        if (userProfile) {
            setTimeout(() => setView('pre_entry'), 0);
        }
        return null;
    }
    if (view === 'pre_entry') {
        const todayIST = getISTDateKey(getEffectiveDate());
        const todaySession = history.find(s => s.player === selectedUser && getISTDateKey(new Date(s.timestamp)) === todayIST);
        return (
            <MathMasteryPreEntry
                selectedUser={selectedUser}
                isPlayed={hasPlayedToday(selectedUser!)}
                isMarketWorking={isMarketOpenDay()}
                todaySession={todaySession}
                onStart={handleStartQuiz}
                onReview={(s) => { setSessionResults(s.results); setView('review'); }}
                onBack={() => { setView('hub'); setSelectedUser(null); }}
            />
        );
    }
    if (view === 'local_dashboard') {
        return <MathMasteryDashboard ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setView('hub')} />;
    }
    if (view === 'master_history') {
        return <MathMasteryHistory history={history} historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} masterQuestionHistory={masterQuestionHistory} onBack={() => setView('hub')} />;
    }

    const d = getEffectiveDate();
    const isWknd = d.getDay() === 0 || d.getDay() === 6;
    const isHoliday = isMarketHoliday(getISTDateKey(d));

    return (
        <MathMasteryHub
            onBack={onBack}
            onNavigate={(v) => setView(v)}
            onUserSelect={handleUserSelect}
            isMarketWorkingDay={isMarketOpenDay()}
            dateOverride={dateOverride}
            isWeekend={isWknd}
            isPublicHoliday={isHoliday}
            hasPlayedToday={hasPlayedToday}
            isUserLocked={isUserLocked}
        />
    );
};
