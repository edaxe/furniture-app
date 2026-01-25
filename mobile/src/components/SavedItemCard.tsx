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
          <Ionicons name="open-outline" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  furnitureType: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
    marginBottom: 4,
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
    color: '#333',
  },
  actions: {
    justifyContent: 'space-around',
    paddingLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
