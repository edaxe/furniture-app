import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Room, SavedItem, DetectedFurniture, ProductMatch } from '../navigation/types';

interface ListState {
  rooms: Room[];
  savedItems: SavedItem[];

  addRoom: (name: string) => string;
  removeRoom: (roomId: string) => void;
  renameRoom: (roomId: string, name: string) => void;

  saveItem: (
    roomId: string,
    furniture: DetectedFurniture,
    product: ProductMatch,
    imageUri: string
  ) => void;
  removeItem: (itemId: string) => void;

  getItemsByRoom: (roomId: string) => SavedItem[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useListStore = create<ListState>()(
  persist(
    (set, get) => ({
      rooms: [],
      savedItems: [],

      addRoom: (name) => {
        const id = generateId();
        const newRoom: Room = {
          id,
          name,
          createdAt: new Date().toISOString(),
          itemCount: 0,
        };
        set((state) => ({
          rooms: [...state.rooms, newRoom],
        }));
        return id;
      },

      removeRoom: (roomId) => {
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== roomId),
          savedItems: state.savedItems.filter((i) => i.roomId !== roomId),
        }));
      },

      renameRoom: (roomId, name) => {
        set((state) => ({
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, name } : r
          ),
        }));
      },

      saveItem: (roomId, furniture, product, imageUri) => {
        const id = generateId();
        const newItem: SavedItem = {
          id,
          roomId,
          furniture,
          selectedProduct: product,
          imageUri,
          savedAt: new Date().toISOString(),
        };
        set((state) => ({
          savedItems: [...state.savedItems, newItem],
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, itemCount: r.itemCount + 1 } : r
          ),
        }));
      },

      removeItem: (itemId) => {
        const item = get().savedItems.find((i) => i.id === itemId);
        if (!item) return;

        set((state) => ({
          savedItems: state.savedItems.filter((i) => i.id !== itemId),
          rooms: state.rooms.map((r) =>
            r.id === item.roomId ? { ...r, itemCount: Math.max(0, r.itemCount - 1) } : r
          ),
        }));
      },

      getItemsByRoom: (roomId) => {
        return get().savedItems.filter((i) => i.roomId === roomId);
      },
    }),
    {
      name: 'list-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
