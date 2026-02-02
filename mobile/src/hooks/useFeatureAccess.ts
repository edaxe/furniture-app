import { useAuthStore } from '../store/authStore';
import { useListStore } from '../store/listStore';

export interface FeatureAccess {
  // Authentication checks
  isAuthenticated: boolean;
  isPremium: boolean;

  // Scan access
  canScan: boolean;
  shouldShowSoftPrompt: boolean;
  shouldShowHardGate: boolean;

  // Save access
  canSave: boolean;

  // Room limits
  canCreateRoom: boolean;
  roomCount: number;
  roomLimit: number;

  // Match limits
  matchLimit: number;

  // Scan tracking
  totalScansEver: number;
}

export function useFeatureAccess(): FeatureAccess {
  const {
    isAuthenticated,
    subscription,
    totalScansEver,
    hasSeenSoftPrompt,
  } = useAuthStore();

  const { rooms } = useListStore();

  const isPremium = subscription === 'premium';
  const roomCount = rooms.length;

  // Free tier limits
  const FREE_ROOM_LIMIT = 1;
  const FREE_MATCH_LIMIT = 3;
  const PREMIUM_MATCH_LIMIT = Infinity;

  // Scan access logic:
  // - 1st scan: Full experience, no prompts
  // - 2nd scan: Soft prompt after scan completes
  // - 3rd+ scan (unauthenticated): Hard gate, must sign up
  const canScan = isAuthenticated || totalScansEver < 2;

  // Show soft prompt after 2nd scan if unauthenticated and haven't seen it
  const shouldShowSoftPrompt = !isAuthenticated && totalScansEver === 1 && !hasSeenSoftPrompt;

  // Show hard gate on 3rd+ scan if unauthenticated
  const shouldShowHardGate = !isAuthenticated && totalScansEver >= 2;

  // Save requires authentication
  const canSave = isAuthenticated;

  // Room creation: authenticated and (premium OR under free limit)
  const canCreateRoom = isAuthenticated && (isPremium || roomCount < FREE_ROOM_LIMIT);

  // Match limit based on subscription
  const matchLimit = isPremium ? PREMIUM_MATCH_LIMIT : FREE_MATCH_LIMIT;

  return {
    isAuthenticated,
    isPremium,
    canScan,
    shouldShowSoftPrompt,
    shouldShowHardGate,
    canSave,
    canCreateRoom,
    roomCount,
    roomLimit: isPremium ? Infinity : FREE_ROOM_LIMIT,
    matchLimit,
    totalScansEver,
  };
}
