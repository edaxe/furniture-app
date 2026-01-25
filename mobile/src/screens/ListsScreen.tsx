import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import RoomCard from '../components/RoomCard';
import { ListsStackParamList, Room } from '../navigation/types';
import { useListStore } from '../store/listStore';

type ListsScreenNavigationProp = NativeStackNavigationProp<ListsStackParamList, 'ListsHome'>;

export default function ListsScreen() {
  const navigation = useNavigation<ListsScreenNavigationProp>();
  const { rooms, addRoom, removeRoom } = useListStore();

  const handleAddRoom = () => {
    Alert.prompt(
      'New Room',
      'Enter a name for this room',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (name) => {
            if (name?.trim()) {
              addRoom(name.trim());
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleRoomPress = (room: Room) => {
    navigation.navigate('RoomDetail', { roomId: room.id, roomName: room.name });
  };

  const handleDeleteRoom = (room: Room) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${room.name}"? All saved items in this room will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeRoom(room.id),
        },
      ]
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="home-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No rooms yet</Text>
      <Text style={styles.emptySubtitle}>
        Create a room to start saving furniture you find
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddRoom}>
        <Text style={styles.emptyButtonText}>Create First Room</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            onPress={handleRoomPress}
            onDelete={handleDeleteRoom}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
      />

      {rooms.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddRoom}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
