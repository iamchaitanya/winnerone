import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, User, Users, Trophy, Crown, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '../src/lib/supabase';

interface PlayerScoreSummary {
  player_id: string;
  player_name: string;
  addition_total: number;
  nifty_total: number;
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

  const fetchScores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_scores_summary')
        .select('*')
        .returns<PlayerScoreSummary[]>();

      if (error) throw error;

      if (data) {
        const ayaan = data.find(p => p.player_name === 'Ayaan');
        const riyaan = data.find(p => p.player_name === 'Riyaan');

        if (ayaan) {
          setAyaanAddition(ayaan.addition_total);
          setAyaanNifty(ayaan.nifty_total);
        }
        if (riyaan) {
          setRiyaanAddition(riyaan.addition_total);
          setRiyaanNifty(riyaan.nifty_total);
        }
      }
    } catch (error) {
      console.error('Error fetching optimized scores:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const ayaanTotal = ayaanAddition + ayaanNifty;
  const riyaanTotal = riyaanAddition + riyaanNifty;
  
  // Leadership and Bonus Math
  const isAyaanLeading = ayaanTotal >= riyaanTotal;
  const leaderBaseTotal = isAyaanLeading ? ayaanTotal : riyaanTotal;
  const leaderName = isAyaanLeading ? 'Ayaan' : 'Riyaan';
  
  // Apply 30% bonus only if they actually have a positive score
  const leaderBonus = leaderBaseTotal > 0 ? leaderBaseTotal * 0.3 : 0;
  const leaderTotalWithBonus = leaderBaseTotal + leaderBonus;
  
  // Recalculate grand total for the progress bar to include the newly minted bonus money
  const adjustedGrandTotal = Math.abs(ayaanTotal) + Math.abs(riyaanTotal) + leaderBonus;

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
        
{/* Season Leader Section */}
<div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
  
  {/* Half-Visible Circular Badge */}
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
    
    <p className="text-4xl font-black tracking-tighter uppercase mb-4">
      {leaderName}
    </p>
    
    {/* Centered Large Amount */}
    <div className="relative">
      <p className="text-6xl font-black tabular-nums tracking-tight text-amber-300 drop-shadow-2xl">
        {formatCurrency(leaderTotalWithBonus)}
      </p>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-amber-400/30 rounded-full blur-sm"></div>
    </div>
  </div>
</div>

        {/* Individual Cards Grid */}
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
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nifty 50</p>
                <p className={`text-sm font-black ${ayaanNifty < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatCurrency(ayaanNifty)}
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
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nifty 50</p>
                <p className={`text-sm font-black ${riyaanNifty < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatCurrency(riyaanNifty)}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};