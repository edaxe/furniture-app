import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { ScanStackParamList } from '../navigation/types';

type DetectionFailedRouteProp = RouteProp<ScanStackParamList, 'DetectionFailed'>;
type DetectionFailedNavigationProp = NativeStackNavigationProp<ScanStackParamList, 'DetectionFailed'>;

export default function DetectionFailedScreen() {
  const route = useRoute<DetectionFailedRouteProp>();
  const navigation = useNavigation<DetectionFailedNavigationProp>();
  const { reason } = route.params || {};

  const tips = [
    'Make sure the furniture is clearly visible',
    'Use good lighting',
    'Avoid blurry images',
    'Try getting closer to the item',
    'Include the full piece of furniture',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#FF3B30" />
      </View>

      <Text style={styles.title}>Detection Failed</Text>

      <Text style={styles.reason}>
        {reason || 'We could not detect any furniture in this image.'}
      </Text>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for better results:</Text>
        {tips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={18} color="#34C759" />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ScanHome')}
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  reason: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
