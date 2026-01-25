import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import CameraView from '../components/CameraView';
import { ScanStackParamList } from '../navigation/types';
import { useScanStore } from '../store/scanStore';
import { useUserStore } from '../store/userStore';

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
        <Text style={styles.scanCounterText}>
          {scansRemaining} scans remaining
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scanCounter: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  scanCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
