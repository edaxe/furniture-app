import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, fontFamily, shadows, borderRadius, spacing } from '../theme';

interface SoftPromptBannerProps {
  visible: boolean;
  onSignUp: () => void;
  onDismiss: () => void;
}

export default function SoftPromptBanner({
  visible,
  onSignUp,
  onDismiss,
}: SoftPromptBannerProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={[styles.container, { bottom: insets.bottom + 90 }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="bookmark" size={20} color={colors.accent[500]} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Save your finds</Text>
          <Text style={styles.subtitle}>Create an account to keep track of furniture</Text>
        </View>
        <TouchableOpacity style={styles.signUpButton} onPress={onSignUp}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Ionicons name="close" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    paddingLeft: spacing[4],
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  textContainer: {
    flex: 1,
    marginRight: spacing[2],
  },
  title: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  signUpButton: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    marginRight: spacing[2],
  },
  signUpText: {
    ...typography.labelSmall,
    color: colors.white,
  },
  dismissButton: {
    padding: spacing[2],
  },
});
