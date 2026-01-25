import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions } from 'react-native';

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
    <View style={styles.container}>
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

      <Text style={styles.message}>{message}</Text>
      <Text style={styles.submessage}>This may take a moment</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  frame: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#007AFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  message: {
    marginTop: 40,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  submessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});
