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
import { colors, typography, fontFamily, borderRadius, spacing, shadows } from '../theme';

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
      <View style={styles.emptyIconContainer}>
        <Ionicons name="cube-outline" size={40} color={colors.accent[400]} />
      </View>
      <Text style={styles.emptyTitle}>No Items Yet</Text>
      <Text style={styles.emptySubtitle}>
        Scan furniture and save your favorite products to this room
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
    backgroundColor: colors.background.secondary,
  },
  summaryContainer: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  summaryText: {
    ...typography.label,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing[4],
    paddingTop: spacing[5],
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[5],
    ...shadows.sm,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
