import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';

const MAX_FREE_SCANS = 10;

interface UserState {
  scansRemaining: number;
  lastResetDate: string | null;
  isPro: boolean;

  decrementScans: () => void;
  resetScansIfNewMonth: () => void;
  setPro: (isPro: boolean) => void;
  resetUser: () => void;
  getIsPremium: () => boolean;
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
        // Check auth store for premium status
        const { subscription } = useAuthStore.getState();
        const isPremium = subscription === 'premium' || get().isPro;

        // Premium users don't use scans
        if (isPremium) return;

        const { scansRemaining } = get();
        if (scansRemaining > 0) {
          set({ scansRemaining: scansRemaining - 1 });
        }
      },

      resetScansIfNewMonth: () => {
        // Check auth store for premium status
        const { subscription } = useAuthStore.getState();
        const isPremium = subscription === 'premium' || get().isPro;

        if (isPremium) return;

        const { lastResetDate } = get();
        const currentMonth = getMonthKey();
        if (lastResetDate !== currentMonth) {
          set({
            scansRemaining: MAX_FREE_SCANS,
            lastResetDate: currentMonth,
          });
        }
      },

      setPro: (isPro) => {
        set({ isPro });
        // Also update auth store subscription
        if (isPro) {
          useAuthStore.getState().setSubscription('premium');
        }
      },

      resetUser: () =>
        set({
          scansRemaining: MAX_FREE_SCANS,
          lastResetDate: null,
          isPro: false,
        }),

      // Helper to check premium status from both stores
      getIsPremium: () => {
        const { subscription } = useAuthStore.getState();
        return subscription === 'premium' || get().isPro;
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
