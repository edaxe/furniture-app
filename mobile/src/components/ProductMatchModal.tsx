import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { DetectedFurniture, ProductMatch } from '../navigation/types';
import { useListStore } from '../store/listStore';
import { ProductCardSkeleton } from './SkeletonLoader';

interface ProductMatchModalProps {
  visible: boolean;
  onClose: () => void;
  furniture: DetectedFurniture | null;
  exactProducts: ProductMatch[];
  similarProducts: ProductMatch[];
  identifiedProduct: string | null;
  imageUri: string;
  isLoading?: boolean;
}

export default function ProductMatchModal({
  visible,
  onClose,
  furniture,
  exactProducts,
  similarProducts,
  identifiedProduct,
  imageUri,
  isLoading,
}: ProductMatchModalProps) {
  const { rooms, addRoom, saveItem } = useListStore();
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductMatch | null>(null);

  const handleProductPress = async (product: ProductMatch) => {
    try {
      await WebBrowser.openBrowserAsync(product.productUrl);
    } catch {
      Alert.alert('Error', 'Could not open product link');
    }
  };

  const handleSavePress = (product: ProductMatch) => {
    setSelectedProduct(product);
    setShowRoomPicker(true);
  };

  const handleSaveToRoom = async (roomId: string) => {
    if (furniture && selectedProduct) {
      saveItem(roomId, furniture, selectedProduct, imageUri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Item added to your list');
      setShowRoomPicker(false);
      setSelectedProduct(null);
    }
  };

  const handleCreateRoom = () => {
    Alert.prompt(
      'New Room',
      'Enter room name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (name) => {
            if (name?.trim()) {
              const roomId = addRoom(name.trim());
              handleSaveToRoom(roomId);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const renderProductCard = (product: ProductMatch, accentColor: string) => (
    <View key={product.id} style={[styles.productCard, { borderLeftWidth: 3, borderLeftColor: accentColor }]}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.retailer}>{product.retailer}</Text>
        <Text style={styles.price}>
          {formatPrice(product.price, product.currency)}
        </Text>
        <Text style={[styles.similarity, { color: accentColor }]}>
          {Math.round(product.similarity * 100)}% match
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleProductPress(product)}
        >
          <Ionicons name="open-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSavePress(product)}
        >
          <Ionicons name="bookmark-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>
              {furniture?.label || 'Product Matches'}
            </Text>
            {identifiedProduct && (
              <View style={styles.identifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#34C759" />
                <Text style={styles.identifiedBadgeText}>{identifiedProduct}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.productList}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : (
          <ScrollView style={styles.productList}>
            {identifiedProduct && exactProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                  <Text style={styles.sectionHeaderExact}>Exact Match</Text>
                </View>
                {exactProducts.map((product) => renderProductCard(product, '#34C759'))}
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="search" size={18} color="#007AFF" />
                <Text style={styles.sectionHeaderSimilar}>
                  {identifiedProduct ? 'Similar Alternatives' : 'Matching Products'}
                </Text>
              </View>
              {similarProducts.map((product) => renderProductCard(product, '#007AFF'))}
            </View>

            {exactProducts.length === 0 && similarProducts.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No matching products found</Text>
              </View>
            )}
          </ScrollView>
        )}

        <Modal
          visible={showRoomPicker}
          animationType="fade"
          transparent
          onRequestClose={() => setShowRoomPicker(false)}
        >
          <View style={styles.roomPickerOverlay}>
            <View style={styles.roomPickerContainer}>
              <Text style={styles.roomPickerTitle}>Save to Room</Text>
              <ScrollView style={styles.roomList}>
                {rooms.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={styles.roomItem}
                    onPress={() => handleSaveToRoom(room.id)}
                  >
                    <Ionicons name="home-outline" size={20} color="#333" />
                    <Text style={styles.roomName}>{room.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.newRoomButton}
                onPress={handleCreateRoom}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
                <Text style={styles.newRoomText}>Create New Room</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRoomPicker(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  identifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  identifiedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderExact: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34C759',
    marginLeft: 6,
  },
  sectionHeaderSimilar: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
    marginLeft: 6,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  productList: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  retailer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  similarity: {
    fontSize: 11,
    color: '#34C759',
    marginTop: 2,
  },
  actions: {
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  roomPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  roomPickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '60%',
  },
  roomPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  roomList: {
    maxHeight: 200,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    marginLeft: 12,
  },
  newRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  newRoomText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
});
