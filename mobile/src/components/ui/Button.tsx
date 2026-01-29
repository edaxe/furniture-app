import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
}: ButtonProps) {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.text.primary}
        />
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && icon}
        <Text style={textStyles}>{title}</Text>
        {icon && iconPosition === 'right' && icon}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants
  primaryButton: {
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.md,
  },
  secondaryButton: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border.medium,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.sm,
  },

  // Sizes
  smallButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    minHeight: 56,
  },

  // Text base
  text: {
    textAlign: 'center',
  },

  // Text variants
  primaryText: {
    ...typography.button,
    color: colors.white,
  },
  secondaryText: {
    ...typography.button,
    color: colors.text.primary,
  },
  outlineText: {
    ...typography.button,
    color: colors.text.primary,
  },
  ghostText: {
    ...typography.button,
    color: colors.accent[500],
  },

  // Text sizes
  smallText: {
    ...typography.buttonSmall,
  },
  mediumText: {
    ...typography.button,
  },
  largeText: {
    ...typography.buttonLarge,
  },

  disabledText: {
    opacity: 0.7,
  },
});
