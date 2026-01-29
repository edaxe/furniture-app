import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { DetectedFurniture } from '../navigation/types';
import { colors, typography, fontFamily, borderRadius, spacing } from '../theme';

interface BoundingBoxProps {
  furniture: DetectedFurniture;
  imageWidth: number;
  imageHeight: number;
  onPress: (furniture: DetectedFurniture) => void;
  isSelected?: boolean;
}

export default function BoundingBox({
  furniture,
  imageWidth,
  imageHeight,
  onPress,
  isSelected,
}: BoundingBoxProps) {
  const { boundingBox, label, confidence } = furniture;

  const boxStyle = {
    left: boundingBox.x * imageWidth,
    top: boundingBox.y * imageHeight,
    width: boundingBox.width * imageWidth,
    height: boundingBox.height * imageHeight,
  };

  return (
    <TouchableOpacity
      style={[
        styles.box,
        boxStyle,
        isSelected && styles.selectedBox,
      ]}
      onPress={() => onPress(furniture)}
      activeOpacity={0.7}
    >
      <View style={[styles.labelContainer, isSelected && styles.selectedLabel]}>
        <Text style={styles.labelText} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.confidenceText}>
          {Math.round(confidence * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.accent[500],
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.accent[500]}10`,
  },
  selectedBox: {
    borderColor: colors.success[500],
    backgroundColor: `${colors.success[500]}15`,
    borderWidth: 2.5,
  },
  labelContainer: {
    position: 'absolute',
    top: -30,
    left: -2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    maxWidth: 160,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedLabel: {
    backgroundColor: colors.success[500],
  },
  labelText: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    letterSpacing: 0.2,
    marginRight: spacing[1],
  },
  confidenceText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: fontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.1,
  },
});
