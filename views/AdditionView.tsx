import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { getISTDateKey } from '../src/lib/dateUtils';

// Hook Import
import { useAdditionEngine } from '../src/hooks/useAdditionEngine';

// Component Imports
import { AdditionHub } from '../src/components/addition/AdditionHub';
import { AdditionPinEntry } from '../src/components/addition/AdditionPinEntry';
import { AdditionPreEntry } from '../src/components/addition/AdditionPreEntry';
import { AdditionQuiz } from '../src/components/addition/AdditionQuiz';
import { AdditionResults } from '../src/components/addition/AdditionResults';
import { AdditionDashboard } from '../src/components/addition/AdditionDashboard';
import { AdditionReview } from '../src/components/addition/AdditionReview';
import { AdditionHistory } from '../src/components/addition/AdditionHistory';

interface AdditionViewProps {
  onBack: () => void;
}

enum AdditionSubView {
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



export const AdditionView: React.FC<AdditionViewProps> = ({ onBack }) => {
  const settings = useGameStore((state) => state.settings);
  const profiles = useGameStore((state) => state.profiles);

  const [subView, setSubView] = useState<AdditionSubView>(AdditionSubView.HUB);
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

  // ☁️ Cloud Sync (Consistent with Nifty/Sensex sync patterns)
  const syncWithCloud = useCallback(async () => {
    const { data, error } = await supabase
      .from('addition_logs')
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

    // Real-time updates like Nifty
    const channel = supabase
      .channel('addition_logs_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'addition_logs' }, () => {
        syncWithCloud();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  // 🛡️ Consistent Logic: Check ONLY History (Removes localStorage lock)
  const hasPlayedToday = useCallback((player: string | null) => {
    if (!player) return false;
    const todayIST = getISTDateKey(getEffectiveDate());
    const inCloud = history.some(s => s.player === player && getISTDateKey(s.timestamp) === todayIST);
    if (inCloud) return true;
    // 🛡️ Crash protection: also check localStorage for in-progress attempts
    return localStorage.getItem(`addition_attempt_${player}_${todayIST}`) === 'started';
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

    const earnings = (fScore - fWrong) * settings.additionMultiplier;
    setFinalScore(fScore);
    setFinalWrong(fWrong);
    setFinalSessionEarnings(earnings);
    setSessionResults(fResults);

    const effectiveTime = getEffectiveDate().getTime();

    if (selectedUser) {
      const userProfile = getUserProfile(selectedUser);
      const playerId = userProfile ? userProfile.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);

      // Save with a strict ISO string to avoid shifting
      await supabase.from('addition_logs').insert({
        player_id: playerId,
        score: fScore,
        wrong_count: fWrong,
        earnings,
        details: fResults,
        played_at: new Date(effectiveTime).toISOString()
      });
    }

    setSubView(AdditionSubView.RESULTS);
    isSubmittingRef.current = false;
  }, [selectedUser, getEffectiveDate, getUserProfile, settings.additionMultiplier]);

  const {
    questions,
    currentIndex,
    userInput,
    score,
    timeLeft,
    startQuiz: triggerEngineStart,
    handleKeyClick
  } = useAdditionEngine(finishQuiz);

  const startQuiz = () => {
    if (!isMarketOpenDay()) return alert("Market closed!");
    if (hasPlayedToday(selectedUser)) return alert("Already played today!");

    // Crash Protection (Internal only, doesn't block status display)
    if (selectedUser) {
      const todayIST = getISTDateKey(getEffectiveDate());
      localStorage.setItem(`addition_attempt_${selectedUser}_${todayIST}`, 'started');
    }

    triggerEngineStart();
    setSubView(AdditionSubView.QUIZ);
  };

  const getUserAttempts = (user: string | null) => getUserProfile(user)?.pin_attempts || 0;
  const isUserLocked = (user: string | null) => getUserProfile(user)?.is_locked || false;

  const handleVerifyPin = async (pin: string) => {
    const profile = getUserProfile(selectedUser);
    if (!profile) return false;

    if (pin === profile.pin) {
      await supabase.from('profiles').update({ pin_attempts: 0 }).eq('id', profile.id);
      return true;
    }

    const nextAttempts = (profile.pin_attempts || 0) + 1;
    const updates: any = { pin_attempts: nextAttempts };
    if (nextAttempts >= 3) updates.is_locked = true;
    await supabase.from('profiles').update(updates).eq('id', profile.id);

    return false;
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
    history.forEach(s => s.results?.forEach(q => all.push({ ...q, player: s.player, timestamp: s.timestamp })));
    return all.filter(q => q.player === historyFilter).sort((a, b) => b.timestamp - a.timestamp);
  }, [history, historyFilter]);

  // View Switch
  switch (subView) {
    case AdditionSubView.HUB:
      return <AdditionHub onBack={onBack} onNavigate={(v) => setSubView(v as AdditionSubView)} onUserSelect={(u) => { setSelectedUser(u); setSubView(isPinEntryEnabled ? AdditionSubView.PIN_ENTRY : AdditionSubView.PRE_ENTRY); }} isMarketWorkingDay={isMarketOpenDay()} dateOverride={dateOverride} isWeekend={getEffectiveDate().getDay() === 0 || getEffectiveDate().getDay() === 6} isPublicHoliday={isMarketHoliday(getISTDateKey(getEffectiveDate()))} hasPlayedToday={hasPlayedToday} isUserLocked={isUserLocked} />;
    case AdditionSubView.PIN_ENTRY:
      return <AdditionPinEntry selectedUser={selectedUser} isLocked={isUserLocked(selectedUser)} attempts={getUserAttempts(selectedUser)} onVerify={handleVerifyPin} onSuccess={() => setSubView(AdditionSubView.PRE_ENTRY)} onBack={() => setSubView(AdditionSubView.HUB)} />;
    case AdditionSubView.PRE_ENTRY:
      return <AdditionPreEntry selectedUser={selectedUser} isPlayed={hasPlayedToday(selectedUser)} isMarketWorking={isMarketOpenDay()} todaySession={getTodaySession(selectedUser)} onStart={startQuiz} onReview={(s) => { setSessionResults(s.results); setFinalScore(s.score); setFinalWrong(s.wrong); setFinalSessionEarnings(s.earnings); setSubView(AdditionSubView.REVIEW); }} onBack={() => setSubView(AdditionSubView.HUB)} />;
    case AdditionSubView.QUIZ:
      return <AdditionQuiz currentQ={questions[currentIndex]} currentIndex={currentIndex} timeLeft={timeLeft} score={score} userInput={userInput} onKeyClick={handleKeyClick} />;
    case AdditionSubView.RESULTS:
      return <AdditionResults finalSessionEarnings={finalSessionEarnings} finalScore={finalScore} finalWrong={finalWrong} onReview={() => setSubView(AdditionSubView.REVIEW)} onExit={() => setSubView(AdditionSubView.HUB)} />;
    case AdditionSubView.LOCAL_DASHBOARD:
      return <AdditionDashboard ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setSubView(AdditionSubView.HUB)} />;
    case AdditionSubView.REVIEW:
      return <AdditionReview sessionResults={sessionResults} onBack={() => setSubView(AdditionSubView.RESULTS)} />;
    case AdditionSubView.MASTER_HISTORY:
      return <AdditionHistory masterQuestionHistory={masterQuestionHistory} historyFilter={historyFilter} setHistoryFilter={setHistoryFilter} onBack={() => setSubView(AdditionSubView.HUB)} />;
    default:
      return null;
  }
};