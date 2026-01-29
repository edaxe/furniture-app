import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedItem } from '../navigation/types';
import { colors, typography, fontFamily, shadows, borderRadius, spacing } from '../theme';

interface SavedItemCardProps {
  item: SavedItem;
  onDelete: (item: SavedItem) => void;
}

export default function SavedItemCard({ item, onDelete }: SavedItemCardProps) {
  const { furniture, selectedProduct } = item;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const handleOpenLink = () => {
    Linking.openURL(selectedProduct.productUrl).catch(() => {
      Alert.alert('Error', 'Could not open product link');
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: selectedProduct.imageUrl }}
        style={styles.productImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.furnitureType}>{furniture.label}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {selectedProduct.name}
        </Text>
        <Text style={styles.retailer}>{selectedProduct.retailer}</Text>
        <Text style={styles.price}>
          {formatPrice(selectedProduct.price, selectedProduct.currency)}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenLink}>
          <Ionicons name="open-outline" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error[500]} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[100],
  },
  content: {
    flex: 1,
    marginLeft: spacing[3],
    justifyContent: 'center',
  },
  furnitureType: {
    ...typography.overline,
    color: colors.accent[500],
    marginBottom: spacing[1],
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
  actions: {
    justifyContent: 'space-around',
    paddingLeft: spacing[2],
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
