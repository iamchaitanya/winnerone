import { create } from 'zustand';
import { Profile } from '../types.ts';

// Define the shape of our global state
interface GameState {
  settings: {
    dateOverride: string | null;
    additionEnabled: boolean;
    niftyEnabled: boolean;
    pinEntryEnabled: boolean;
  };
  profiles: Profile[];
  // Actions to update the state
  setSettings: (newSettings: Partial<GameState['settings']>) => void;
  setProfiles: (profiles: Profile[]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state values
  settings: {
    dateOverride: null,
    additionEnabled: true,
    niftyEnabled: true,
    pinEntryEnabled: true,
  },
  profiles: [],
  
  // Logic to merge new settings into existing ones
  setSettings: (newSettings) => 
    set((state) => ({ 
      settings: { ...state.settings, ...newSettings } 
    })),
    
  // Logic to replace the profiles list
  setProfiles: (profiles) => set({ profiles }),
}));