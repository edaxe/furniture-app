import React, { useState } from 'react';
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
import AuthModal from '../components/AuthModal';
import PaywallModal from '../components/PaywallModal';
import { Button } from '../components/ui';
import { ListsStackParamList, Room } from '../navigation/types';
import { useListStore } from '../store/listStore';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { colors, typography, fontFamily, shadows, borderRadius, spacing } from '../theme';

type ListsScreenNavigationProp = NativeStackNavigationProp<ListsStackParamList, 'ListsHome'>;

export default function ListsScreen() {
  const navigation = useNavigation<ListsScreenNavigationProp>();
  const { rooms, addRoom, removeRoom } = useListStore();
  const { isAuthenticated, canCreateRoom, isPremium, roomLimit } = useFeatureAccess();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const handleAddRoom = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Check if user can create more rooms (free tier limit)
    if (!canCreateRoom) {
      setShowPaywallModal(true);
      return;
    }

    // Show room creation prompt
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
      `Are you sure you want to delete "${room.name}"? All saved items will be removed.`,
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

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="bookmark-outline" size={36} color={colors.accent[500]} />
      </View>
      <Text style={styles.emptyTitle}>Start Your Collection</Text>
      <Text style={styles.emptySubtitle}>
        {isAuthenticated
          ? "Create rooms to organize\nthe furniture you discover"
          : "Sign in to create rooms and\nsave the furniture you discover"}
      </Text>
      <Button
        title={isAuthenticated ? "Create First Room" : "Sign In to Start"}
        variant="primary"
        size="large"
        onPress={handleAddRoom}
        icon={
          <Ionicons
            name={isAuthenticated ? "add" : "person"}
            size={20}
            color={colors.white}
          />
        }
      />
    </View>
  );

  const renderHeader = () => {
    if (rooms.length === 0) return null;

    const totalItems = rooms.reduce((acc, r) => acc + r.itemCount, 0);
    const roomLimitText = isPremium ? '' : ` of ${roomLimit}`;

    return (
      <View style={styles.headerSection}>
        <Text style={styles.sectionTitle}>Your Rooms</Text>
        <Text style={styles.sectionSubtitle}>
          {rooms.length}{roomLimitText} room{rooms.length !== 1 ? 's' : ''} • {totalItems} item{totalItems !== 1 ? 's' : ''} saved
        </Text>

        {/* Show upgrade prompt if at room limit */}
        {!isPremium && rooms.length >= roomLimit && (
          <TouchableOpacity
            style={styles.upgradePrompt}
            onPress={() => setShowPaywallModal(true)}
          >
            <Ionicons name="sparkles" size={16} color={colors.accent[500]} />
            <Text style={styles.upgradePromptText}>
              Upgrade to create unlimited rooms
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />

      {rooms.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddRoom} activeOpacity={0.9}>
          <View style={[
            styles.fabInner,
            !canCreateRoom && !isPremium && styles.fabDisabled
          ]}>
            <Ionicons
              name={canCreateRoom || isPremium ? "add" : "lock-closed"}
              size={canCreateRoom || isPremium ? 28 : 22}
              color={colors.white}
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Auth Modal for unauthenticated users */}
      <AuthModal
        visible={showAuthModal}
        onClose={handleAuthModalClose}
        allowDismiss={true}
        title="Sign in to save"
        subtitle="Create an account to save furniture and organize by room"
      />

      {/* Paywall Modal for room limit */}
      <PaywallModal
        visible={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  listContent: {
    padding: spacing[5],
    paddingBottom: 100,
    flexGrow: 1,
  },
  headerSection: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent[50],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    marginTop: spacing[3],
    alignSelf: 'flex-start',
  },
  upgradePromptText: {
    ...typography.caption,
    color: colors.accent[600],
    marginLeft: spacing[2],
    fontFamily: fontFamily.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
    ...shadows.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: spacing[5],
    bottom: spacing[6],
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  fabDisabled: {
    backgroundColor: colors.neutral[400],
  },
});
