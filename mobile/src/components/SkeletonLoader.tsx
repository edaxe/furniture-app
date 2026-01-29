import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../theme';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width, height, borderRadius: radius = 8, style }: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View style={[styles.skeletonWrapper, { width, height, borderRadius: radius }, style]}>
      <Animated.View
        style={[
          styles.skeleton,
          { width: '100%', height: '100%', borderRadius: radius, opacity },
        ]}
      />
    </View>
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonLoader width={80} height={80} borderRadius={borderRadius.sm} />
      <View style={styles.productInfo}>
        <SkeletonLoader width="80%" height={16} />
        <SkeletonLoader width="50%" height={12} style={{ marginTop: spacing[2] }} />
        <SkeletonLoader width="40%" height={18} style={{ marginTop: spacing[2] }} />
      </View>
    </View>
  );
}

export function DetectionSkeleton() {
  return (
    <View style={styles.detectionContainer}>
      <SkeletonLoader width="100%" height={300} borderRadius={0} />
      <View style={styles.detectionInfo}>
        <SkeletonLoader width="60%" height={24} />
        <SkeletonLoader width="80%" height={14} style={{ marginTop: spacing[2] }} />
      </View>
    </View>
  );
}

export function RoomCardSkeleton() {
  return (
    <View style={styles.roomCard}>
      <SkeletonLoader width={44} height={44} borderRadius={22} />
      <View style={styles.roomInfo}>
        <SkeletonLoader width="60%" height={16} />
        <SkeletonLoader width="30%" height={12} style={{ marginTop: spacing[2] }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonWrapper: {
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
  },
  skeleton: {
    backgroundColor: colors.neutral[200],
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing[4],
    justifyContent: 'center',
    gap: spacing[2],
  },
  detectionContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  detectionInfo: {
    padding: spacing[5],
    gap: spacing[3],
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  roomInfo: {
    flex: 1,
    marginLeft: spacing[4],
    gap: spacing[2],
  },
});
