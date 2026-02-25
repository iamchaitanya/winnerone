import React from 'react';
import { Minus } from 'lucide-react';

export const SensexHistory: React.FC<{ groupedHistory: any[] }> = ({ groupedHistory = [] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800">
            <th className="py-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">Date</th>
            <th className="py-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center">Sensex</th>
            <th className="py-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center">Ayaan</th>
            <th className="py-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight text-center">Riyaan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {groupedHistory.map((group, idx) => {
            const sensexData = group.ayaan || group.riyaan;
            
            const renderPlayer = (data: any) => {
              if (!data) return <Minus size={14} className="mx-auto text-slate-200" />;
              const isWin = data.is_settled && ((data.prediction === 'UP' && data.actual_return >= 0) || (data.prediction === 'DOWN' && data.actual_return < 0));
              return (
                <div className="flex flex-col items-center leading-tight">
                  <span className={`text-[10px] font-bold ${data.prediction === 'UP' ? 'text-emerald-500' : 'text-rose-500'}`}>{data.prediction}</span>
                  {data.is_settled ? (
                    <span className={`text-xs font-black ${isWin ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {data.earnings > 0 ? '+' : ''}{data.earnings.toFixed(1)}
                    </span>
                  ) : <span className="text-[9px] font-bold text-amber-500 uppercase">Wait</span>}
                </div>
              );
            };

            return (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <td className="py-2 px-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    {new Date(group.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </td>
                <td className="py-2 px-1 text-center">
                  {sensexData?.is_settled ? (
                    <div className="flex flex-col items-center leading-tight">
                      <span className="text-xs font-black dark:text-white">{sensexData.closing_value?.toLocaleString('en-IN') || '---'}</span>
                      <span className={`text-[9px] font-bold ${sensexData.actual_return >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{sensexData.actual_return?.toFixed(2)}%</span>
                    </div>
                  ) : <span className="text-[10px] text-slate-300">Open</span>}
                </td>
                <td className="py-2 px-1">{renderPlayer(group.ayaan)}</td>
                <td className="py-2 px-1">{renderPlayer(group.riyaan)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};