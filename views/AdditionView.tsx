import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';

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
  const [subView, setSubView] = useState<AdditionSubView>(AdditionSubView.HUB);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'Ayaan' | 'Riyaan'>('Ayaan');
  
  // Settings & Timing
  const [dateOverride] = useState<string | null>(() => localStorage.getItem('addition_date_override'));
  const isPinEntryEnabled = localStorage.getItem('pin_entry_enabled') !== 'false';
  const isSubmittingRef = useRef(false); 

  // Persistent & Local Results State
  const [ayaanTotal, setAyaanTotal] = useState<number>(0);
  const [riyaanTotal, setRiyaanTotal] = useState<number>(0);
  const [history, setHistory] = useState<GameSession[]>([]);
  const [sessionResults, setSessionResults] = useState<QuestionResult[]>([]);
  const [finalSessionEarnings, setFinalSessionEarnings] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWrong, setFinalWrong] = useState(0);

  // ☁️ Cloud Sync on Mount
  useEffect(() => {
    const syncWithCloud = async () => {
      const { data, error } = await supabase
        .from('addition_logs')
        .select('*')
        .order('played_at', { ascending: false })
        .limit(500);

      if (error || !data) return;

      let aTotal = 0;
      let rTotal = 0;
      
      const cloudHistory: GameSession[] = data.map((log: any) => {
        if (log.player_id === PLAYER_IDS.Ayaan) aTotal += log.earnings;
        if (log.player_id === PLAYER_IDS.Riyaan) rTotal += log.earnings;

        return {
          id: log.id,
          player: log.player_id === PLAYER_IDS.Ayaan ? 'Ayaan' : 'Riyaan',
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
    };

    syncWithCloud();
  }, []);

  // 🛠️ Date & Market Helpers
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
    const isHoliday = isMarketHoliday(d.toISOString().split('T')[0]);
    return !isWknd && !isHoliday;
  }, [getEffectiveDate]);

  const hasPlayedToday = useCallback((player: string | null) => {
    if (!player) return false;
    const today = getEffectiveDate().toDateString();
    const inHistory = history.some(s => s.player === player && new Date(s.timestamp).toDateString() === today);
    const attemptKey = `addition_attempt_${player}_${today}`;
    return inHistory || localStorage.getItem(attemptKey) === 'started';
  }, [history, getEffectiveDate]);

  const getTodaySession = useCallback((player: string | null) => {
    if (!player) return null;
    const today = getEffectiveDate().toDateString();
    return history.find(s => s.player === player && new Date(s.timestamp).toDateString() === today);
  }, [history, getEffectiveDate]);

  // 🏁 Finish Logic
  const finishQuiz = useCallback(async (fScore: number, fWrong: number, fResults: QuestionResult[]) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    
    const earnings = fScore - fWrong;
    setFinalScore(fScore);
    setFinalWrong(fWrong);
    setFinalSessionEarnings(earnings);
    setSessionResults(fResults);

    if (selectedUser === 'Ayaan') setAyaanTotal(prev => prev + earnings);
    else if (selectedUser === 'Riyaan') setRiyaanTotal(prev => prev + earnings);

    const effectiveTime = getEffectiveDate().getTime();
    const newSession: GameSession = {
      id: 'temp-' + Date.now(),
      player: selectedUser || 'Unknown',
      score: fScore,
      wrong: fWrong,
      earnings,
      timestamp: effectiveTime,
      results: fResults
    };
    setHistory(prev => [newSession, ...prev].slice(0, 500));

    if (selectedUser && PLAYER_IDS[selectedUser]) {
      await supabase.from('addition_logs').insert({
        player_id: PLAYER_IDS[selectedUser],
        score: fScore,
        wrong_count: fWrong,
        earnings,
        details: fResults,
        played_at: new Date(effectiveTime).toISOString()
      });
    }

    setSubView(AdditionSubView.RESULTS);
    isSubmittingRef.current = false; 
  }, [selectedUser, getEffectiveDate]);

  // 🧠 Addition Engine Hook
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
    
    if (selectedUser) {
        localStorage.setItem(`addition_attempt_${selectedUser}_${getEffectiveDate().toDateString()}`, 'started');
    }
    triggerEngineStart();
    setSubView(AdditionSubView.QUIZ);
  };

  // 🔐 PIN Logic
  const getUserAttempts = (user: string | null) => Number(localStorage.getItem(`pin_attempts_${user?.toLowerCase()}`) || '0');
  const isUserLocked = (user: string | null) => getUserAttempts(user) >= 3;

  const handleVerifyPin = async (pin: string) => {
    const correctPin = selectedUser === 'Ayaan' 
      ? (localStorage.getItem('pin_ayaan') || '123456') 
      : (localStorage.getItem('pin_riyaan') || '654321');
    
    if (pin === correctPin) {
      localStorage.setItem(`pin_attempts_${selectedUser?.toLowerCase()}`, '0');
      return true;
    }
    const nextAttempts = getUserAttempts(selectedUser) + 1;
    localStorage.setItem(`pin_attempts_${selectedUser?.toLowerCase()}`, nextAttempts.toString());
    return false;
  };

  // 📊 Data Aggregation
  const groupedHistory = useMemo(() => {
    const groups: Record<string, DailyRecord> = {};
    history.forEach(session => {
      const dateObj = new Date(session.timestamp);
      const dateKey = dateObj.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateKey,
          displayDate: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          timestamp: session.timestamp,
          ayaanEarnings: null, ayaanTime: null, riyaanEarnings: null, riyaanTime: null,
        };
      }
      if (session.player === 'Ayaan') {
        groups[dateKey].ayaanEarnings = (groups[dateKey].ayaanEarnings || 0) + session.earnings;
        groups[dateKey].ayaanTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        groups[dateKey].riyaanEarnings = (groups[dateKey].riyaanEarnings || 0) + session.earnings;
        groups[dateKey].riyaanTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    });
    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  const masterQuestionHistory = useMemo(() => {
    const all: Array<QuestionResult & { player: string; timestamp: number }> = [];
    history.forEach(s => s.results?.forEach(q => all.push({ ...q, player: s.player, timestamp: s.timestamp })));
    return all.filter(q => q.player === historyFilter).sort((a, b) => b.timestamp - a.timestamp);
  }, [history, historyFilter]);

  // 📺 View Switch
  switch (subView) {
    case AdditionSubView.HUB:
      return <AdditionHub onBack={onBack} onNavigate={(v) => setSubView(v as AdditionSubView)} onUserSelect={(u) => { setSelectedUser(u); setSubView(isPinEntryEnabled ? AdditionSubView.PIN_ENTRY : AdditionSubView.PRE_ENTRY); }} isMarketWorkingDay={isMarketOpenDay()} dateOverride={dateOverride} isWeekend={getEffectiveDate().getDay() === 0 || getEffectiveDate().getDay() === 6} isPublicHoliday={isMarketHoliday(getEffectiveDate().toISOString().split('T')[0])} hasPlayedToday={hasPlayedToday} isUserLocked={isUserLocked} />;
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