import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type Subscription } from 'react-native-iap';
import { useAuthStore } from '../store/authStore';
import { fetchSubscription, purchaseSubscription, restorePurchases } from '../services/iap';
import { colors, typography, fontFamily, shadows, borderRadius, spacing } from '../theme';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

type FeatureItem = {
  name: string;
  free: string | boolean;
  premium: string | boolean;
};

const features: FeatureItem[] = [
  { name: 'Monthly scans', free: '10', premium: 'Unlimited' },
  { name: 'Matches per item', free: '3', premium: 'All' },
  { name: 'Saved room lists', free: '1', premium: 'Unlimited' },
  { name: 'Furniture detection', free: true, premium: true },
  { name: 'Basic product info', free: true, premium: true },
];

export default function PaywallModal({
  visible,
  onClose,
  onUpgrade,
}: PaywallModalProps) {
  const { setSubscription } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<Subscription | null>(null);

  useEffect(() => {
    if (visible) {
      fetchSubscription().then(setProduct);
    }
  }, [visible]);

  const priceLabel = product && 'localizedPrice' in product
    ? product.localizedPrice
    : '$19.99';

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await purchaseSubscription();
      onUpgrade?.();
      onClose();
    } catch (error: any) {
      if (error?.code !== 'E_USER_CANCELLED') {
        Alert.alert('Error', 'Failed to process upgrade. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert('Restored', 'Your premium subscription has been restored.', [
          { text: 'OK', onPress: onClose },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFeatureValue = (value: string | boolean, isPremium: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={isPremium ? colors.success[500] : colors.neutral[400]}
        />
      ) : (
        <Ionicons name="close-circle" size={20} color={colors.neutral[300]} />
      );
    }
    return (
      <Text
        style={[
          styles.featureValue,
          isPremium && styles.featureValuePremium,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <View style={styles.premiumBadge}>
              <Ionicons name="sparkles" size={24} color={colors.white} />
            </View>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              Unlock unlimited scans and access all features
            </Text>
          </View>

          <View style={styles.pricingCard}>
            <Text style={styles.price}>{priceLabel}</Text>
            <Text style={styles.period}>/month</Text>
            <Text style={styles.pricingNote}>Cancel anytime</Text>
          </View>

          <View style={styles.comparisonTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Feature</Text>
              <Text style={styles.tableHeaderCellValue}>Free</Text>
              <Text style={[styles.tableHeaderCellValue, styles.premiumHeader]}>
                Premium
              </Text>
            </View>

            {features.map((feature, index) => (
              <View
                key={feature.name}
                style={[
                  styles.tableRow,
                  index === features.length - 1 && styles.tableRowLast,
                ]}
              >
                <Text style={styles.featureName}>{feature.name}</Text>
                <View style={styles.tableCellCenter}>
                  {renderFeatureValue(feature.free, false)}
                </View>
                <View style={[styles.tableCellCenter, styles.premiumCell]}>
                  {renderFeatureValue(feature.premium, true)}
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.subscriptionDisclosure}>
            Payment will be charged to your Apple ID account at confirmation of
            purchase. Subscription automatically renews unless canceled at least
            24 hours before the end of the current period. Your account will be
            charged for renewal within 24 hours prior to the end of the current
            period. You can manage and cancel your subscriptions by going to your
            account settings on the App Store after purchase.
          </Text>

          <View style={styles.legalLinks}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://roomradar.app/terms')}
            >
              <Text style={styles.legalLinkText}>Terms of Use</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>|</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://roomradar.app/privacy')}
            >
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color={colors.white} />
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
            disabled={isLoading}
          >
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: spacing[1],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[5],
    paddingBottom: spacing[8],
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  premiumBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
    ...shadows.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    alignItems: 'center',
    marginBottom: spacing[6],
    ...shadows.sm,
  },
  price: {
    ...typography.displayLarge,
    color: colors.text.primary,
  },
  period: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: -spacing[2],
  },
  pricingNote: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  comparisonTable: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  tableHeaderCell: {
    ...typography.overline,
    color: colors.text.secondary,
    flex: 1,
  },
  tableHeaderCellValue: {
    ...typography.overline,
    color: colors.text.secondary,
    width: 80,
    textAlign: 'center',
  },
  tableCellCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  premiumHeader: {
    color: colors.accent[500],
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    minHeight: 52,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  featureName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
  featureValue: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  featureValuePremium: {
    color: colors.success[600],
    fontFamily: fontFamily.semiBold,
    textAlign: 'center',
  },
  premiumCell: {
    backgroundColor: colors.accent[50],
    marginRight: -spacing[4],
    paddingRight: spacing[4],
    marginVertical: -spacing[3],
    paddingVertical: spacing[3],
    width: 90,
  },
  subscriptionDisclosure: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[5],
    lineHeight: 18,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[3],
    gap: spacing[2],
  },
  legalLinkText: {
    ...typography.caption,
    color: colors.accent[500],
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  footer: {
    padding: spacing[5],
    paddingBottom: spacing[8],
    backgroundColor: colors.background.primary,
    borderTopWidth: 0.5,
    borderTopColor: colors.border.light,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    gap: spacing[2],
    ...shadows.md,
  },
  upgradeButtonText: {
    ...typography.button,
    color: colors.white,
  },
  restoreButton: {
    marginTop: spacing[3],
    padding: spacing[3],
    alignItems: 'center',
  },
  restoreText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
