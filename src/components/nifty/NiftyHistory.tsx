import React from 'react';
import { ArrowLeft, History, TrendingUp, TrendingDown } from 'lucide-react';

interface NiftyHistoryProps {
  groupedHistory: any[];
  onBack: () => void;
}

export const NiftyHistory: React.FC<NiftyHistoryProps> = ({
  groupedHistory,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300">
      <header className="flex flex-col gap-6 mb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Market Log</h1>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden max-w-2xl mx-auto w-full mb-24">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] text-center border-x border-slate-50 dark:border-slate-800">Ayaan</th>
                <th className="px-6 py-5 text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.2em] text-center">Riyaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {groupedHistory.length > 0 ? (
                groupedHistory.map((record: any) => (
                  <tr key={record.date} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                        {record.date.split(' ').slice(1, 3).join(' ')}
                      </span>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                        {record.date.split(' ')[3]}
                      </div>
                    </td>
                    
                    <td className="px-6 py-6 text-center border-x border-slate-50 dark:border-slate-800">
                      {record.ayaan ? (
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.ayaan.symbol}</span>
                          <div className={`flex items-center gap-1 mt-1 text-[11px] font-black tabular-nums ${record.ayaan.isSettled ? (record.ayaan.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-400'}`}>
                            {record.ayaan.isSettled ? (
                              <>
                                {record.ayaan.stockReturn >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {record.ayaan.stockReturn.toFixed(2)}%
                              </>
                            ) : 'PENDING'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-200 dark:text-slate-800 font-black">—</span>
                      )}
                    </td>

                    <td className="px-6 py-6 text-center">
                      {record.riyaan ? (
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.riyaan.symbol}</span>
                          <div className={`flex items-center gap-1 mt-1 text-[11px] font-black tabular-nums ${record.riyaan.isSettled ? (record.riyaan.stockReturn >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-400'}`}>
                            {record.riyaan.isSettled ? (
                              <>
                                {record.riyaan.stockReturn >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {record.riyaan.stockReturn.toFixed(2)}%
                              </>
                            ) : 'PENDING'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-200 dark:text-slate-800 font-black">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                        <History size={32} className="text-slate-200 dark:text-slate-600" />
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">No market picks logged yet</p>
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
};