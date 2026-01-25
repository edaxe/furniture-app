import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_FREE_SCANS = 5;

interface UserState {
  scansRemaining: number;
  lastResetDate: string | null;
  isPro: boolean;

  decrementScans: () => void;
  resetScansIfNewMonth: () => void;
  setPro: (isPro: boolean) => void;
}

const getMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}`;
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      scansRemaining: MAX_FREE_SCANS,
      lastResetDate: null,
      isPro: false,

      decrementScans: () => {
        const { isPro, scansRemaining } = get();
        if (isPro) return;
        if (scansRemaining > 0) {
          set({ scansRemaining: scansRemaining - 1 });
        }
      },

      resetScansIfNewMonth: () => {
        const { lastResetDate, isPro } = get();
        if (isPro) return;

        const currentMonth = getMonthKey();
        if (lastResetDate !== currentMonth) {
          set({
            scansRemaining: MAX_FREE_SCANS,
            lastResetDate: currentMonth,
          });
        }
      },

      setPro: (isPro) => set({ isPro }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
