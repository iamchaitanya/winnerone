
import React from 'react';
import { ArrowLeft, PieChart, BarChart3, Wallet, ShieldCheck, Target } from 'lucide-react';
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts';

const PIE_DATA = [
  { name: 'Equity', value: 65, color: '#6366f1' },
  { name: 'Mutual Funds', value: 20, color: '#8b5cf6' },
  { name: 'Cash', value: 10, color: '#10b981' },
  { name: 'Debt', value: 5, color: '#f43f5e' },
];

const PERFORMANCE_DATA = [
  { month: 'Jan', return: 2.4 },
  { month: 'Feb', return: -1.2 },
  { month: 'Mar', return: 4.5 },
  { month: 'Apr', return: 0.8 },
  { month: 'May', return: 3.2 },
  { month: 'Jun', return: 2.1 },
];

interface DashboardViewProps {
  onBack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300 pb-12">
      <header className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        </div>
        
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="text-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Risk Score</p>
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">74</span>
            </div>
          </div>
          <div className="text-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Growth</p>
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">18%</span>
            </div>
          </div>
          <div className="text-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Assets</p>
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-violet-100 dark:border-violet-900 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-600 dark:text-violet-400">42</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Allocation */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <PieChart size={18} className="text-indigo-500 dark:text-indigo-400" />
              Asset Allocation
            </h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Diversified</span>
          </div>
          
          <div className="flex items-center">
            <div className="h-40 w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={PIE_DATA}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RPieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {PIE_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <BarChart3 size={18} className="text-emerald-500 dark:text-emerald-400" />
              Monthly Returns
            </h3>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_DATA}>
                <Bar dataKey="return" radius={[6, 6, 0, 0]}>
                  {PERFORMANCE_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.return >= 0 ? '#10b981' : '#f43f5e'} 
                    />
                  ))}
                </Bar>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8'}} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Value Cards */}
        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-fit rounded-xl">
              <Wallet size={24} />
            </div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Savings Rate</h4>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">24.5%</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 w-fit rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Health Score</h4>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">8.2</p>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-lg text-slate-900 dark:text-white">
              <Target size={22} className="text-rose-500 dark:text-rose-400" />
              Retirement Goal
            </h3>
            <span className="text-lg font-bold text-slate-900 dark:text-white">₹1.2Cr</span>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 dark:bg-rose-400 rounded-full w-[45%] transition-all duration-1000"></div>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overall Progress</span>
              <span className="text-rose-600 dark:text-rose-400">45% achieved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
