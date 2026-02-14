import { apiClient } from './api';
import { DetectedFurniture, ProductMatch } from '../navigation/types';

interface DetectionResponse {
  detections: DetectedFurniture[];
  session_id: string | null;
}

export interface DetectionResult {
  detections: DetectedFurniture[];
  sessionId: string | null;
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

export async function detectFurniture(imageUri: string): Promise<DetectionResult> {
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

  return {
    detections: response.data?.detections || [],
    sessionId: response.data?.session_id || null,
  };
}

export async function getProductMatches(
  category: string,
  description?: string,
  identifiedProduct?: string,
  color?: string,
  material?: string,
  style?: string,
  brand?: string,
  modelName?: string,
): Promise<ProductMatchResult> {
  let url = `/api/products/match?category=${encodeURIComponent(category)}`;
  if (description) {
    url += `&description=${encodeURIComponent(description)}`;
  }
  if (identifiedProduct) {
    url += `&identified_product=${encodeURIComponent(identifiedProduct)}`;
  }
  if (color) {
    url += `&color=${encodeURIComponent(color)}`;
  }
  if (material) {
    url += `&material=${encodeURIComponent(material)}`;
  }
  if (style) {
    url += `&style=${encodeURIComponent(style)}`;
  }
  if (brand) {
    url += `&brand=${encodeURIComponent(brand)}`;
  }
  if (modelName) {
    url += `&model_name=${encodeURIComponent(modelName)}`;
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

export interface VisualMatchParams {
  sessionId: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  category: string;
  description?: string;
  identifiedProduct?: string;
  color?: string;
  material?: string;
  style?: string;
  brand?: string;
  modelName?: string;
  limit?: number;
}

export async function getProductMatchesVisual(
  params: VisualMatchParams,
): Promise<ProductMatchResult> {
  const body = {
    session_id: params.sessionId,
    bounding_box: params.boundingBox,
    category: params.category,
    description: params.description,
    identified_product: params.identifiedProduct,
    color: params.color,
    material: params.material,
    style: params.style,
    brand: params.brand,
    model_name: params.modelName,
    limit: params.limit ?? 6,
  };

  const response = await apiClient.post<ProductMatchResponse>(
    '/api/products/match',
    body,
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return {
    exactProducts: response.data?.exact_products || [],
    similarProducts: response.data?.similar_products || [],
    identifiedProduct: response.data?.identified_product || null,
  };
}
