import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { isMarketHoliday } from '../src/lib/holidayManager';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';

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

export const SensexView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const settings = useGameStore((state) => state.settings);
  const profiles = useGameStore((state) => state.profiles);

  const [subView, setSubView] = useState<SensexSubView>(SensexSubView.HUB);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sensexHistory, setSensexHistory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPrediction, setUserPrediction] = useState<'UP' | 'DOWN' | null>(null);

  const dateOverride = settings.dateOverride;

  // Market Timing Logic (Cloned from Nifty standard for exact consistency)
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
    return !isWeekend(d) && !isMarketHoliday(d.toISOString().split('T')[0]);
  }, [getEffectiveDate]);

  const isBeforePickDeadline = useCallback(() => getEffectiveDate().getHours() < 9 && isMarketOpenDay(), [getEffectiveDate, isMarketOpenDay]);

  const isAfterMarketClose = useCallback(() => {
    const d = getEffectiveDate();
    return isMarketOpenDay() && (d.getHours() > 15 || (d.getHours() === 15 && d.getMinutes() >= 30));
  }, [getEffectiveDate, isMarketOpenDay]);

  const hasPlayedToday = useCallback((player: string | null) => {
    if (!player) return false;
    const today = getEffectiveDate().toDateString();
    return sensexHistory.some(s => s.player === player && new Date(s.created_at).toDateString() === today);
  }, [sensexHistory, getEffectiveDate]);

  // Realtime Data Sync
  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('sensex_logs')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching Sensex logs:', error);
        return;
      }
      
      if (data && isMounted) {
        setSensexHistory(data);
      }
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

  // Leaderboard Calculations
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

  // Handlers
  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    setSubView(settings.pinEntryEnabled ? SensexSubView.PIN_ENTRY : SensexSubView.PLAYER_SELECT);
  };

  const handlePickSubmit = async (prediction: 'UP' | 'DOWN') => {
    if (isSubmitting || !selectedUser || !isBeforePickDeadline()) return;
    setIsSubmitting(true);
    setUserPrediction(prediction);

    const todayStr = getEffectiveDate().toISOString().split('T')[0];
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
      setSubView(SensexSubView.RESULTS);
    } catch (err) {
      alert('Failed to save prediction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUserLocked = (u: string) => {
    const p = profiles.find(prof => prof.player_name === u);
    return p ? p.is_locked : false;
  };

  // Switch View Logic
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
    case SensexSubView.RESULTS:
      return <SensexResults prediction={userPrediction || 'UP'} onContinue={() => { setUserPrediction(null); setSubView(SensexSubView.HUB); }} />;
    case SensexSubView.DASHBOARD:
      return <SensexLeaderboard ayaanTotal={ayaanTotal} riyaanTotal={riyaanTotal} groupedHistory={groupedHistory} onBack={() => setSubView(SensexSubView.HUB)} />;
    case SensexSubView.HISTORY:
      return <SensexHistory groupedHistory={groupedHistory} onBack={() => setSubView(SensexSubView.HUB)} />;
    default:
      return null;
  }
};