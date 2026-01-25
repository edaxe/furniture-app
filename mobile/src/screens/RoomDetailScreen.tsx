import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import SavedItemCard from '../components/SavedItemCard';
import { ListsStackParamList, SavedItem } from '../navigation/types';
import { useListStore } from '../store/listStore';

type RoomDetailRouteProp = RouteProp<ListsStackParamList, 'RoomDetail'>;

export default function RoomDetailScreen() {
  const route = useRoute<RoomDetailRouteProp>();
  const { roomId, roomName } = route.params;
  const { savedItems, removeItem } = useListStore();

  const roomItems = useMemo(
    () => savedItems.filter((item) => item.roomId === roomId),
    [savedItems, roomId]
  );

  const handleDeleteItem = (item: SavedItem) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${item.selectedProduct.name}" from this room?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeItem(item.id),
        },
      ]
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No items saved</Text>
      <Text style={styles.emptySubtitle}>
        Scan furniture and save matching products to this room
      </Text>
    </View>
  );

  const totalPrice = useMemo(() => {
    return roomItems.reduce((sum, item) => sum + item.selectedProduct.price, 0);
  }, [roomItems]);

  return (
    <View style={styles.container}>
      {roomItems.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {roomItems.length} item{roomItems.length !== 1 ? 's' : ''} • Total:{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(totalPrice)}
          </Text>
        </View>
      )}

      <FlatList
        data={roomItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SavedItemCard item={item} onDelete={handleDeleteItem} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
