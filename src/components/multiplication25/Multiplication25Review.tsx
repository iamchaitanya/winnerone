import React from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { Mul25QuestionResult } from '../../hooks/useMultiplication25Engine';

interface Multiplication25ReviewProps {
    sessionResults: Mul25QuestionResult[];
    onBack: () => void;
}

export const Multiplication25Review: React.FC<Multiplication25ReviewProps> = ({ sessionResults, onBack }) => {
    const correct = sessionResults.filter(r => r.isCorrect).length;
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
            <header className="flex items-center gap-4 p-6 pb-0">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-900 dark:text-white transition-colors"><ArrowLeft size={24} /></button>
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Review</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{correct}/{sessionResults.length} Correct</p>
                </div>
            </header>
            <div className="flex-1 overflow-auto p-4">
                <div className="max-w-lg mx-auto rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</th>
                                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct</th>
                                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Answer</th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessionResults.map((res, i) => {
                                const sym = res.type === 'multiply' ? '×' : '÷';
                                return (
                                    <tr key={i} className={`border-b border-slate-50 dark:border-slate-800/50 ${res.isCorrect ? '' : 'bg-rose-50/40 dark:bg-rose-900/10'}`}>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                                                {res.operand1} <span className={res.type === 'multiply' ? 'text-teal-500' : 'text-cyan-500'}>{sym}</span> {res.operand2}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right font-black text-emerald-500">{res.answer}</td>
                                        <td className={`px-4 py-4 text-right font-black tabular-nums ${res.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>{res.userAnswer}</td>
                                        <td className="px-4 py-4 text-center">
                                            {res.isCorrect ? <Check size={18} className="text-emerald-500 mx-auto" /> : <X size={18} className="text-rose-500 mx-auto" />}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
