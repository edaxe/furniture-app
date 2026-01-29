import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, fontFamily, spacing, borderRadius, shadows } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScanningAnimationProps {
  message?: string;
}

export default function ScanningAnimation({ message = 'Analyzing furniture...' }: ScanningAnimationProps) {
  const scanLine = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Scanning line animation
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLine, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation for corners
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    scanAnimation.start();
    pulseAnimation.start();

    return () => {
      scanAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const translateY = scanLine.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <LinearGradient
      colors={[colors.background.secondary, colors.background.primary]}
      style={styles.container}
    >
      <View style={styles.frameWrapper}>
        <Animated.View style={[styles.frame, { transform: [{ scale: pulse }] }]}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY }] }
            ]}
          />
        </Animated.View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.submessage}>This may take a moment</Text>
      </View>

      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: pulse }]} />
        <Animated.View style={[styles.dot, styles.dotMiddle]} />
        <Animated.View style={[styles.dot, { opacity: scanLine }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  frameWrapper: {
    padding: spacing[6],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  frame: {
    width: 180,
    height: 180,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: colors.accent[500],
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: colors.accent[500],
    borderRadius: 1,
    shadowColor: colors.accent[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  textContainer: {
    marginTop: spacing[8],
    alignItems: 'center',
  },
  message: {
    ...typography.h4,
    color: colors.text.primary,
    textAlign: 'center',
  },
  submessage: {
    marginTop: spacing[2],
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: spacing[8],
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent[300],
  },
  dotMiddle: {
    backgroundColor: colors.accent[500],
  },
});
