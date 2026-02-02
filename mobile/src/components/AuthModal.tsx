import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthStore } from '../store/authStore';
import { checkAppleSignInAvailable } from '../services/auth';
import { colors, typography, fontFamily, shadows, borderRadius, spacing } from '../theme';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  allowDismiss?: boolean;
  title?: string;
  subtitle?: string;
}

export default function AuthModal({
  visible,
  onClose,
  allowDismiss = false,
  title = 'Create an account',
  subtitle = 'Sign up to save your finds and unlock all features',
}: AuthModalProps) {
  const { signInWithGoogle, signInWithApple, isLoading } = useAuthStore();
  const [appleSignInAvailable, setAppleSignInAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAppleSignInAvailable().then(setAppleSignInAvailable);
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    try {
      await signInWithApple();
      onClose();
    } catch (err: any) {
      if (err.code !== 'ERR_REQUEST_CANCELED') {
        setError(err.message || 'Failed to sign in with Apple');
      }
    }
  };

  const benefits = [
    { icon: 'bookmark-outline', text: 'Save unlimited furniture finds' },
    { icon: 'home-outline', text: 'Organize by room' },
    { icon: 'sync-outline', text: 'Sync across devices' },
    { icon: 'sparkles-outline', text: 'Access premium features' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={allowDismiss ? onClose : undefined}
    >
      <BlurView intensity={20} style={styles.overlay} tint="dark">
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-add" size={32} color={colors.accent[500]} />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons
                      name={benefit.icon as any}
                      size={18}
                      color={colors.success[500]}
                    />
                  </View>
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                </View>
              ))}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.primary} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color={colors.text.primary} />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {appleSignInAvailable && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={borderRadius.md}
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                />
              )}
            </View>

            {allowDismiss && (
              <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
                <Text style={styles.dismissText}>Maybe later</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    ...shadows.lg,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing[5],
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[5],
  },
  benefitsList: {
    marginBottom: spacing[6],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  benefitText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  errorContainer: {
    backgroundColor: colors.error[50],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error[600],
    textAlign: 'center',
  },
  buttonContainer: {
    gap: spacing[3],
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  googleButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  appleButton: {
    width: '100%',
    height: 52,
  },
  dismissButton: {
    marginTop: spacing[4],
    padding: spacing[3],
    alignItems: 'center',
  },
  dismissText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
