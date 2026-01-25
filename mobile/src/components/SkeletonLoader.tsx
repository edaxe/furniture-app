import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width, height, borderRadius = 8, style }: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonLoader width={80} height={80} borderRadius={8} />
      <View style={styles.productInfo}>
        <SkeletonLoader width="80%" height={16} />
        <SkeletonLoader width="50%" height={12} style={{ marginTop: 8 }} />
        <SkeletonLoader width="40%" height={18} style={{ marginTop: 8 }} />
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
        <SkeletonLoader width="80%" height={14} style={{ marginTop: 8 }} />
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
        <SkeletonLoader width="30%" height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E1E1',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  detectionContainer: {
    backgroundColor: 'white',
  },
  detectionInfo: {
    padding: 20,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
  },
});
