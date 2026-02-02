import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { signInWithGoogle, signInWithApple, signOut as authSignOut } from '../services/auth';

export type User = {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  provider: 'google' | 'apple';
};

export type SubscriptionTier = 'free' | 'premium';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  totalScansEver: number;
  hasSeenSoftPrompt: boolean;
  subscription: SubscriptionTier;

  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  incrementTotalScans: () => void;
  setSoftPromptSeen: () => void;
  setSubscription: (tier: SubscriptionTier) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      totalScansEver: 0,
      hasSeenSoftPrompt: false,
      subscription: 'free',

      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const user = await signInWithGoogle();
          if (user) {
            set({ user, isAuthenticated: true });
            // Store auth token securely
            await SecureStore.setItemAsync('authToken', user.id);
          }
        } catch (error) {
          console.error('Google sign-in error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithApple: async () => {
        set({ isLoading: true });
        try {
          const user = await signInWithApple();
          if (user) {
            set({ user, isAuthenticated: true });
            // Store auth token securely
            await SecureStore.setItemAsync('authToken', user.id);
          }
        } catch (error) {
          console.error('Apple sign-in error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await authSignOut();
          await SecureStore.deleteItemAsync('authToken');
          set({ user: null, isAuthenticated: false, subscription: 'free' });
        } catch (error) {
          console.error('Sign-out error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      incrementTotalScans: () => {
        set((state) => ({ totalScansEver: state.totalScansEver + 1 }));
      },

      setSoftPromptSeen: () => {
        set({ hasSeenSoftPrompt: true });
      },

      setSubscription: (tier) => {
        set({ subscription: tier });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: user !== null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        totalScansEver: state.totalScansEver,
        hasSeenSoftPrompt: state.hasSeenSoftPrompt,
        subscription: state.subscription,
      }),
    }
  )
);
