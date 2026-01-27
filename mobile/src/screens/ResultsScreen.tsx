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
        <Text style={styles.infoTitle}>
          {detectedFurniture.length} item{detectedFurniture.length !== 1 ? 's' : ''} detected
        </Text>
        <Text style={styles.infoSubtitle}>
          Tap on a highlighted item to see matching products
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
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
