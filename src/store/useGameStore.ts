import { create } from 'zustand';
import { Profile } from '../types.ts';

// Define the shape of our global state
interface GameState {
  settings: {
    dateOverride: string | null;
    additionEnabled: boolean;
    subtractionEnabled: boolean;
    multiplicationEnabled: boolean;
    multiplication25Enabled: boolean;
    multiplyEnabled: boolean;
    divideEnabled: boolean;
    mentalmathEnabled: boolean;
    niftyEnabled: boolean;
    sensexEnabled: boolean;
    pinEntryEnabled: boolean;
    additionMultiplier: number;
    subtractionMultiplier: number;
    multiplicationMultiplier: number;
    multiplication25Multiplier: number;
    multiplyMultiplier: number;
    divideMultiplier: number;
    mentalmathMultiplier: number;
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
    subtractionEnabled: true,
    multiplicationEnabled: true,
    multiplication25Enabled: true,
    multiplyEnabled: true,
    divideEnabled: true,
    mentalmathEnabled: true,
    niftyEnabled: true,
    sensexEnabled: true,
    pinEntryEnabled: true,
    additionMultiplier: 1,
    subtractionMultiplier: 1,
    multiplicationMultiplier: 1,
    multiplication25Multiplier: 2,
    multiplyMultiplier: 2,
    divideMultiplier: 3,
    mentalmathMultiplier: 1,
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