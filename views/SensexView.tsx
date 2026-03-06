import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase, handleSupabaseError } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { ArrowLeft } from 'lucide-react';

// Modular Sensex Components
import { SensexHub } from '../src/components/sensex/SensexHub';
import { SensexPinEntry } from '../src/components/sensex/SensexPinEntry';
import { SensexPlayerSelect } from '../src/components/sensex/SensexPlayerSelect';
import { SensexUpDownPicker } from '../src/components/sensex/SensexUpDownPicker';
import { SensexResults } from '../src/components/sensex/SensexResults';
import { SensexLeaderboard } from '../src/components/sensex/SensexLeaderboard';
import { SensexHistory } from '../src/components/sensex/SensexHistory';

enum SensexSubView {
  HUB = 'hub',
  PIN_ENTRY = 'pin_entry',
  PLAYER_SELECT = 'player_select',
  PICK = 'pick',
  RESULTS = 'results',
  DASHBOARD = 'dashboard',
  HISTORY = 'history'
}

// Helper to get local YYYY-MM-DD regardless of UTC offset
const getLocalDateString = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const SensexView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useGameStore((state) => state.settings);
  const profiles = useGameStore((state) => state.profiles);

  const [subView, setSubView] = useState<SensexSubView>(SensexSubView.HUB);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sensexHistory, setSensexHistory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPrediction, setUserPrediction] = useState<'UP' | 'DOWN' | null>(null);

  const dateOverride = settings.dateOverride;

  const getEffectiveDate = useCallback(() => {
    const now = new Date();
    if (dateOverride) {
      const d = new Date(dateOverride);
      if (isNaN(d.getTime())) return now;
      if (!dateOverride.includes('T')) {
        const [y, m, day] = dateOverride.split('-').map(Number);
        const localDate = new Date();
        localDate.setFullYear(y, m - 1, day);
        localDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        return localDate;
      }
      return d;
    }
    return now;
  }, [dateOverride]);

  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  const isMarketOpenDay = useCallback(() => {
    const d = getEffectiveDate();
    return !isWeekend(d) && !isMarketHoliday(getLocalDateString(d));
  }, [getEffectiveDate]);

  const isBeforePickDeadline = useCallback(() => getEffectiveDate().getHours() < 9 && isMarketOpenDay(), [getEffectiveDate, isMarketOpenDay]);

  const isAfterMarketClose = useCallback(() => {
    const d = getEffectiveDate();
    return isMarketOpenDay() && (d.getHours() > 15 || (d.getHours() === 15 && d.getMinutes() >= 30));
  }, [getEffectiveDate, isMarketOpenDay]);

  // FIX: Compare against the local date string to support dateOverride testing
  const hasPlayedToday = useCallback((player: string | null) => {
    if (!player) return false;
    const todayStr = getLocalDateString(getEffectiveDate());
    if (sensexHistory.some(s => s.player === player && s.date === todayStr)) return true;
    // Check local storage for crash protection
    return localStorage.getItem(`sensex_attempt_${player}_${todayStr}`) === 'started';
  }, [sensexHistory, getEffectiveDate]);

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('sensex_logs')
        .select('*')
        .order('date', { ascending: false });

      if (error) return;
      if (data && isMounted) setSensexHistory(data);
    };

    fetchLogs();
    const channel = supabase
      .channel('sensex_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sensex_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const ayaanTotal = useMemo(() =>
    sensexHistory.filter(s => s.player === 'Ayaan' && s.is_settled).reduce((t, s) => t + (Number(s.earnings) || 0), 0)
    , [sensexHistory]);

  const riyaanTotal = useMemo(() =>
    sensexHistory.filter(s => s.player === 'Riyaan' && s.is_settled).reduce((t, s) => t + (Number(s.earnings) || 0), 0)
    , [sensexHistory]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, any> = {};
    sensexHistory.forEach(s => {
      const d = new Date(s.date).toDateString();
      if (!groups[d]) groups[d] = { date: d, ayaan: null, riyaan: null };
      s.player === 'Ayaan' ? groups[d].ayaan = s : groups[d].riyaan = s;
    });
    return Object.values(groups).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sensexHistory]);

  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    setSubView(settings.pinEntryEnabled ? SensexSubView.PIN_ENTRY : SensexSubView.PLAYER_SELECT);
  };

  const handlePickSubmit = async (prediction: 'UP' | 'DOWN') => {
    if (isSubmitting || !selectedUser || !isBeforePickDeadline()) return;
    setIsSubmitting(true);
    setUserPrediction(prediction);

    const todayStr = getLocalDateString(getEffectiveDate());

    // Set lock immediately to avoid rapid double-clicks
    localStorage.setItem(`sensex_attempt_${selectedUser}_${todayStr}`, 'started');

    const userProfile = profiles.find(p => p.player_name === selectedUser);
    const playerId = userProfile ? userProfile.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);

    try {
      const { error } = await supabase.from('sensex_logs').insert([{
        date: todayStr,
        player_id: playerId,
        player: selectedUser,
        prediction: prediction
      }]);
      if (error) throw error;

      // Clear on success as DB contains truth
      localStorage.removeItem(`sensex_attempt_${selectedUser}_${todayStr}`);
      setSubView(SensexSubView.RESULTS);
    } catch (err) {
      alert('Failed to save prediction.');
      // Remove lock on failure so they can try again
      localStorage.removeItem(`sensex_attempt_${selectedUser}_${todayStr}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUserLocked = (u: string) => {
    const p = profiles.find(prof => prof.player_name === u);
    return p ? p.is_locked : false;
  };

  switch (subView) {
    case SensexSubView.HUB:
      return (
        <SensexHub
          onBack={onBack}
          onNavigate={(v: any) => setSubView(v)}
          onUserSelect={handleUserSelect}
          isMarketOpenDay={isMarketOpenDay()}
          isBeforePickDeadline={isBeforePickDeadline()}
          isAfterMarketClose={isAfterMarketClose()}
          effectiveDate={getEffectiveDate()}
          hasPlayedToday={hasPlayedToday}
          isUserLocked={isUserLocked}
        />
      );
    case SensexSubView.PIN_ENTRY:
      return <SensexPinEntry selectedUser={selectedUser} onSuccess={() => setSubView(SensexSubView.PLAYER_SELECT)} onBack={() => setSubView(SensexSubView.HUB)} />;
    case SensexSubView.PLAYER_SELECT:
      return <SensexPlayerSelect selectedUser={selectedUser} isPlayed={hasPlayedToday(selectedUser)} isPickWindow={isBeforePickDeadline()} isMarketWorking={isMarketOpenDay()} onNavigate={(v: any) => setSubView(v === 'RESULTS' ? SensexSubView.RESULTS : SensexSubView.PICK)} onBack={() => setSubView(SensexSubView.HUB)} />;
    case SensexSubView.PICK:
      return <SensexUpDownPicker isSubmitting={isSubmitting} onPick={handlePickSubmit} onBack={() => setSubView(SensexSubView.PLAYER_SELECT)} />;
    case SensexSubView.RESULTS: {
      // FIX: Recover prediction from history if local state is lost
      const todayStr = getLocalDateString(getEffectiveDate());
      const record = sensexHistory.find(s => s.player === selectedUser && s.date === todayStr);
      return (
        <SensexResults
          prediction={userPrediction || record?.prediction || 'UP'}
          isSettled={record?.is_settled}          // Add this line
          earnings={record?.earnings}             // Add this line
          actualReturn={record?.actual_return}    // Add this line
          closingValue={record?.closing_value} // Pass the new data here
          onContinue={() => { setUserPrediction(null); setSubView(SensexSubView.HUB); }}
        />
      );
    }
    case SensexSubView.DASHBOARD:
      return <SensexLeaderboard ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setSubView(SensexSubView.HUB)} />;
    case SensexSubView.HISTORY:
      return (
        <div className="p-4 max-w-md mx-auto"> {/* Changed from 4xl to md for a tighter fit */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSubView(SensexSubView.HUB)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Daily Performance</h1>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-lg border border-slate-100 dark:border-slate-800">
            <SensexHistory groupedHistory={groupedHistory} />
          </div>
        </div>
      );
      return (
        <div className="p-4 max-w-4xl mx-auto"> {/* Wider container for the table */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSubView(SensexSubView.HUB)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daily Performance</h1>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            {/* Pass groupedHistory here */}
            <SensexHistory groupedHistory={groupedHistory} />
          </div>
        </div>
      );
      return (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSubView(SensexSubView.HUB)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Performance Log</h1>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            {/* Make sure this says 'history' and not 'groupedHistory' */}
            <SensexHistory history={sensexHistory || []} />
          </div>
        </div>
      );
      return (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSubView(SensexSubView.HUB)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Performance Log</h1>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
            {/* FIX: Change prop name from groupedHistory to history */}
            <SensexHistory history={sensexHistory || []} />
          </div>
        </div>
      );
    default:
      return null;
  }
};