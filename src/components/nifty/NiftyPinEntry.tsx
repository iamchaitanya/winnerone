import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, Delete, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NiftyPinEntryProps {
  selectedUser: string | null;
  onSuccess: () => void;
  onBack: () => void;
}

export const NiftyPinEntry: React.FC<NiftyPinEntryProps> = ({ 
  selectedUser, 
  onSuccess, 
  onBack 
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<{ pin_attempts: number; is_locked: boolean } | null>(null);

  // Fetch the latest lock status and attempts from Supabase
  const fetchUserStatus = async () => {
    if (!selectedUser) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('pin_attempts, is_locked')
      .eq('player_name', selectedUser)
      .single();

    if (!error && data) {
      setUserStatus(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserStatus();
  }, [selectedUser]);

  const verifyPin = async (pin: string) => {
    if (!selectedUser) return;

    // 1. Fetch current profile to check PIN and current attempts
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, pin, pin_attempts')
      .eq('player_name', selectedUser)
      .single();

    if (error || !profile) return;

    if (pin === profile.pin) {
      // SUCCESS: Reset attempts in Supabase
      await supabase
        .from('profiles')
        .update({ pin_attempts: 0, is_locked: false })
        .eq('id', profile.id);
      
      onSuccess();
    } else {
      // FAILURE: Increment attempts and check for lockout
      const newAttempts = (profile.pin_attempts || 0) + 1;
      const shouldLock = newAttempts >= 3;

      await supabase
        .from('profiles')
        .update({ 
          pin_attempts: newAttempts, 
          is_locked: shouldLock 
        })
        .eq('id', profile.id);

      // Refresh local state to show updated attempts/lock
      setUserStatus({ pin_attempts: newAttempts, is_locked: shouldLock });
      
      setPinError(true);
      setTimeout(() => {
        setPinInput('');
        setPinError(false);
      }, 600);
    }
  };

  const handlePinKey = (num: string) => {
    if (userStatus?.is_locked || pinError || loading) return;
    if (pinInput.length < 6) {
      const nextVal = pinInput + num;
      setPinInput(nextVal);
      if (nextVal.length === 6) {
        verifyPin(nextVal);
      }
    }
  };

  const handlePinDelete = () => {
    if (userStatus?.is_locked || pinError) return;
    setPinInput(pinInput.slice(0, -1));
    setPinError(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  const locked = userStatus?.is_locked;
  const attempts = userStatus?.pin_attempts || 0;
  const attemptsLeft = Math.max(0, 3 - attempts);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-300">
      <div className="mb-8 text-center">
        <div className={`w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-slate-800 ${locked ? 'ring-4 ring-rose-500/20' : ''}`}>
          {locked ? <ShieldAlert size={32} className="text-rose-500 animate-pulse" /> : <Lock size={32} className="text-indigo-500" />}
        </div>
        <h2 className={`text-2xl font-black uppercase tracking-tighter ${locked ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
          {locked ? 'Account Locked' : 'Enter PIN'}
        </h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Hello, {selectedUser}</p>
      </div>

      {locked ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-3xl border border-rose-100 dark:border-rose-800/50 max-w-xs text-center mb-8">
          <p className="text-rose-600 dark:text-rose-400 font-bold text-sm leading-relaxed">Too many wrong attempts. Please contact the administrator to unlock your account.</p>
        </div>
      ) : (
        <>
          <div className={`flex gap-3 mb-6 ${pinError ? 'animate-shake' : ''}`}>
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                  pinError ? 'bg-rose-500 border-rose-500 scale-110 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 
                  i < pinInput.length ? 'bg-indigo-500 border-indigo-500 scale-110 shadow-[0_0_12px_rgba(99,102,241,0.3)]' : 'bg-transparent border-slate-200 dark:border-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="h-10 mb-8 flex flex-col items-center justify-center">
            {pinError ? (
              <p className="text-rose-500 font-black text-xs uppercase tracking-[0.2em] animate-bounce">Incorrect PIN</p>
            ) : (
              attempts > 0 && (
                <p className={`text-[10px] font-black uppercase tracking-widest ${attemptsLeft === 1 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                  {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
                </p>
              )
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num} 
                disabled={pinError}
                onClick={() => handlePinKey(num.toString())}
                className="h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-2xl font-black text-slate-900 dark:text-white active:scale-90 transition-transform disabled:opacity-50"
              >
                {num}
              </button>
            ))}
            <div />
            <button 
              disabled={pinError}
              onClick={() => handlePinKey('0')}
              className="h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-2xl font-black text-slate-900 dark:text-white active:scale-90 transition-transform disabled:opacity-50"
            >
              0
            </button>
            <button 
              disabled={pinError}
              onClick={handlePinDelete}
              className="h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 active:scale-90 transition-transform disabled:opacity-50"
            >
              <Delete size={24} />
            </button>
          </div>
        </>
      )}

      <button onClick={onBack} className="mt-12 text-slate-400 font-bold text-sm uppercase tracking-widest">Back</button>
    </div>
  );
};