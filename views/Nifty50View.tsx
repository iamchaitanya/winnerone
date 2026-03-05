import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { isMarketHoliday, getHolidayDetail } from '../src/lib/holidayManager';
import { fetchAllLiveReturns } from '../src/lib/stockFetcher';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';
import { useGameStore } from '../src/store/useGameStore';
import { getISTDateKey } from '../src/lib/dateUtils';

// Import modular components
import { NiftyHub } from '../src/components/nifty/NiftyHub';
import { NiftyPinEntry } from '../src/components/nifty/NiftyPinEntry';
import { NiftyPlayerSelect } from '../src/components/nifty/NiftyPlayerSelect';
import { NiftyStockPicker } from '../src/components/nifty/NiftyStockPicker';
import { NiftyResults } from '../src/components/nifty/NiftyResults';
import { NiftyLeaderboard } from '../src/components/nifty/NiftyLeaderboard';
import { NiftyHistory } from '../src/components/nifty/NiftyHistory';

interface Nifty50ViewProps {
  onBack: () => void;
}

enum NiftySubView {
  HUB = 'hub',
  PIN_ENTRY = 'pin_entry',
  PLAYER_SELECT = 'player_select',
  STOCK_PICK = 'stock_pick',
  RESULTS = 'results',
  DASHBOARD = 'dashboard',
  HISTORY = 'history'
}

interface NiftySession {
  id: string;
  player_id?: string;
  player: string;
  symbol: string;
  stockReturn: number;
  earnings: number;
  timestamp: number;
  isSettled?: boolean;
}

export const Nifty50View: React.FC<Nifty50ViewProps> = ({ onBack }) => {
  const settings = useGameStore((state) => state.settings);
  const profiles = useGameStore((state) => state.profiles);

  const [subView, setSubView] = useState<NiftySubView>(NiftySubView.HUB);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveDataError, setLiveDataError] = useState(false);
  const [liveStockData, setLiveStockData] = useState<Record<string, { price: number; changesPercentage: number }>>({});

  const isPinEntryEnabled = settings.pinEntryEnabled;
  const dateOverride = settings.dateOverride;
  const [niftyHistory, setNiftyHistory] = useState<NiftySession[]>([]);

  // Score Calculations
  const ayaanNiftyTotal = useMemo(() =>
    niftyHistory.filter(s => s.player === 'Ayaan' && s.isSettled).reduce((t, s) => t + (s.earnings || 0), 0)
    , [niftyHistory]);

  const riyaanNiftyTotal = useMemo(() =>
    niftyHistory.filter(s => s.player === 'Riyaan' && s.isSettled).reduce((t, s) => t + (s.earnings || 0), 0)
    , [niftyHistory]);

  // Market Timing Helpers
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
  const isPublicHoliday = (date: Date) => isMarketHoliday(getISTDateKey(date));
  const isMarketOpenDay = useCallback(() => {
    const d = getEffectiveDate();
    return !isWeekend(d) && !isPublicHoliday(d);
  }, [getEffectiveDate]);

  const isBeforePickDeadline = useCallback(() => getEffectiveDate().getHours() < 9 && isMarketOpenDay(), [getEffectiveDate, isMarketOpenDay]);

  const isAfterMarketClose = useCallback(() => {
    if (!isMarketOpenDay()) return false;
    const d = getEffectiveDate();
    return d.getHours() > 15 || (d.getHours() === 15 && d.getMinutes() >= 30);
  }, [getEffectiveDate, isMarketOpenDay]);

  const hasPlayedToday = useCallback((player: string | null) => {
    if (!player) return false;
    const today = getISTDateKey(getEffectiveDate());
    if (niftyHistory.some(s => s.player === player && getISTDateKey(s.timestamp) === today)) return true;
    // Check local storage for crash protection
    return localStorage.getItem(`nifty_attempt_${player}_${today}`) === 'started';
  }, [niftyHistory, getEffectiveDate]);

  const getTodaySession = useCallback((player: string | null) => {
    const today = getISTDateKey(getEffectiveDate());
    return niftyHistory.find(s => s.player === player && getISTDateKey(s.timestamp) === today) || null;
  }, [niftyHistory, getEffectiveDate]);

  const getSiblingTodaySession = useCallback((player: string | null) => {
    const sibling = player === 'Ayaan' ? 'Riyaan' : 'Ayaan';
    const today = getISTDateKey(getEffectiveDate());
    return niftyHistory.find(s => s.player === sibling && getISTDateKey(s.timestamp) === today) || null;
  }, [niftyHistory, getEffectiveDate]);

  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    setSubView(isPinEntryEnabled ? NiftySubView.PIN_ENTRY : NiftySubView.PLAYER_SELECT);
  };

  const handleStockPick = async (symbol: string) => {
    if (isSubmitting || !isBeforePickDeadline() || !selectedUser) return;
    setIsSubmitting(true);
    const todayStr = getISTDateKey(getEffectiveDate());

    // Set lock immediately to avoid rapid double-clicks
    localStorage.setItem(`nifty_attempt_${selectedUser}_${todayStr}`, 'started');

    const userProfile = profiles.find(p => p.player_name === selectedUser);
    const playerId = userProfile ? userProfile.id : (selectedUser === 'Ayaan' ? PLAYER_IDS.Ayaan : PLAYER_IDS.Riyaan);

    try {
      const { error } = await supabase.from('nifty_logs').insert([{
        date: todayStr,
        player_id: playerId,
        player: selectedUser,
        stock_symbol: symbol
      }]);
      if (error) throw error;

      // Clear on success as DB contains truth
      localStorage.removeItem(`nifty_attempt_${selectedUser}_${todayStr}`);
      setSubView(NiftySubView.RESULTS);
    } catch (err) {
      alert('Failed to save pick.');
      // Remove lock on failure so they can try again
      localStorage.removeItem(`nifty_attempt_${selectedUser}_${todayStr}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // REPLACED: Single useEffect with Realtime Subscription
  useEffect(() => {
    let isMounted = true;

    const sync = async () => {
      const { data } = await supabase
        .from('nifty_logs')
        .select('*')
        .order('date', { ascending: false });

      if (data && isMounted) {
        const synced = data.map(db => ({
          id: db.id,
          player_id: db.player_id,
          player: db.player,
          symbol: db.stock_symbol,
          stockReturn: db.stock_return || 0,
          earnings: db.earnings || 0,
          timestamp: new Date(db.created_at).getTime(),
          isSettled: db.stock_return !== null
        }));
        setNiftyHistory(synced);
      }
    };

    sync();

    // Realtime Channel
    const channel = supabase
      .channel('nifty_logs_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nifty_logs' }, () => {
        sync();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (subView === NiftySubView.STOCK_PICK) {
      fetchAllLiveReturns().then(setLiveStockData).catch(() => setLiveDataError(true));
    }
  }, [subView]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, any> = {};
    niftyHistory.forEach(s => {
      const d = new Date(s.timestamp).toDateString();
      if (!groups[d]) groups[d] = { date: d, ayaan: null, riyaan: null };
      s.player === 'Ayaan' ? groups[d].ayaan = s : groups[d].riyaan = s;
    });
    return Object.values(groups).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [niftyHistory]);

  const isUserLocked = (u: string) => {
    const p = profiles.find(prof => prof.player_name === u);
    return p ? p.is_locked : false;
  };

  switch (subView) {
    case NiftySubView.HUB:
      return (
        <NiftyHub
          onBack={onBack}
          onNavigate={(v: any) => setSubView(v)}
          onUserSelect={handleUserSelect}
          isMarketOpenDay={isMarketOpenDay()}
          isBeforePickDeadline={isBeforePickDeadline()}
          isAfterMarketClose={isAfterMarketClose()}
          dateOverride={dateOverride}
          effectiveDate={getEffectiveDate()}
          isWeekend={isWeekend}
          isPublicHoliday={isPublicHoliday}
          hasPlayedToday={hasPlayedToday}
          isUserLocked={isUserLocked}
        />
      );
    case NiftySubView.PIN_ENTRY:
      return <NiftyPinEntry selectedUser={selectedUser} onSuccess={() => setSubView(NiftySubView.PLAYER_SELECT)} onBack={() => setSubView(NiftySubView.HUB)} />;
    case NiftySubView.PLAYER_SELECT:
      return <NiftyPlayerSelect selectedUser={selectedUser} isPlayed={hasPlayedToday(selectedUser)} isPickWindow={isBeforePickDeadline()} isMarketWorking={isMarketOpenDay()} onNavigate={(v: any) => setSubView(NiftySubView[v as keyof typeof NiftySubView])} onBack={() => setSubView(NiftySubView.HUB)} />;
    case NiftySubView.STOCK_PICK:
      return <NiftyStockPicker liveStockData={liveStockData} liveDataError={liveDataError} isSubmitting={isSubmitting} siblingPick={getSiblingTodaySession(selectedUser)?.symbol} onPick={handleStockPick} onBack={() => setSubView(NiftySubView.PLAYER_SELECT)} />;
    case NiftySubView.RESULTS:
      return <NiftyResults selectedUser={selectedUser} mySession={getTodaySession(selectedUser)!} sibSession={getSiblingTodaySession(selectedUser)} isReady={isAfterMarketClose()} isSettling={isSettling} onContinue={() => setSubView(NiftySubView.HUB)} />;
    case NiftySubView.DASHBOARD:
      return <NiftyLeaderboard ayaanTotal={ayaanNiftyTotal} riyaanTotal={riyaanNiftyTotal} groupedHistory={groupedHistory} onBack={() => setSubView(NiftySubView.HUB)} />;
    case NiftySubView.HISTORY:
      return <NiftyHistory groupedHistory={groupedHistory} onBack={() => setSubView(NiftySubView.HUB)} />;
    default:
      return null;
  }
};