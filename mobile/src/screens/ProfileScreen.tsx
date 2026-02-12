import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useUserStore } from '../store/userStore';
import { useListStore } from '../store/listStore';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '../store/authStore';
import AuthModal from '../components/AuthModal';
import PaywallModal from '../components/PaywallModal';
import { checkAppleSignInAvailable } from '../services/auth';
import { colors, typography, fontFamily, spacing, borderRadius, shadows } from '../theme';

const MAX_FREE_SCANS = 10;

export default function ProfileScreen() {
  const { scansRemaining, isPro, resetUser } = useUserStore();
  const { rooms, savedItems, clearAll } = useListStore();
  const { resetOnboarding } = useOnboardingStore();
  const {
    user,
    isAuthenticated,
    isLoading,
    subscription,
    signOut,
    signInWithGoogle,
    signInWithApple,
  } = useAuthStore();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [appleSignInAvailable, setAppleSignInAvailable] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  useEffect(() => {
    checkAppleSignInAvailable().then(setAppleSignInAvailable);
  }, []);

  const handleUpgrade = () => {
    setShowPaywallModal(true);
  };

  const handleSignIn = () => {
    setShowAuthModal(true);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('Signed Out', 'You have been signed out successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again when you restart the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            resetOnboarding();
            Alert.alert('Done', 'Onboarding will show on next app launch.');
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your rooms, saved items, and reset your account. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            clearAll();
            resetUser();
            resetOnboarding();
            if (isAuthenticated) {
              await signOut();
            }
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    const iosUrl = 'https://apps.apple.com/app/id000000000';
    const androidUrl = 'https://play.google.com/store/apps/details?id=com.roomradar';
    Linking.openURL(Platform.OS === 'ios' ? iosUrl : androidUrl).catch(() => {
      Alert.alert('Error', 'Could not open app store.');
    });
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@homesnap.app').catch(() => {
      Alert.alert('Error', 'Could not open email app.');
    });
  };

  const handleTerms = () => {
    Linking.openURL('https://roomradar.app/terms').catch(() => {
      Alert.alert('Error', 'Could not open link.');
    });
  };

  const handlePrivacy = () => {
    Linking.openURL('https://roomradar.app/privacy').catch(() => {
      Alert.alert('Error', 'Could not open link.');
    });
  };

  const scansProgress = isPro ? 1 : scansRemaining / MAX_FREE_SCANS;
  const isPremium = subscription === 'premium';

  const renderAccountSection = () => {
    if (isAuthenticated && user) {
      return (
        <View style={styles.accountCard}>
          {user.photoUrl ? (
            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarInitial}>
                {user.displayName?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{user.displayName}</Text>
            <Text style={styles.accountSubtitle}>{user.email}</Text>
          </View>
          <View style={styles.providerBadge}>
            <Ionicons
              name={user.provider === 'apple' ? 'logo-apple' : 'logo-google'}
              size={16}
              color={colors.text.secondary}
            />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.signInCard} onPress={handleSignIn}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-add" size={28} color={colors.accent[500]} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>Sign In</Text>
          <Text style={styles.accountSubtitle}>Create an account to save your finds</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Profile</Text>

        {/* Account Section */}
        <View style={styles.section}>
          {renderAccountSection()}
        </View>

        {/* Subscription Card */}
        <View style={styles.section}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View style={[styles.planBadge, isPremium && styles.planBadgePremium]}>
                <Text style={styles.planBadgeText}>
                  {isPremium ? 'PREMIUM' : 'FREE'}
                </Text>
              </View>
              <Text style={styles.subscriptionTitle}>
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </Text>
            </View>

            {!isPremium && (
              <>
                <View style={styles.scansInfo}>
                  <Text style={styles.scansLabel}>Scans remaining this month</Text>
                  <Text style={styles.scansCount}>
                    {scansRemaining}/{MAX_FREE_SCANS}
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[styles.progressBarFill, { width: `${scansProgress * 100}%` }]}
                  />
                </View>
              </>
            )}

            {isPremium ? (
              <View style={styles.premiumFeatures}>
                <View style={styles.premiumFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success[500]} />
                  <Text style={styles.premiumFeatureText}>Unlimited scans</Text>
                </View>
                <View style={styles.premiumFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success[500]} />
                  <Text style={styles.premiumFeatureText}>All product matches</Text>
                </View>
                <View style={styles.premiumFeatureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success[500]} />
                  <Text style={styles.premiumFeatureText}>Unlimited room lists</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{rooms.length}</Text>
              <Text style={styles.statLabel}>Rooms</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{savedItems.length}</Text>
              <Text style={styles.statLabel}>Saved Items</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleResetOnboarding}>
              <Ionicons name="refresh-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>Reset Onboarding</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleClearAllData}>
              <Ionicons name="trash-outline" size={22} color={colors.error[500]} />
              <Text style={[styles.menuItemText, { color: colors.error[500] }]}>
                Clear All Data
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
            {isAuthenticated && (
              <>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                  <Ionicons name="log-out-outline" size={22} color={colors.text.secondary} />
                  <Text style={styles.menuItemText}>Sign Out</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleRateApp}>
              <Ionicons name="star-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>Rate App</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleContactSupport}>
              <Ionicons name="mail-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>Contact Support</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleTerms}>
              <Ionicons name="document-text-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
              <Ionicons name="shield-outline" size={22} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[300]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>HomeSnap v{appVersion}</Text>
      </ScrollView>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        allowDismiss={true}
      />

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  screenTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },

  // Account Card
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.sm,
  },
  signInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.accent[200],
    borderStyle: 'dashed',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    ...typography.h3,
    color: colors.accent[500],
  },
  accountInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  accountName: {
    ...typography.h4,
    color: colors.text.primary,
  },
  accountSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  providerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Subscription Card
  subscriptionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    ...shadows.sm,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  planBadge: {
    backgroundColor: colors.neutral[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  planBadgePremium: {
    backgroundColor: colors.accent[500],
  },
  planBadgeText: {
    ...typography.labelSmall,
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
  },
  subscriptionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginLeft: spacing[3],
  },
  scansInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  scansLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  scansCount: {
    ...typography.label,
    color: colors.text.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.neutral[100],
    borderRadius: 3,
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: 3,
  },
  premiumFeatures: {
    gap: spacing[2],
  },
  premiumFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  premiumFeatureText: {
    ...typography.body,
    color: colors.text.primary,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  upgradeButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    ...typography.displayMedium,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },

  // Menu Cards
  menuCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
  },
  menuItemText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    marginLeft: spacing[3],
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing[4] + 22 + spacing[3],
  },

  // Version
  versionText: {
    ...typography.caption,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
