import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import BoundingBox from '../components/BoundingBox';
import ProductMatchModal from '../components/ProductMatchModal';
import ScanningAnimation from '../components/ScanningAnimation';
import { ScanStackParamList, DetectedFurniture } from '../navigation/types';
import { useScanStore } from '../store/scanStore';
import { detectFurniture, getProductMatches } from '../services/detection';
import { colors, typography, fontFamily, shadows, borderRadius, spacing } from '../theme';

type ResultsScreenRouteProp = RouteProp<ScanStackParamList, 'Results'>;
type ResultsScreenNavigationProp = NativeStackNavigationProp<ScanStackParamList, 'Results'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ResultsScreen() {
  const route = useRoute<ResultsScreenRouteProp>();
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const { imageUri } = route.params;

  const {
    detectedFurniture,
    setDetectedFurniture,
    selectedFurniture,
    setSelectedFurniture,
    exactProducts,
    similarProducts,
    identifiedProduct,
    setProductMatchResult,
    isLoading,
    setIsLoading,
    setError,
  } = useScanStore();

  const [imageSize, setImageSize] = useState({ width: SCREEN_WIDTH, height: 400 });
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    Image.getSize(
      imageUri,
      (width, height) => {
        const aspectRatio = width / height;
        const displayWidth = SCREEN_WIDTH;
        const displayHeight = displayWidth / aspectRatio;
        setImageSize({ width: displayWidth, height: displayHeight });
      },
      () => {
        console.error('Failed to get image size');
      }
    );
  }, [imageUri]);

  useEffect(() => {
    const runDetection = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await detectFurniture(imageUri);
        setDetectedFurniture(results);

        if (results.length === 0) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          navigation.replace('DetectionFailed', {
            reason: 'No furniture detected in this image. Try a clearer photo.',
          });
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Detection failed');
        navigation.replace('DetectionFailed', {
          reason: 'Could not analyze the image. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    runDetection();
  }, [imageUri]);

  const handleFurniturePress = useCallback(
    async (furniture: DetectedFurniture) => {
      setSelectedFurniture(furniture);
      setModalVisible(true);
      setLoadingProducts(true);

      try {
        const result = await getProductMatches(
          furniture.label,
          furniture.description,
          furniture.identifiedProduct,
        );
        setProductMatchResult(result);
      } catch (error) {
        console.error('Failed to get product matches:', error);
        setProductMatchResult({ exactProducts: [], similarProducts: [], identifiedProduct: null });
      } finally {
        setLoadingProducts(false);
      }
    },
    []
  );

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedFurniture(null);
    setProductMatchResult({ exactProducts: [], similarProducts: [], identifiedProduct: null });
  };

  if (isLoading) {
    return <ScanningAnimation message="Analyzing furniture..." />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, { height: imageSize.height }]}>
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, imageSize]}
          resizeMode="contain"
        />

        {detectedFurniture.map((furniture) => (
          <BoundingBox
            key={furniture.id}
            furniture={furniture}
            imageWidth={imageSize.width}
            imageHeight={imageSize.height}
            onPress={handleFurniturePress}
            isSelected={selectedFurniture?.id === furniture.id}
          />
        ))}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoHeader}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{detectedFurniture.length}</Text>
          </View>
          <Text style={styles.infoTitle}>
            Item{detectedFurniture.length !== 1 ? 's' : ''} Detected
          </Text>
        </View>
        <Text style={styles.infoSubtitle}>
          Tap on any highlighted item to discover matching products
        </Text>
      </View>

      <ProductMatchModal
        visible={modalVisible}
        onClose={handleCloseModal}
        furniture={selectedFurniture}
        exactProducts={exactProducts}
        similarProducts={similarProducts}
        identifiedProduct={identifiedProduct}
        imageUri={imageUri}
        isLoading={loadingProducts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: colors.text.primary,
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  infoContainer: {
    padding: spacing[6],
    paddingTop: spacing[5],
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl + 4,
    borderTopRightRadius: borderRadius.xl + 4,
    marginTop: -spacing[6],
    ...shadows.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  countText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.white,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  infoSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
});
