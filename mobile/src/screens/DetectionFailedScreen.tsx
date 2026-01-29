import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ScanStackParamList } from '../navigation/types';
import { colors, typography, fontFamily, shadows, borderRadius, spacing } from '../theme';

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
    <LinearGradient
      colors={[colors.background.secondary, colors.background.primary]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="scan-outline" size={40} color={colors.error[500]} />
        </View>

        <Text style={styles.title}>No Furniture Found</Text>

        <Text style={styles.reason}>
          {reason || 'We couldn\'t detect any furniture in this image.'}
        </Text>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for Better Results</Text>
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Ionicons name="checkmark" size={14} color={colors.success[600]} />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ScanHome')}
          activeOpacity={0.8}
        >
          <Ionicons name="camera-outline" size={20} color={colors.white} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.error[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
    ...shadows.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  reason: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[8],
    lineHeight: 24,
    paddingHorizontal: spacing[4],
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[8],
    ...shadows.md,
  },
  tipsTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing[5],
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  tipIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    marginTop: 1,
  },
  tipText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text.primary,
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  buttonIcon: {
    marginRight: spacing[2],
  },
  buttonText: {
    ...typography.buttonLarge,
    color: colors.white,
  },
});
