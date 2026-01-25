import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../navigation/types';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
  onDelete: (room: Room) => void;
}

export default function RoomCard({ room, onPress, onDelete }: RoomCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(room)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="home-outline" size={24} color="#007AFF" />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{room.name}</Text>
        <Text style={styles.count}>
          {room.itemCount} item{room.itemCount !== 1 ? 's' : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(room)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  count: {
    fontSize: 13,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
});
