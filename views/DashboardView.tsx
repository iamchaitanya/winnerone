import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, User, Users, Trophy, Crown, RefreshCw } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface PlayerScoreSummary {
  player_id: string;
  player_name: string;
  addition_total: number;
  nifty_total: number;
  sensex_total: number;
  subtraction_total: number;
  multiplication_total: number;
  multiplication25_total: number;
  grand_total: number;
}

interface DashboardViewProps {
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);

  const [ayaanAddition, setAyaanAddition] = useState(0);
  const [riyaanAddition, setRiyaanAddition] = useState(0);
  const [ayaanNifty, setAyaanNifty] = useState(0);
  const [riyaanNifty, setRiyaanNifty] = useState(0);
  const [ayaanSensex, setAyaanSensex] = useState(0);
  const [riyaanSensex, setRiyaanSensex] = useState(0);
  const [ayaanSubtraction, setAyaanSubtraction] = useState(0);
  const [riyaanSubtraction, setRiyaanSubtraction] = useState(0);
  const [ayaanMultiplication, setAyaanMultiplication] = useState(0);
  const [riyaanMultiplication, setRiyaanMultiplication] = useState(0);
  const [ayaanMultiplication25, setAyaanMultiplication25] = useState(0);
  const [riyaanMultiplication25, setRiyaanMultiplication25] = useState(0);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_scores_summary')
        .select('*')
        .returns<PlayerScoreSummary[]>();

      if (error) throw error;

      if (data) {
        // Find players using IDs for better accuracy
        const ayaan = data.find(p => p.player_id === '1d443035-34de-488f-a546-81116f0cd9a4');
        const riyaan = data.find(p => p.player_id === 'e747e862-c03f-4c3a-8631-0236c172e36c');

        if (ayaan) {
          setAyaanAddition(ayaan.addition_total);
          setAyaanNifty(ayaan.nifty_total);
          setAyaanSensex(ayaan.sensex_total || 0);
          setAyaanSubtraction(ayaan.subtraction_total || 0);
          setAyaanMultiplication(ayaan.multiplication_total || 0);
          setAyaanMultiplication25(ayaan.multiplication25_total || 0);
        }
        if (riyaan) {
          setRiyaanAddition(riyaan.addition_total);
          setRiyaanNifty(riyaan.nifty_total);
          setRiyaanSensex(riyaan.sensex_total || 0);
          setRiyaanSubtraction(riyaan.subtraction_total || 0);
          setRiyaanMultiplication(riyaan.multiplication_total || 0);
          setRiyaanMultiplication25(riyaan.multiplication25_total || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();

    // 🔴 Live sync — re-fetch whenever any game log changes
    const channel = supabase
      .channel('dashboard_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'addition_logs' }, fetchScores)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtraction_logs' }, fetchScores)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'multiplication_logs' }, fetchScores)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'multiplication25_logs' }, fetchScores)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nifty_logs' }, fetchScores)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sensex_logs' }, fetchScores)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchScores]);

  // Update total calculations to include Sensex
  const ayaanTotal = ayaanAddition + ayaanNifty + ayaanSensex + ayaanSubtraction + ayaanMultiplication + ayaanMultiplication25;
  const riyaanTotal = riyaanAddition + riyaanNifty + riyaanSensex + riyaanSubtraction + riyaanMultiplication + riyaanMultiplication25;

  const isAyaanLeading = ayaanTotal >= riyaanTotal;
  const leaderBaseTotal = isAyaanLeading ? ayaanTotal : riyaanTotal;
  const leaderName = isAyaanLeading ? 'Ayaan' : 'Riyaan';

  const leaderBonus = leaderBaseTotal > 0 ? leaderBaseTotal * 0.3 : 0;
  const leaderTotalWithBonus = leaderBaseTotal + leaderBonus;

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300 pb-24 overflow-x-hidden">
      <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Master Dashboard</h1>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Optimized Cloud Sync
              </p>
            </div>
          </div>
          <button onClick={fetchScores} disabled={loading} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Season Leader Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          {leaderBonus > 0 && (
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-400 text-indigo-950 rounded-full flex items-center justify-center shadow-2xl z-20 border-[12px] border-white/10">
              <div className="mr-4 mt-4">
                <span className="text-3xl font-black leading-none tracking-tighter">1.3x</span>
              </div>
            </div>
          )}
          <div className="absolute top-0 left-0 p-8 opacity-5 scale-125">
            <Trophy size={100} />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 mb-4 shadow-inner">
              <Crown size={32} className="text-amber-300" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-60">Season Leader</h4>
            <p className="text-4xl font-black tracking-tighter uppercase mb-4">{leaderName}</p>
            <div className="relative">
              <p className="text-6xl font-black tabular-nums tracking-tight text-amber-300 drop-shadow-2xl">
                {formatCurrency(leaderTotalWithBonus)}
              </p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-amber-400/30 rounded-full blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Portfolio Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ayaan Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-indigo-500/10 group-hover:scale-110 transition-transform">
              <User size={80} />
            </div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ayaan's Base Portfolio</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className={`text-3xl font-black tabular-nums ${ayaanTotal < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                {formatCurrency(ayaanTotal)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Addition</p>
                <p className={`text-sm font-black ${ayaanAddition < 0 ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {loading ? '...' : formatCurrency(ayaanAddition)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Subtraction</p>
                <p className={`text-sm font-black ${ayaanSubtraction < 0 ? 'text-rose-500' : 'text-orange-600 dark:text-orange-400'}`}>
                  {loading ? '...' : formatCurrency(ayaanSubtraction)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">12×12</p>
                <p className={`text-sm font-black ${ayaanMultiplication < 0 ? 'text-rose-500' : 'text-violet-600 dark:text-violet-400'}`}>
                  {loading ? '...' : formatCurrency(ayaanMultiplication)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">25×25</p>
                <p className={`text-sm font-black ${ayaanMultiplication25 < 0 ? 'text-rose-500' : 'text-teal-600 dark:text-teal-400'}`}>
                  {loading ? '...' : formatCurrency(ayaanMultiplication25)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nifty 50</p>
                <p className={`text-sm font-black ${ayaanNifty < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatCurrency(ayaanNifty)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Sensex</p>
                <p className={`text-sm font-black ${ayaanSensex < 0 ? 'text-rose-500' : 'text-amber-600 dark:text-amber-400'}`}>
                  {formatCurrency(ayaanSensex)}
                </p>
              </div>
            </div>
          </div>

          {/* Riyaan Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-rose-500/10 group-hover:scale-110 transition-transform">
              <Users size={80} />
            </div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Riyaan's Base Portfolio</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className={`text-3xl font-black tabular-nums ${riyaanTotal < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                {formatCurrency(riyaanTotal)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Addition</p>
                <p className={`text-sm font-black ${riyaanAddition < 0 ? 'text-rose-500' : 'text-rose-600 dark:text-rose-400'}`}>
                  {loading ? '...' : formatCurrency(riyaanAddition)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Subtraction</p>
                <p className={`text-sm font-black ${riyaanSubtraction < 0 ? 'text-rose-500' : 'text-orange-600 dark:text-orange-400'}`}>
                  {loading ? '...' : formatCurrency(riyaanSubtraction)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">12×12</p>
                <p className={`text-sm font-black ${riyaanMultiplication < 0 ? 'text-rose-500' : 'text-violet-600 dark:text-violet-400'}`}>
                  {loading ? '...' : formatCurrency(riyaanMultiplication)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">25×25</p>
                <p className={`text-sm font-black ${riyaanMultiplication25 < 0 ? 'text-rose-500' : 'text-teal-600 dark:text-teal-400'}`}>
                  {loading ? '...' : formatCurrency(riyaanMultiplication25)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nifty 50</p>
                <p className={`text-sm font-black ${riyaanNifty < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatCurrency(riyaanNifty)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Sensex</p>
                <p className={`text-sm font-black ${riyaanSensex < 0 ? 'text-rose-500' : 'text-amber-600 dark:text-amber-400'}`}>
                  {formatCurrency(riyaanSensex)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};