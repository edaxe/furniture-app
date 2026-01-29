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
import { colors, typography, fontFamily, shadows, borderRadius, spacing } from '../theme';

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

  const renderProductCard = (product: ProductMatch, matchColor: string) => (
    <View key={product.id} style={styles.productCard}>
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
        <Text style={[styles.similarity, { color: matchColor }]}>
          {Math.round(product.similarity * 100)}% match
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleProductPress(product)}
        >
          <Ionicons name="open-outline" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSavePress(product)}
        >
          <Ionicons name="bookmark-outline" size={20} color={colors.text.secondary} />
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
                <Ionicons name="checkmark-circle" size={14} color={colors.success[500]} />
                <Text style={styles.identifiedBadgeText}>{identifiedProduct}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
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
                <Text style={styles.sectionHeader}>EXACT MATCH</Text>
                {exactProducts.map((product) => renderProductCard(product, colors.success[500]))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionHeader}>
                {identifiedProduct ? 'SIMILAR ALTERNATIVES' : 'MATCHING PRODUCTS'}
              </Text>
              {similarProducts.map((product) => renderProductCard(product, colors.accent[500]))}
            </View>

            {exactProducts.length === 0 && similarProducts.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.neutral[300]} />
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
                    <Ionicons name="home-outline" size={20} color={colors.text.secondary} />
                    <Text style={styles.roomName}>{room.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.newRoomButton}
                onPress={handleCreateRoom}
              >
                <Ionicons name="add" size={20} color={colors.accent[500]} />
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
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing[2],
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
  },
  identifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.md,
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
  identifiedBadgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.success[700],
    marginLeft: spacing[1],
  },
  closeButton: {
    padding: spacing[1],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionHeader: {
    ...typography.overline,
    color: colors.text.tertiary,
    marginBottom: spacing[3],
  },
  productList: {
    flex: 1,
    padding: spacing[4],
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
    padding: spacing[3],
    ...shadows.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[100],
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing[3],
    justifyContent: 'center',
  },
  productName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: spacing[1],
    letterSpacing: 0.1,
  },
  retailer: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  price: {
    ...typography.priceSmall,
    color: colors.text.primary,
  },
  similarity: {
    ...typography.overline,
    marginTop: spacing[1],
  },
  actions: {
    justifyContent: 'center',
    gap: spacing[3],
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.border.light,
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
    ...typography.bodyMedium,
    color: colors.text.tertiary,
    marginTop: spacing[3],
  },
  roomPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[5],
  },
  roomPickerContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    width: '100%',
    maxHeight: '60%',
    ...shadows.lg,
  },
  roomPickerTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  roomList: {
    maxHeight: 200,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[100],
    marginBottom: spacing[2],
  },
  roomName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginLeft: spacing[3],
  },
  newRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    marginTop: spacing[2],
  },
  newRoomText: {
    ...typography.bodyMedium,
    color: colors.accent[500],
    marginLeft: spacing[2],
  },
  cancelButton: {
    padding: spacing[3],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  cancelText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
});
