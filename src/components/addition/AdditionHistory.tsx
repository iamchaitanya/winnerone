import React from 'react';
import { ArrowLeft, History } from 'lucide-react';

interface QuestionResult {
  num1: number;
  num2: number;
  answer: number;
  userAnswer: number;
  isCorrect: boolean;
  timeTaken?: number;
  player: string;
  timestamp: number;
}

interface AdditionHistoryProps {
  masterQuestionHistory: QuestionResult[];
  historyFilter: 'Ayaan' | 'Riyaan';
  setHistoryFilter: (filter: 'Ayaan' | 'Riyaan') => void;
  onBack: () => void;
}

export const AdditionHistory: React.FC<AdditionHistoryProps> = ({
  masterQuestionHistory,
  historyFilter,
  setHistoryFilter,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-right duration-300">
      <header className="flex flex-col gap-6 mb-8 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"
          >
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
                masterQuestionHistory.map((res, idx) => {
                  const date = new Date(res.timestamp).toLocaleDateString([], { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  });
                  const prevDate = idx > 0 
                    ? new Date(masterQuestionHistory[idx - 1].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) 
                    : null;
                  const isNewDate = date !== prevDate;

                  return (
                    <React.Fragment key={idx}>
                      {isNewDate && (
                        <tr className="bg-slate-100/50 dark:bg-slate-800/50">
                          <td colSpan={4} className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-y border-slate-200 dark:border-slate-800">
                            {date}
                          </td>
                        </tr>
                      )}
                      <tr 
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
                    </React.Fragment>
                  );
                })
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
};