import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../navigation/types';
import { colors, typography, shadows, borderRadius, spacing } from '../theme';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
  onDelete: (room: Room) => void;
}

const roomIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  living: 'tv-outline',
  bedroom: 'bed-outline',
  kitchen: 'restaurant-outline',
  bathroom: 'water-outline',
  office: 'desktop-outline',
  dining: 'cafe-outline',
  default: 'home-outline',
};

const getRoomIcon = (roomName: string): keyof typeof Ionicons.glyphMap => {
  const lowerName = roomName.toLowerCase();
  for (const [key, icon] of Object.entries(roomIcons)) {
    if (lowerName.includes(key)) return icon;
  }
  return roomIcons.default;
};

export default function RoomCard({ room, onPress, onDelete }: RoomCardProps) {
  const icon = getRoomIcon(room.name);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(room)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={colors.accent[500]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{room.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {room.itemCount} {room.itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(room)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.neutral[400]} />
        </TouchableOpacity>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={18} color={colors.neutral[300]} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
