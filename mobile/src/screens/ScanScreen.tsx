import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import CameraView from '../components/CameraView';
import { ScanStackParamList } from '../navigation/types';
import { useScanStore } from '../store/scanStore';
import { useUserStore } from '../store/userStore';
import { colors, typography, fontFamily, borderRadius, spacing } from '../theme';

type ScanScreenNavigationProp = NativeStackNavigationProp<ScanStackParamList, 'ScanHome'>;

export default function ScanScreen() {
  const navigation = useNavigation<ScanScreenNavigationProp>();
  const { setCurrentImage } = useScanStore();
  const { scansRemaining, decrementScans } = useUserStore();

  const checkScanLimit = (): boolean => {
    if (scansRemaining <= 0) {
      Alert.alert(
        'Scan Limit Reached',
        'You have used all your free scans for this month. Upgrade to Pro for unlimited scans.',
        [
          { text: 'OK', style: 'cancel' },
        ]
      );
      return false;
    }
    return true;
  };

  const handleCapture = (uri: string) => {
    if (!checkScanLimit()) return;

    setCurrentImage(uri);
    decrementScans();
    navigation.navigate('Results', { imageUri: uri });
  };

  const handleGalleryPress = async () => {
    if (!checkScanLimit()) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCurrentImage(result.assets[0].uri);
      decrementScans();
      navigation.navigate('Results', { imageUri: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView onCapture={handleCapture} onGalleryPress={handleGalleryPress} />

      <View style={styles.scanCounter}>
        <View style={styles.scanCounterBadge}>
          <Text style={styles.scanCounterNumber}>{scansRemaining}</Text>
        </View>
        <Text style={styles.scanCounterText}>scans left</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text.primary,
  },
  scanCounter: {
    position: 'absolute',
    top: 60,
    left: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    paddingLeft: spacing[1],
    paddingRight: spacing[4],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    gap: spacing[2],
  },
  scanCounterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCounterNumber: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.white,
  },
  scanCounterText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.2,
  },
});
