import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API GET error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async post<T>(endpoint: string, body: FormData | object): Promise<ApiResponse<T>> {
    try {
      const isFormData = body instanceof FormData;

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: isFormData
          ? {}
          : { 'Content-Type': 'application/json' },
        body: isFormData ? body : JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API POST error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const apiClient = new ApiClient(API_URL);
export { API_URL };
