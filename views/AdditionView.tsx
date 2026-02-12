
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ArrowLeft, Check, IndianRupee, User, Users, BarChart2, Play, XCircle, MinusCircle, Crown, History, ChevronDown, ChevronRight, Calendar, Eye, AlertCircle, Clock, CalendarX, Lock, Delete, ShieldAlert } from 'lucide-react';
import { MARKET_HOLIDAYS_2025 } from '../types';

import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';

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
  timeTaken?: number; // In seconds
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
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'Ayaan' | 'Riyaan'>('Ayaan');
  
  // Settings
  const [dateOverride] = useState<string | null>(() => localStorage.getItem('addition_date_override'));
  const isPinEntryEnabled = localStorage.getItem('pin_entry_enabled') !== 'false';

  // Ref for tracking question timing
  const lastQuestionTimeRef = useRef<number>(0);

  // Persistent State
  const [ayaanTotal, setAyaanTotal] = useState<number>(() => Number(localStorage.getItem('ayaan_earnings') || '0'));
  const [riyaanTotal, setRiyaanTotal] = useState<number>(() => Number(localStorage.getItem('riyaan_earnings') || '0'));
  const [history, setHistory] = useState<GameSession[]>(() => {
    const saved = localStorage.getItem('addition_history');
    return saved ? JSON.parse(saved) : [];
  });


// ---------------------------------------------------------
  // ☁️ CLOUD SYNC: Download latest scores on mount
  // ---------------------------------------------------------
  useEffect(() => {
    const syncWithCloud = async () => {
      // 1. Fetch all logs from Supabase
      const { data, error } = await supabase
        .from('addition_logs')
        .select('*')
        .order('played_at', { ascending: false })
        .limit(500); // Fetch last 500 games

      if (error || !data) {
        console.error("Sync Error:", error);
        return;
      }

      // 2. Calculate Real-Time Totals
      let aTotal = 0;
      let rTotal = 0;
      
      // 3. Convert Cloud Data to App Format
      const cloudHistory: GameSession[] = data.map((log: any) => {
        // Sum up totals while we loop
        if (log.player_id === PLAYER_IDS.Ayaan) aTotal += log.earnings;
        if (log.player_id === PLAYER_IDS.Riyaan) rTotal += log.earnings;

        // Convert database row to GameSession object
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

      // 4. Update the App State
      setAyaanTotal(aTotal);
      setRiyaanTotal(rTotal);
      setHistory(cloudHistory);
      
      console.log("✅ Addition View fully synced with Cloud!");
    };

    syncWithCloud();
  }, []);
  // ---------------------------------------------------------


  // Helper to get effective current date
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
      
      const now = new Date();
      d.setSeconds(now.getSeconds(), now.getMilliseconds());
      return d;
    }
    return new Date();
  }, [dateOverride]);

  // Market Day Helpers
  const isWeekend = useCallback((date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }, []);

  const isPublicHoliday = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return MARKET_HOLIDAYS_2025.includes(dateStr);
  }, []);

  const isMarketOpenDay = useCallback(() => {
    const d = getEffectiveDate();
    return !isWeekend(d) && !isPublicHoliday(d);
  }, [getEffectiveDate, isWeekend, isPublicHoliday]);

  // Lockout logic
  const getUserAttempts = (user: string | null) => {
    if (!user) return 0;
    return Number(localStorage.getItem(`pin_attempts_${user.toLowerCase()}`) || '0');
  };

  const isUserLocked = (user: string | null) => {
    return getUserAttempts(user) >= 3;
  };

  const incrementAttempts = (user: string) => {
    const key = `pin_attempts_${user.toLowerCase()}`;
    const attempts = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, attempts.toString());
    return attempts;
  };

  const resetAttempts = (user: string) => {
    localStorage.setItem(`pin_attempts_${user.toLowerCase()}`, '0');
  };

  // Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100); 
  const [isActive, setIsActive] = useState(false);
  const [sessionResults, setSessionResults] = useState<QuestionResult[]>([]);
  
  // Track final state to avoid reading stale variables during transition
  const [finalSessionEarnings, setFinalSessionEarnings] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWrong, setFinalWrong] = useState(0);

  const finishRef = useRef<(fS?: number, fW?: number, fR?: QuestionResult[]) => void>(() => {});

  const hasPlayedToday = useCallback((player: string | null) => {
    if (!player) return false;
    const today = getEffectiveDate().toDateString();
    return history.some(s => s.player === player && new Date(s.timestamp).toDateString() === today);
  }, [history, getEffectiveDate]);

  const getTodaySession = useCallback((player: string | null) => {
    if (!player) return null;
    const today = getEffectiveDate().toDateString();
    return history.find(s => s.player === player && new Date(s.timestamp).toDateString() === today);
  }, [history, getEffectiveDate]);

  const generateQuestions = useCallback(() => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 100; i++) {
      const n1 = Math.floor(Math.random() * 90) + 10;
      const n2 = Math.floor(Math.random() * 90) + 10;
      newQuestions.push({ num1: n1, num2: n2, answer: n1 + n2 });
    }
    return newQuestions;
  }, []);

  const finishQuiz = useCallback(async (fScore?: number, fWrong?: number, fResults?: QuestionResult[]) => {
    setIsActive(false);
    
    // 1. Calculate final stats
    const s = fScore !== undefined ? fScore : score;
    const w = fWrong !== undefined ? fWrong : wrongCount;
    const results = fResults !== undefined ? fResults : sessionResults;
    const earnings = s - w;
    
    // 2. Update Local State (So the UI updates instantly)
    setFinalScore(s);
    setFinalWrong(w);
    setFinalSessionEarnings(earnings);

    // 3. Update Local Storage (Backup)
    if (selectedUser === 'Ayaan') {
      const newVal = ayaanTotal + earnings;
      setAyaanTotal(newVal);
      localStorage.setItem('ayaan_earnings', newVal.toString());
    } else if (selectedUser === 'Riyaan') {
      const newVal = riyaanTotal + earnings;
      setRiyaanTotal(newVal);
      localStorage.setItem('riyaan_earnings', newVal.toString());
    }

    const effectiveTime = getEffectiveDate().getTime();

    // 4. Update Local History
    const newSession: GameSession = {
      id: Math.random().toString(36).substr(2, 9),
      player: selectedUser || 'Unknown',
      score: s,
      wrong: w,
      earnings,
      timestamp: effectiveTime,
      results: results
    };
    const updatedHistory = [newSession, ...history].slice(0, 500);
    setHistory(updatedHistory);
    localStorage.setItem('addition_history', JSON.stringify(updatedHistory));

    // ---------------------------------------------------------
    // 5. ☁️ CLOUD SYNC (The New Part)
    // ---------------------------------------------------------
    if (selectedUser && (selectedUser === 'Ayaan' || selectedUser === 'Riyaan')) {
      const playerId = PLAYER_IDS[selectedUser];
      
      const { error } = await supabase.from('addition_logs').insert({
        player_id: playerId,
        score: s,
        wrong_count: w,
        earnings: earnings,
        details: results, // We save the full question history!
        played_at: new Date(effectiveTime).toISOString()
      });

      if (error) {
        console.error("❌ Failed to save to Supabase:", error);
        alert("Warning: Score saved locally but failed to upload. Check internet.");
      } else {
        console.log("✅ Score safely uploaded to the cloud!");
      }
    }
    // ---------------------------------------------------------

    setSubView(AdditionSubView.RESULTS);
  }, [score, wrongCount, selectedUser, ayaanTotal, riyaanTotal, history, sessionResults, getEffectiveDate]);

  useEffect(() => {
    finishRef.current = finishQuiz;
  }, [finishQuiz]);

  const startQuiz = () => {
    if (!isMarketOpenDay()) {
      alert("Trading closed today! The game is only available Monday to Friday, excluding holidays.");
      return;
    }
    if (hasPlayedToday(selectedUser)) return;
    setQuestions(generateQuestions());
    setCurrentIndex(0);
    setUserInput('');
    setScore(0);
    setWrongCount(0);
    setTimeLeft(100);
    setSessionResults([]);
    setIsActive(true);
    setSubView(AdditionSubView.QUIZ);
    lastQuestionTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (!isActive) return;
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleKeyClick = (val: string) => {
    if (userInput.length < 3) {
      const newInput = userInput + val;
      setUserInput(newInput);
      if (newInput.length === 3) processAnswer(newInput);
    }
  };

  const processAnswer = (val: string) => {
    const numericAns = parseInt(val, 10);
    const correct = numericAns === questions[currentIndex].answer;
    const now = Date.now();
    const timeTaken = (now - lastQuestionTimeRef.current) / 1000;
    lastQuestionTimeRef.current = now;

    const nextScore = correct ? score + 1 : score;
    const nextWrong = correct ? wrongCount : wrongCount + 1;
    
    if (correct) setScore(nextScore);
    else setWrongCount(nextWrong);

    const resultEntry = {
      ...questions[currentIndex],
      userAnswer: numericAns,
      isCorrect: correct,
      timeTaken
    };
    
    const nextResults = [...sessionResults, resultEntry];
    setSessionResults(nextResults);

    if (currentIndex < 99) {
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setUserInput('');
      }, 100);
    } else {
      // Pass the fully updated values to finishQuiz to avoid stale state
      finishQuiz(nextScore, nextWrong, nextResults);
    }
  };

  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    if (isPinEntryEnabled) {
      setPinInput('');
      setPinError(false);
      setSubView(AdditionSubView.PIN_ENTRY);
    } else {
      setSubView(AdditionSubView.PRE_ENTRY);
    }
  };

  const handlePinKey = (num: string) => {
    if (isUserLocked(selectedUser) || pinError) return;
    if (pinInput.length < 6) {
      const nextVal = pinInput + num;
      setPinInput(nextVal);
      if (nextVal.length === 6) {
        verifyPin(nextVal);
      }
    }
  };

  const handlePinDelete = () => {
    if (isUserLocked(selectedUser) || pinError) return;
    setPinInput(pinInput.slice(0, -1));
    setPinError(false);
  };

  const verifyPin = (pin: string) => {
    const correctPin = selectedUser === 'Ayaan' 
      ? (localStorage.getItem('pin_ayaan') || '123456') 
      : (localStorage.getItem('pin_riyaan') || '654321');
    
    if (pin === correctPin) {
      resetAttempts(selectedUser!);
      setSubView(AdditionSubView.PRE_ENTRY);
    } else {
      setPinError(true);
      incrementAttempts(selectedUser!);
      // Delay clearing to allow shake animation to be seen
      setTimeout(() => {
        setPinInput('');
        setPinError(false);
      }, 600);
    }
  };

  const groupedHistory = useMemo(() => {
    const groups: Record<string, DailyRecord> = {};
    history.forEach(session => {
      const dateObj = new Date(session.timestamp);
      const dateKey = dateObj.toDateString();
      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateKey,
          displayDate: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          timestamp: session.timestamp,
          ayaanEarnings: null,
          ayaanTime: null,
          riyaanEarnings: null,
          riyaanTime: null,
        };
      }
      
      if (session.player === 'Ayaan') {
        groups[dateKey].ayaanEarnings = (groups[dateKey].ayaanEarnings || 0) + session.earnings;
        groups[dateKey].ayaanTime = timeStr;
      } else if (session.player === 'Riyaan') {
        groups[dateKey].riyaanEarnings = (groups[dateKey].riyaanEarnings || 0) + session.earnings;
        groups[dateKey].riyaanTime = timeStr;
      }
      
      if (session.timestamp > groups[dateKey].timestamp) {
        groups[dateKey].timestamp = session.timestamp;
      }
    });
    return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
  }, [history]);

  const masterQuestionHistory = useMemo(() => {
    const allQuestions: Array<QuestionResult & { player: string; timestamp: number }> = [];
    history.forEach(session => {
      if (session.results) {
        session.results.forEach(q => {
          allQuestions.push({
            ...q,
            player: session.player,
            timestamp: session.timestamp
          });
        });
      }
    });
    const filtered = allQuestions.filter(q => q.player === historyFilter);
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [history, historyFilter]);

  if (subView === AdditionSubView.HUB) {
    const ayaanPlayed = hasPlayedToday('Ayaan');
    const riyaanPlayed = hasPlayedToday('Riyaan');
    const effectiveDate = getEffectiveDate();
    const isMarketWorkingDay = isMarketOpenDay();
    const isWknd = isWeekend(effectiveDate);
    const isHoliday = isPublicHoliday(effectiveDate);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in fade-in duration-500">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Addition Hub</h1>
                {!isMarketWorkingDay && (
                  <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase rounded-full tracking-wider border border-rose-200/50 dark:border-rose-800/50">
                    Market Closed
                  </span>
                )}
              </div>
              {dateOverride && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Override Active</span>}
            </div>
          </div>
        </header>
        
        {!isMarketWorkingDay && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="p-5 rounded-[2rem] border bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30 flex items-center gap-4 shadow-sm">
              <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                <CalendarX size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Market Status</p>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {isWknd ? 'Weekend Holiday' : isHoliday ? 'Public Holiday' : 'Session Closed'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Games are disabled during market closures.</p>
              </div>
            </div>
          </div>
        )}

        <section className="flex flex-col gap-4 max-w-md mx-auto">
          <button 
            onClick={() => handleUserSelect('Ayaan')} 
            className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl transition-all group hover:border-indigo-400 active:scale-[0.98]"
          >
            <div className="flex items-center gap-6 w-full">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                {isUserLocked('Ayaan') ? <Lock size={32} className="text-rose-500" /> : <User size={32} />}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className={`font-black text-2xl tracking-tighter uppercase leading-none ${isUserLocked('Ayaan') ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  AYAAN {isUserLocked('Ayaan') && '(LOCKED)'}
                </span>
                {ayaanPlayed && !isUserLocked('Ayaan') && <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><Check size={10} /> Completed Today</span>}
              </div>
            </div>
          </button>
          <button 
            onClick={() => handleUserSelect('Riyaan')} 
            className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl transition-all group hover:border-rose-400 active:scale-[0.98]"
          >
            <div className="flex items-center gap-6 w-full">
              <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl group-hover:scale-110 transition-transform">
                {isUserLocked('Riyaan') ? <Lock size={32} className="text-rose-500" /> : <Users size={32} />}
              </div>
              <div className="flex flex-col items-start text-left">
                <span className={`font-black text-2xl tracking-tighter uppercase leading-none ${isUserLocked('Riyaan') ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  RIYAAN {isUserLocked('Riyaan') && '(LOCKED)'}
                </span>
                {riyaanPlayed && !isUserLocked('Riyaan') && <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1 flex items-center gap-1"><Check size={10} /> Completed Today</span>}
              </div>
            </div>
          </button>
          <button onClick={() => setSubView(AdditionSubView.LOCAL_DASHBOARD)} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:border-amber-400 transition-all active:scale-[0.98] group">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform"><BarChart2 size={32} /></div>
              <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">DASHBOARD</span>
            </div>
          </button>
          <button onClick={() => setSubView(AdditionSubView.MASTER_HISTORY)} className="flex flex-row items-center px-6 h-24 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl hover:border-indigo-400 transition-all active:scale-[0.98] group">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform"><History size={32} /></div>
              <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter uppercase">HISTORY</span>
            </div>
          </button>
        </section>
      </div>
    );
  }

  if (subView === AdditionSubView.PIN_ENTRY) {
    const locked = isUserLocked(selectedUser);
    const attempts = getUserAttempts(selectedUser);
    const attemptsLeft = Math.max(0, 3 - attempts);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-300">
        <div className="mb-8 text-center">
          <div className={`w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-800 ${locked ? 'ring-4 ring-rose-500/20' : ''}`}>
            {locked ? <ShieldAlert size={32} className="text-rose-500 animate-pulse" /> : <Lock size={32} className="text-indigo-500" />}
          </div>
          <h2 className={`text-2xl font-black uppercase tracking-tighter ${locked ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
            {locked ? 'Account Locked' : 'Enter PIN'}
          </h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Hello, {selectedUser}</p>
        </div>

        {locked ? (
          <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-800/50 max-w-xs text-center mb-8">
            <p className="text-rose-600 dark:text-rose-400 font-bold text-sm leading-relaxed">Too many wrong attempts. Please contact the administrator to unlock your account.</p>
          </div>
        ) : (
          <>
            <div className={`flex gap-3 mb-6 ${pinError ? 'animate-shake' : ''}`}>
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                    pinError ? 'bg-rose-500 border-rose-500 scale-110 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 
                    i < pinInput.length ? 'bg-indigo-500 border-indigo-500 scale-110 shadow-[0_0_12px_rgba(99,102,241,0.3)]' : 'bg-transparent border-slate-200 dark:border-slate-800'
                  }`}
                />
              ))}
            </div>

            <div className="h-10 mb-8 flex flex-col items-center justify-center">
              {pinError ? (
                <p className="text-rose-500 font-black text-xs uppercase tracking-[0.2em] animate-bounce">Incorrect PIN</p>
              ) : (
                attempts > 0 && (
                  <p className={`text-[10px] font-black uppercase tracking-widest ${attemptsLeft === 1 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                    {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
                  </p>
                )
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button 
                  key={num} 
                  disabled={pinError}
                  onClick={() => handlePinKey(num.toString())}
                  className="h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-2xl font-black text-slate-900 dark:text-white active:scale-90 transition-transform disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <div />
              <button 
                disabled={pinError}
                onClick={() => handlePinKey('0')}
                className="h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-2xl font-black text-slate-900 dark:text-white active:scale-90 transition-transform disabled:opacity-50"
              >
                0
              </button>
              <button 
                disabled={pinError}
                onClick={handlePinDelete}
                className="h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 active:scale-90 transition-transform disabled:opacity-50"
              >
                <Delete size={24} />
              </button>
            </div>
          </>
        )}

        <button onClick={() => setSubView(AdditionSubView.HUB)} className="mt-12 text-slate-400 font-bold text-sm uppercase tracking-widest">Back</button>
      </div>
    );
  }

  if (subView === AdditionSubView.MASTER_HISTORY) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300">
        <header className="flex flex-col gap-6 mb-8 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-4">
            <button onClick={() => setSubView(AdditionSubView.HUB)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Question History</h1>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-full">
            {(['Ayaan', 'Riyaan'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setHistoryFilter(filter)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  historyFilter === filter 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-12 max-w-lg mx-auto w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ques</th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ans</th>
                  <th className="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Corr</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {masterQuestionHistory.length > 0 ? (
                  masterQuestionHistory.map((res, idx) => (
                    <tr 
                      key={idx} 
                      className={`transition-colors ${res.isCorrect 
                        ? 'bg-emerald-50/30 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' 
                        : 'bg-rose-50/30 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                          {res.num1} + {res.num2}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-sm font-black tabular-nums ${res.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {res.userAnswer}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {res.answer}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[11px] font-bold text-slate-400 tabular-nums uppercase">
                          {res.timeTaken ? `${res.timeTaken.toFixed(1)}s` : '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                          <History size={32} className="text-slate-200 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (subView === AdditionSubView.PRE_ENTRY) {
    const isPlayed = hasPlayedToday(selectedUser);
    const todaySession = getTodaySession(selectedUser);
    const isMarketWorking = isMarketOpenDay();

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300 text-center">
        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800">
          {selectedUser === 'Ayaan' ? <User size={48} className="text-indigo-600" /> : <Users size={48} className="text-rose-600" />}
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Hello, {selectedUser}</h2>
        
        {isPlayed ? (
          <>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 mb-12 flex items-center gap-3">
              <Check size={20} className="text-emerald-500" />
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wide">You've finished today's challenge!</p>
            </div>
            <button 
              onClick={() => {
                if (todaySession?.results) {
                  setSessionResults(todaySession.results);
                  setFinalScore(todaySession.score);
                  setFinalWrong(todaySession.wrong);
                  setFinalSessionEarnings(todaySession.earnings);
                  setSubView(AdditionSubView.REVIEW);
                }
              }}
              className="w-full max-w-xs h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl mx-auto block"
            >
              <Eye size={24} /> REVIEW RESULTS
            </button>
          </>
        ) : !isMarketWorking ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 px-8 py-6 rounded-[2rem] border border-amber-100 dark:border-amber-800/50 mb-12 max-w-xs">
            <CalendarX size={32} className="text-amber-500 mx-auto mb-3" />
            <p className="text-amber-600 dark:text-amber-400 font-black text-sm uppercase tracking-wide">Market Closed</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Picks and games only allowed Monday-Friday, excluding holidays.</p>
          </div>
        ) : (
          <>
            <p className="text-slate-400 font-medium mb-12 uppercase tracking-widest text-xs">Ready for the 100-Second Challenge?</p>
            <button 
              onClick={startQuiz} 
              className="w-full max-w-xs h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl mx-auto block"
            >
              <Play size={24} fill="currentColor" /> START
            </button>
          </>
        )}
        
        <button onClick={() => setSubView(AdditionSubView.HUB)} className="mt-8 text-slate-400 font-bold text-sm uppercase tracking-widest">Back</button>
      </div>
    );
  }

  if (subView === AdditionSubView.QUIZ) {
    const currentQ = questions[currentIndex];
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col p-6 animate-in slide-in-from-right duration-300">
        <header className="grid grid-cols-3 items-center mb-8 max-w-lg mx-auto w-full">
          <div className="flex justify-start">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl"><span className="font-black text-slate-900 dark:text-white text-xl tabular-nums min-w-[3ch] text-center">{timeLeft}s</span></div>
          </div>
          <div className="text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">Q {currentIndex + 1}/100</div>
          <div className="flex justify-end items-center gap-2 font-black text-emerald-500 text-xl"><Check size={20} />{score}</div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center gap-8 text-7xl font-black text-slate-900 dark:text-white mb-4"><span>{currentQ?.num1}</span><span className="text-indigo-500">+</span><span>{currentQ?.num2}</span></div>
          <div className="w-full max-w-xs h-24 bg-slate-50 dark:bg-slate-900/50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800"><span className="text-6xl font-black text-slate-900 dark:text-white tracking-widest tabular-nums">{userInput || '___'}</span></div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3 mb-6 max-w-xs mx-auto w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <button key={num} onClick={() => handleKeyClick(num.toString())} className={`${num === 0 ? 'col-start-2' : ''} h-16 bg-slate-50 dark:bg-slate-900 text-2xl font-black text-slate-900 dark:text-white rounded-2xl active:bg-slate-200 shadow-sm transition-transform active:scale-95`}>{num}</button>
          ))}
        </div>
      </div>
    );
  }

  if (subView === AdditionSubView.RESULTS) {
    const totalAttempted = finalScore + finalWrong;
    const skippedCount = 100 - totalAttempted;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${finalSessionEarnings >= 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}><IndianRupee size={64} /></div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Session Earnings</h2>
        <div className={`text-6xl font-black mb-12 tabular-nums transition-colors duration-500 ${finalSessionEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>₹{finalSessionEarnings}</div>
        <div className="grid grid-cols-3 gap-4 mb-6 w-full max-sm:px-4 max-w-sm mx-auto">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center"><Check size={20} className="mx-auto mb-1 text-emerald-500" /><p className="text-2xl font-black text-slate-900 dark:text-white">+{finalScore}</p></div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center"><XCircle size={20} className="mx-auto mb-1 text-rose-500" /><p className="text-2xl font-black text-rose-500">-{finalWrong}</p></div>
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center"><MinusCircle size={20} className="mx-auto mb-1 text-slate-400" /><p className="text-2xl font-black text-slate-400">{skippedCount}</p></div>
        </div>
        <button onClick={() => setSubView(AdditionSubView.REVIEW)} className="w-full max-sm:px-4 max-w-sm mb-3 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-lg text-slate-900 dark:text-white shadow-md active:scale-95 transition-all mx-auto block">VIEW ANSWERS</button>
        <button onClick={() => setSubView(AdditionSubView.HUB)} className="w-full max-w-sm h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg tracking-widest uppercase shadow-xl active:scale-95 transition-all mx-auto block">EXIT</button>
      </div>
    );
  }

  if (subView === AdditionSubView.REVIEW) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-bottom duration-300">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={() => setSubView(AdditionSubView.RESULTS)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Session Review</h1>
        </header>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-12 max-w-2xl mx-auto w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[320px]">
              <colgroup>
                <col className="w-12" />
                <col className="w-1/3" />
                <col className="w-1/4" />
                <col className="w-1/4" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Ans</th>
                  <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Ans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sessionResults.length > 0 ? (
                  sessionResults.map((res, idx) => (
                    <tr 
                      key={idx} 
                      className={`transition-colors ${res.isCorrect 
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' 
                        : 'bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                      }`}
                    >
                      <td className="px-4 py-5 text-[11px] font-bold text-slate-400 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                          {res.num1} + {res.num2}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`text-sm font-black tabular-nums ${res.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {res.userAnswer}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {res.answer}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle size={32} className="text-slate-200 dark:text-slate-800" />
                        <p className="text-slate-400 text-xs font-medium italic">No entries in this session.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (subView === AdditionSubView.LOCAL_DASHBOARD) {
    const isAyaanLeading = ayaanTotal >= riyaanTotal;
    const leader = isAyaanLeading ? { name: 'Ayaan', total: ayaanTotal, color: 'indigo', icon: User } : { name: 'Riyaan', total: riyaanTotal, color: 'rose', icon: Users };
    const runner = isAyaanLeading ? { name: 'Riyaan', total: riyaanTotal, color: 'rose', icon: Users } : { name: 'Ayaan', total: ayaanTotal, color: 'indigo', icon: User };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300 overflow-x-hidden">
        <div className="max-w-2xl mx-auto w-full">
          <header className="flex items-center gap-4 mb-8">
            <button onClick={() => setSubView(AdditionSubView.HUB)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"><ArrowLeft size={24} /></button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Player Earnings</h1>
          </header>
          
          <div className="flex flex-col items-center w-full">
            <div className="relative flex items-center justify-center w-full h-64 sm:h-80 mb-6">
              <div className="flex items-center justify-center">
                <div className={`relative z-20 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-white dark:bg-slate-900 border-[6px] border-${leader.color}-500 flex flex-col items-center justify-center shadow-2xl animate-in zoom-in duration-700 overflow-hidden`}>
                  <div className="absolute top-3 sm:top-4 bg-amber-400 text-white p-1.5 sm:p-2 rounded-full shadow-lg ring-4 ring-white dark:ring-slate-950"><Crown size={20} fill="currentColor" /></div>
                  <leader.icon size={32} className={`text-${leader.color}-500 mb-1 mt-4 sm:mt-6`} />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{leader.name}</h3>
                  <div className="flex items-center justify-center gap-0.5 w-full px-3">
                    <IndianRupee size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                      {leader.total.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className={`relative z-10 -ml-10 sm:-ml-12 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-white dark:bg-slate-900 border-2 border-${runner.color}-300 flex flex-col items-center justify-center shadow-xl animate-in zoom-in duration-1000 delay-300 overflow-hidden`}>
                  <runner.icon size={20} className={`text-${runner.color}-400 mb-1`} />
                  <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{runner.name}</h3>
                  <div className="flex items-center justify-center gap-0.5 w-full px-3">
                    <IndianRupee size={10} className="text-slate-400 flex-shrink-0" />
                    <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                      {runner.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full mt-4 mb-24 px-1">
              <button 
                onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
                className="w-full h-14 flex items-center justify-between gap-2 mb-4 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <History size={18} className="text-indigo-500" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Daily Summary</h2>
                </div>
                <div className="w-6 h-6 flex items-center justify-center">
                  {isHistoryCollapsed ? <ChevronRight size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </button>
              
              {!isHistoryCollapsed && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300 w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                      <thead>
                        <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                          <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                          <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ayaan</th>
                          <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Riyaan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {groupedHistory.length > 0 ? (
                          groupedHistory.map((record) => (
                            <tr key={record.dateKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-5 whitespace-nowrap">
                                <span className="text-[11px] text-slate-900 dark:text-slate-200 font-bold tabular-nums">{record.displayDate}</span>
                              </td>
                              <td className="px-5 py-5 text-center">
                                {record.ayaanEarnings !== null ? (
                                  <div className="flex flex-col items-center">
                                    <span className={`text-sm font-black tabular-nums ${record.ayaanEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      {record.ayaanEarnings >= 0 ? '+' : ''}{record.ayaanEarnings.toLocaleString()}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium tabular-nums whitespace-nowrap">{record.ayaanTime}</span>
                                  </div>
                                ) : <span className="text-slate-200 dark:text-slate-800">—</span>}
                              </td>
                              <td className="px-5 py-5 text-center">
                                {record.riyaanEarnings !== null ? (
                                  <div className="flex flex-col items-center">
                                    <span className={`text-sm font-black tabular-nums ${record.riyaanEarnings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      {record.riyaanEarnings >= 0 ? '+' : ''}{record.riyaanEarnings.toLocaleString()}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium tabular-nums whitespace-nowrap">{record.riyaanTime}</span>
                                  </div>
                                ) : <span className="text-slate-200 dark:text-slate-800">—</span>}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-5 py-16 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <History size={32} className="text-slate-200 dark:text-slate-800" />
                                <p className="text-slate-400 text-xs font-medium italic">No entries in history.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
