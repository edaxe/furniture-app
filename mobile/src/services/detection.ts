import { apiClient } from './api';
import { DetectedFurniture, ProductMatch } from '../navigation/types';

interface DetectionResponse {
  detections: DetectedFurniture[];
}

interface ProductMatchResponse {
  products: ProductMatch[];
  exact_products: ProductMatch[];
  similar_products: ProductMatch[];
  identified_product: string | null;
}

export interface ProductMatchResult {
  exactProducts: ProductMatch[];
  similarProducts: ProductMatch[];
  identifiedProduct: string | null;
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

export async function getProductMatches(
  category: string,
  description?: string,
  identifiedProduct?: string,
): Promise<ProductMatchResult> {
  let url = `/api/products/match?category=${encodeURIComponent(category)}`;
  if (description) {
    url += `&description=${encodeURIComponent(description)}`;
  }
  if (identifiedProduct) {
    url += `&identified_product=${encodeURIComponent(identifiedProduct)}`;
  }

  const response = await apiClient.get<ProductMatchResponse>(url);

  if (response.error) {
    throw new Error(response.error);
  }

  return {
    exactProducts: response.data?.exact_products || [],
    similarProducts: response.data?.similar_products || [],
    identifiedProduct: response.data?.identified_product || null,
  };
}
