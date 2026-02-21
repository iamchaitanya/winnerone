import React from 'react';
import { Clock, TrendingUp, TrendingDown, TrendingUpDown, Medal, Trophy } from 'lucide-react';

interface NiftySession {
  player: string;
  symbol: string;
  stockReturn: number;
  earnings: number;
  isSettled?: boolean;
}

interface NiftyResultsProps {
  selectedUser: string | null;
  mySession: NiftySession;
  sibSession: NiftySession | null;
  isReady: boolean;
  isSettling: boolean;
  onContinue: () => void;
}

export const NiftyResults: React.FC<NiftyResultsProps> = ({
  selectedUser,
  mySession,
  sibSession,
  isReady,
  isSettling,
  onContinue
}) => {
  if (isSettling || (isReady && !mySession.isSettled)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Fetching NSE Data</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Connecting to Market via FMP...</p>
      </div>
    );
  }

  const hasWinner = isReady && sibSession && mySession.stockReturn !== sibSession.stockReturn;
  const winnerPlayer = hasWinner 
    ? (mySession.stockReturn > sibSession.stockReturn ? mySession.player : sibSession.player)
    : null;
  
  const dailyTotalEarnings = isReady ? (mySession.earnings + (sibSession?.earnings || 0)) : 0;
  const isDailyTotalPositive = dailyTotalEarnings > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500 text-center">
      {!isReady ? (
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 animate-pulse">
          <Clock size={48} />
        </div>
      ) : (
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${mySession.earnings > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : mySession.earnings < 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          {mySession.earnings > 0 ? <TrendingUp size={48} /> : mySession.earnings < 0 ? <TrendingDown size={48} /> : <TrendingUpDown size={48} />}
        </div>
      )}

      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
        {isReady ? "Market Result" : "Market Live"}
      </h2>
      
      {isReady ? (
        <div className={`text-6xl font-black mb-8 tabular-nums ${mySession.earnings > 0 ? 'text-emerald-500' : mySession.earnings < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
          {mySession.earnings > 0 ? '+' : ''}₹{mySession.earnings.toLocaleString()}
        </div>
      ) : (
        <div className="px-8 py-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trading Hours</p>
          <p className="text-lg font-black text-blue-500 uppercase tracking-tight">Closes at 15:30</p>
        </div>
      )}

      {isReady && (
        <div className={`mb-8 px-6 py-2 rounded-full border flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${isDailyTotalPositive ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-800' : dailyTotalEarnings < 0 ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          Daily Group Status: <span className="tabular-nums">₹{dailyTotalEarnings.toLocaleString()}</span>
          {isDailyTotalPositive ? <TrendingUp size={12} /> : dailyTotalEarnings < 0 ? <TrendingDown size={12} /> : null}
        </div>
      )}

      <div className="w-full max-w-sm space-y-4 mb-12">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800">
          <div className={`p-6 flex items-center justify-between transition-colors relative ${winnerPlayer === mySession.player ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''}`}>
            {winnerPlayer === mySession.player && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                <Medal size={8} fill="currentColor" /> Day's Top Pick
              </div>
            )}
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                Your Pick ({mySession.player}) 
                {winnerPlayer === mySession.player && <span className="text-amber-500"><Trophy size={10} fill="currentColor" /></span>}
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{mySession.symbol}</p>
            </div>
            <div className="text-right">
              {isReady ? (
                <div className={`flex flex-col items-end`}>
                  <div className={`flex items-center gap-1 font-black ${mySession.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {mySession.stockReturn >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {mySession.stockReturn.toFixed(2)}%
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">₹{mySession.earnings}</p>
                </div>
              ) : (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
              )}
            </div>
          </div>

          {sibSession && (
            <div className={`p-6 flex items-center justify-between transition-colors relative ${winnerPlayer === sibSession.player ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : 'bg-slate-50/50 dark:bg-slate-800/20'}`}>
              {winnerPlayer === sibSession.player && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                  <Medal size={8} fill="currentColor" /> Day's Top Pick
                </div>
              )}
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                  Sibling's Pick ({sibSession.player})
                  {winnerPlayer === sibSession.player && <span className="text-amber-500"><Trophy size={10} fill="currentColor" /></span>}
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{sibSession.symbol}</p>
              </div>
              <div className="text-right">
                {isReady ? (
                  <div className={`flex flex-col items-end`}>
                    <div className={`flex items-center gap-1 font-black ${sibSession.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {sibSession.stockReturn >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {sibSession.stockReturn.toFixed(2)}%
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">₹{sibSession.earnings}</p>
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <button onClick={onContinue} className="w-full max-w-sm h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg tracking-widest uppercase shadow-xl active:scale-95 transition-all mx-auto block">CONTINUE</button>
    </div>
  );
};