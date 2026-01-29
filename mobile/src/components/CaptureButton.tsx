import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function CaptureButton({ onPress, disabled }: CaptureButtonProps) {
  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.innerCircle} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  innerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'white',
  },
  disabled: {
    opacity: 0.5,
  },
});
