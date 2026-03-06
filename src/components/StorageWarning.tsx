import React from 'react';
import { Database, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const StorageWarning: React.FC = () => {
    const isStorageFull = useGameStore((state) => state.isStorageFull);

    if (!isStorageFull) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-top duration-500">
            <div className="max-w-xl mx-auto bg-rose-600 dark:bg-rose-700 text-white p-4 rounded-3xl shadow-2xl flex items-start gap-4 border border-rose-500 dark:border-rose-600">
                <div className="p-3 bg-white/20 rounded-2xl shrink-0">
                    <Database size={24} className="text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-black text-lg uppercase tracking-wider flex items-center gap-2 mb-1">
                        <AlertTriangle size={18} /> Storage Quota Exceeded
                    </h3>
                    <p className="text-sm font-medium text-rose-100 leading-relaxed mb-3">
                        The free cloud database is full. Game scores and progress can no longer be saved.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold bg-black/20 p-2 rounded-xl backdrop-blur-sm">
                        <ShieldAlert size={14} className="text-rose-200" />
                        <span className="text-rose-100">Action Required: Go to the Admin Panel and use the "Master Reset" button to download a backup and clear space.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
