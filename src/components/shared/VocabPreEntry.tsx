import React from 'react';
import { User, Users, Check, CalendarX, Play } from 'lucide-react';
export const VocabPreEntry: React.FC<{ title: string; selectedUser: string | null; isPlayed: boolean; isMarketWorking: boolean; rules: string[]; onStart: () => void; onBack: () => void; }> = ({ title, selectedUser, isPlayed, isMarketWorking, rules, onStart, onBack }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300 text-center">
        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800">{selectedUser === 'Ayaan' ? <User size={48} className="text-indigo-600" /> : <Users size={48} className="text-rose-600" />}</div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Hello, {selectedUser}</h2>
        {isPlayed ? <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 mb-12 flex items-center gap-3"><Check size={20} className="text-emerald-500" /><p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wide">Finished today's {title}!</p></div>
            : !isMarketWorking ? <div className="bg-amber-50 dark:bg-amber-900/20 px-8 py-6 rounded-[2rem] border border-amber-100 dark:border-amber-800/50 mb-12 max-w-xs"><CalendarX size={32} className="text-amber-500 mx-auto mb-3" /><p className="text-amber-600 dark:text-amber-400 font-black text-sm uppercase tracking-wide">Market Closed</p></div>
                : <>
                    <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-8 text-left shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">📋 Rules</p>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 font-medium">{rules.map((r, i) => <li key={i}>• {r}</li>)}</ul>
                    </div>
                    <button onClick={onStart} className="w-full max-w-xs h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl mx-auto block"><Play size={24} fill="currentColor" /> START</button>
                </>}
        <button onClick={onBack} className="mt-8 text-slate-400 font-bold text-sm uppercase tracking-widest">Back</button>
    </div>
);
