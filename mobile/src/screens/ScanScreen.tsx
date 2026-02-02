import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import CameraView from '../components/CameraView';
import AuthModal from '../components/AuthModal';
import SoftPromptBanner from '../components/SoftPromptBanner';
import PaywallModal from '../components/PaywallModal';
import { ScanStackParamList } from '../navigation/types';
import { useScanStore } from '../store/scanStore';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { colors, typography, fontFamily, borderRadius, spacing } from '../theme';

type ScanScreenNavigationProp = NativeStackNavigationProp<ScanStackParamList, 'ScanHome'>;

export default function ScanScreen() {
  const navigation = useNavigation<ScanScreenNavigationProp>();
  const { setCurrentImage } = useScanStore();
  const { scansRemaining, decrementScans, isPro } = useUserStore();
  const { incrementTotalScans, setSoftPromptSeen, isAuthenticated } = useAuthStore();
  const {
    canScan,
    shouldShowHardGate,
    totalScansEver,
  } = useFeatureAccess();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);

  // Check if we should show soft prompt when screen focuses
  useFocusEffect(
    useCallback(() => {
      // Show soft prompt after 2nd scan (totalScansEver === 2) if not authenticated
      if (!isAuthenticated && totalScansEver === 2) {
        setShowSoftPrompt(true);
      }
    }, [isAuthenticated, totalScansEver])
  );

  const checkAuthGate = (): boolean => {
    // If user is on 3rd+ scan and not authenticated, show hard gate
    if (shouldShowHardGate) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const checkScanLimit = (): boolean => {
    // Premium users have unlimited scans
    if (isPro) return true;

    if (scansRemaining <= 0) {
      // Show paywall for scan limit reached
      setShowPaywallModal(true);
      return false;
    }
    return true;
  };

  const processScan = (uri: string) => {
    setCurrentImage(uri);
    if (!isPro) {
      decrementScans();
    }
    incrementTotalScans();
    navigation.navigate('Results', { imageUri: uri });

    // Show soft prompt after 2nd scan completes (will now be totalScansEver === 2)
    if (!isAuthenticated && totalScansEver === 1) {
      setTimeout(() => setShowSoftPrompt(true), 500);
    }
  };

  const handleCapture = (uri: string) => {
    if (!checkAuthGate()) {
      setPendingImageUri(uri);
      return;
    }
    if (!checkScanLimit()) {
      setPendingImageUri(uri);
      return;
    }

    processScan(uri);
  };

  const handleGalleryPress = async () => {
    if (!checkAuthGate()) return;
    if (!checkScanLimit()) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      processScan(result.assets[0].uri);
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // If user authenticated and has pending image, process it
    if (isAuthenticated && pendingImageUri) {
      if (checkScanLimit()) {
        processScan(pendingImageUri);
      }
      setPendingImageUri(null);
    }
  };

  const handleSoftPromptSignUp = () => {
    setShowSoftPrompt(false);
    setSoftPromptSeen();
    setShowAuthModal(true);
  };

  const handleSoftPromptDismiss = () => {
    setShowSoftPrompt(false);
    setSoftPromptSeen();
  };

  const handlePaywallClose = () => {
    setShowPaywallModal(false);
    setPendingImageUri(null);
  };

  // Display logic for scan counter
  const displayScansRemaining = isPro ? '∞' : scansRemaining;

  return (
    <View style={styles.container}>
      <CameraView onCapture={handleCapture} onGalleryPress={handleGalleryPress} />

      <View style={styles.scanCounter}>
        <View style={[styles.scanCounterBadge, isPro && styles.scanCounterBadgePro]}>
          <Text style={styles.scanCounterNumber}>{displayScansRemaining}</Text>
        </View>
        <Text style={styles.scanCounterText}>
          {isPro ? 'unlimited' : 'scans left'}
        </Text>
      </View>

      <SoftPromptBanner
        visible={showSoftPrompt}
        onSignUp={handleSoftPromptSignUp}
        onDismiss={handleSoftPromptDismiss}
      />

      <AuthModal
        visible={showAuthModal}
        onClose={handleAuthModalClose}
        allowDismiss={totalScansEver < 2}
        title={totalScansEver >= 2 ? 'Sign up to continue' : 'Create an account'}
        subtitle={
          totalScansEver >= 2
            ? 'Create a free account to keep scanning furniture'
            : 'Sign up to save your finds and unlock all features'
        }
      />

      <PaywallModal
        visible={showPaywallModal}
        onClose={handlePaywallClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text.primary,
  },
  scanCounter: {
    position: 'absolute',
    top: 60,
    left: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingLeft: spacing[1],
    paddingRight: spacing[4],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[2],
  },
  scanCounterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCounterBadgePro: {
    backgroundColor: colors.success[500],
  },
  scanCounterNumber: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.white,
  },
  scanCounterText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.2,
  },
});
