import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { DetectedFurniture } from '../navigation/types';

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
    borderColor: '#007AFF',
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  selectedBox: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderWidth: 3,
  },
  labelContainer: {
    position: 'absolute',
    top: -28,
    left: -2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    maxWidth: 150,
  },
  selectedLabel: {
    backgroundColor: '#34C759',
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  confidenceText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
  },
});
