import { apiClient } from './api';
import { DetectedFurniture, ProductMatch } from '../navigation/types';

interface DetectionResponse {
  detections: DetectedFurniture[];
}

interface ProductMatchResponse {
  products: ProductMatch[];
}

export async function detectFurniture(imageUri: string): Promise<DetectedFurniture[]> {
  const formData = new FormData();

  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  const response = await apiClient.post<DetectionResponse>('/api/detect', formData);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data?.detections || [];
}

export async function getProductMatches(category: string): Promise<ProductMatch[]> {
  const response = await apiClient.get<ProductMatchResponse>(
    `/api/products/match?category=${encodeURIComponent(category)}`
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data?.products || [];
}
