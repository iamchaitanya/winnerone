import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Users, Trophy, Crown, RefreshCw } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { PLAYER_IDS } from '../src/lib/constants';

interface DashboardViewProps {
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  
  // State for Cloud Data (Addition Game)
  const [ayaanAddition, setAyaanAddition] = useState(0);
  const [riyaanAddition, setRiyaanAddition] = useState(0);

  
 // 1. Remove the old localStorage states and replace with these:
 const [ayaanNifty, setAyaanNifty] = useState(0);
 const [riyaanNifty, setRiyaanNifty] = useState(0);

  // FETCH DATA FROM CLOUD
  useEffect(() => {
    fetchScores();
  }, []);

 // 2. Update the fetchScores function:
 const fetchScores = async () => {
  setLoading(true);
  
  try {
    // Fetch Addition logs
    const { data: addData } = await supabase
      .from('addition_logs')
      .select('player_id, earnings');

    // Fetch Nifty 50 logs
    const { data: niftyData } = await supabase
      .from('nifty_logs')
      .select('player, earnings');

    let addAyaan = 0, addRiyaan = 0;
    let niftyAyaan = 0, niftyRiyaan = 0;

    // Sum Addition
    addData?.forEach((log: any) => {
      if (log.player_id === PLAYER_IDS.Ayaan) addAyaan += log.earnings;
      else if (log.player_id === PLAYER_IDS.Riyaan) addRiyaan += log.earnings;
    });

    // Sum Nifty
    niftyData?.forEach((log: any) => {
      // Use 'player' column based on our table structure
      if (log.player === 'Ayaan') niftyAyaan += log.earnings || 0;
      else if (log.player === 'Riyaan') niftyRiyaan += log.earnings || 0;
    });

    setAyaanAddition(addAyaan);
    setRiyaanAddition(addRiyaan);
    setAyaanNifty(niftyAyaan);
    setRiyaanNifty(niftyRiyaan);
  } catch (error) {
    console.error('Error fetching dashboard scores:', error);
  } finally {
    setLoading(false);
  }
};

  const ayaanTotal = ayaanAddition + ayaanNifty;
  const riyaanTotal = riyaanAddition + riyaanNifty;
  const grandTotal = Math.abs(ayaanTotal) + Math.abs(riyaanTotal);

  const isAyaanLeading = ayaanTotal >= riyaanTotal;
  const leader = isAyaanLeading ? { name: 'Ayaan', total: ayaanTotal, color: 'indigo' } : { name: 'Riyaan', total: riyaanTotal, color: 'rose' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300 pb-24 overflow-x-hidden">
      {/* Header */}
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
                Live Cloud Sync
              </p>
            </div>
          </div>
          <button onClick={fetchScores} disabled={loading} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Player Snapshot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Ayaan Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-indigo-500/10 group-hover:scale-110 transition-transform">
              <User size={80} />
            </div>
            
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ayaan's Portfolio</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className={`text-3xl font-black tabular-nums ${ayaanTotal < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                ₹{ayaanTotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Addition (Cloud)</p>
                <p className={`text-sm font-black ${ayaanAddition < 0 ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {loading ? '...' : `₹${ayaanAddition.toLocaleString()}`}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nifty 50 (Cloud)</p>
                <p className={`text-sm font-black ${ayaanNifty < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  ₹{ayaanNifty.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Riyaan Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-rose-500/10 group-hover:scale-110 transition-transform">
              <Users size={80} />
            </div>
            
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Riyaan's Portfolio</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className={`text-3xl font-black tabular-nums ${riyaanTotal < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                ₹{riyaanTotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Addition (Cloud)</p>
                <p className={`text-sm font-black ${riyaanAddition < 0 ? 'text-rose-500' : 'text-rose-600 dark:text-rose-400'}`}>
                  {loading ? '...' : `₹${riyaanAddition.toLocaleString()}`}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Nifty 50 (Cloud)</p>
                <p className={`text-sm font-black ${riyaanNifty < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  ₹{riyaanNifty.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Section (Season Leader) */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 scale-150">
            <Trophy size={100} />
          </div>
          <div className="relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Season Leader</h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Crown size={32} />
              </div>
              <div>
                <p className="text-4xl font-black tracking-tighter uppercase">{leader.name}</p>
                <p className={`text-sm font-bold opacity-80 italic ${leader.total < 0 ? 'text-rose-300' : ''}`}>
                  Total Achievement: ₹{leader.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-6">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000" 
                style={{ width: `${Math.max(5, (Math.abs(leader.total) / (grandTotal || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};