import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  Text,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import BoundingBox from '../components/BoundingBox';
import ProductMatchModal from '../components/ProductMatchModal';
import { ScanStackParamList, DetectedFurniture, ProductMatch } from '../navigation/types';
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
    productMatches,
    setProductMatches,
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
          navigation.replace('DetectionFailed', {
            reason: 'No furniture detected in this image. Try a clearer photo.',
          });
        }
      } catch (error) {
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
        const matches = await getProductMatches(furniture.label);
        setProductMatches(matches);
      } catch (error) {
        console.error('Failed to get product matches:', error);
        setProductMatches([]);
      } finally {
        setLoadingProducts(false);
      }
    },
    []
  );

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedFurniture(null);
    setProductMatches([]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing furniture...</Text>
        <Text style={styles.loadingSubtext}>This may take a moment</Text>
      </View>
    );
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
        products={productMatches}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
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
