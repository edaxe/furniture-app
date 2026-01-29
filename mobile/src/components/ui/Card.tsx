import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, shadows, spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'elevated',
  padding = 'medium',
  onPress,
  style,
}: CardProps) {
  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Card`],
    styles[`${padding}Padding`],
    style,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

interface ImageCardProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
  aspectRatio?: number;
  overlay?: boolean;
  style?: ViewStyle;
}

export function ImageCard({
  imageUrl,
  title,
  subtitle,
  badge,
  onPress,
  aspectRatio = 1,
  overlay = true,
  style,
}: ImageCardProps) {
  return (
    <TouchableOpacity
      style={[styles.imageCard, style]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      <View style={[styles.imageContainer, { aspectRatio }]}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        {overlay && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.gradient}
          />
        )}
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <View style={styles.imageContent}>
          <Text style={styles.imageTitle} numberOfLines={2}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.imageSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface ProductCardProps {
  imageUrl: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  matchPercentage?: number;
  onPress?: () => void;
  onSave?: () => void;
  style?: ViewStyle;
}

export function ProductCard({
  imageUrl,
  name,
  brand,
  price,
  originalPrice,
  matchPercentage,
  onPress,
  style,
}: ProductCardProps) {
  return (
    <TouchableOpacity
      style={[styles.productCard, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
        {matchPercentage && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>{matchPercentage}% match</Text>
          </View>
        )}
      </View>
      <View style={styles.productContent}>
        <Text style={styles.productBrand}>{brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{price}</Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>{originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Base Card
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  elevatedCard: {
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  outlinedCard: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filledCard: {
    backgroundColor: colors.neutral[100],
  },
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: spacing[3],
  },
  mediumPadding: {
    padding: spacing[4],
  },
  largePadding: {
    padding: spacing[5],
  },

  // Image Card
  imageCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
  },
  badge: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[3],
    backgroundColor: colors.accent[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.white,
  },
  imageContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[4],
  },
  imageTitle: {
    ...typography.h3,
    color: colors.white,
  },
  imageSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing[1],
  },

  // Product Card
  productCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  productImageContainer: {
    aspectRatio: 1,
    backgroundColor: colors.neutral[100],
    position: 'relative',
  },
  productImage: {
    ...StyleSheet.absoluteFillObject,
  },
  matchBadge: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    backgroundColor: colors.success[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  matchBadgeText: {
    ...typography.labelSmall,
    color: colors.white,
  },
  productContent: {
    padding: spacing[4],
  },
  productBrand: {
    ...typography.overline,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  productName: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  productPrice: {
    ...typography.price,
    color: colors.text.primary,
  },
  originalPrice: {
    ...typography.body,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
});
