import { create } from 'zustand';
import { DetectedFurniture, ProductMatch } from '../navigation/types';

interface ScanState {
  currentImage: string | null;
  detectedFurniture: DetectedFurniture[];
  selectedFurniture: DetectedFurniture | null;
  productMatches: ProductMatch[];
  isLoading: boolean;
  error: string | null;

  setCurrentImage: (uri: string | null) => void;
  setDetectedFurniture: (furniture: DetectedFurniture[]) => void;
  setSelectedFurniture: (furniture: DetectedFurniture | null) => void;
  setProductMatches: (products: ProductMatch[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearScan: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  currentImage: null,
  detectedFurniture: [],
  selectedFurniture: null,
  productMatches: [],
  isLoading: false,
  error: null,

  setCurrentImage: (uri) => set({ currentImage: uri }),
  setDetectedFurniture: (furniture) => set({ detectedFurniture: furniture }),
  setSelectedFurniture: (furniture) => set({ selectedFurniture: furniture }),
  setProductMatches: (products) => set({ productMatches: products }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearScan: () =>
    set({
      currentImage: null,
      detectedFurniture: [],
      selectedFurniture: null,
      productMatches: [],
      isLoading: false,
      error: null,
    }),
}));
