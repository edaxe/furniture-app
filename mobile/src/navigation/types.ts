import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Scan: NavigatorScreenParams<ScanStackParamList>;
  Lists: NavigatorScreenParams<ListsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
};

export type ScanStackParamList = {
  ScanHome: undefined;
  Results: {
    imageUri: string;
  };
  DetectionFailed: {
    reason?: string;
  };
};

export type ListsStackParamList = {
  ListsHome: undefined;
  RoomDetail: {
    roomId: string;
    roomName: string;
  };
};

export type DetectedFurniture = {
  id: string;
  label: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  description?: string;
  color?: string;
  material?: string;
  style?: string;
  brand?: string;
  modelName?: string;
  identifiedProduct?: string;
};

export type ProductMatch = {
  id: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  retailer: string;
  similarity: number;
};

export type Room = {
  id: string;
  name: string;
  createdAt: string;
  itemCount: number;
};

export type SavedItem = {
  id: string;
  roomId: string;
  furniture: DetectedFurniture;
  selectedProduct: ProductMatch;
  imageUri: string;
  savedAt: string;
};
