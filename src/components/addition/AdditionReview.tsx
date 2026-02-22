import React from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface QuestionResult {
  num1: number;
  num2: number;
  answer: number;
  userAnswer: number;
  isCorrect: boolean;
  timeTaken?: number;
}

interface AdditionReviewProps {
  sessionResults: QuestionResult[];
  onBack: () => void;
}

export const AdditionReview: React.FC<AdditionReviewProps> = ({ sessionResults, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 animate-in slide-in-from-bottom duration-300">
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Session Review</h1>
      </header>
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-12 max-w-2xl mx-auto w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed min-w-[320px]">
            <colgroup>
              <col className="w-12" />
              <col className="w-1/3" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Ans</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Ans</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessionResults.length > 0 ? (
                sessionResults.map((res, idx) => (
                  <tr 
                    key={idx} 
                    className={`transition-colors ${res.isCorrect 
                      ? 'bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' 
                      : 'bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                    }`}
                  >
                    <td className="px-4 py-5 text-[11px] font-bold text-slate-400 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                        {res.num1} + {res.num2}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`text-sm font-black tabular-nums ${res.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {res.userAnswer}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {res.answer}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle size={32} className="text-slate-200 dark:text-slate-800" />
                      <p className="text-slate-400 text-xs font-medium italic">No entries in this session.</p>
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