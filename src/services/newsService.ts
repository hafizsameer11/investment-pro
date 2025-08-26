import { apiService } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';
import Toast from 'react-native-toast-message';

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  type: 'news' | 'update' | 'info';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  created_by?: number;
}

export interface NewsResponse {
  success: boolean;
  message: string;
  data: NewsItem[];
}

// News Service
export const newsService = {
  // Get all active news
  async getNews(): Promise<NewsItem[]> {
    try {
      console.log('🔵 Fetching news from backend');
      
      const response = await apiService.get<NewsResponse>(API_CONFIG.ENDPOINTS.NEWS.ALL);
      
      console.log('🟢 News Response:', response);
      
      if (response.success) {
        return response.data.data as unknown as NewsItem[];
      }
      
      return [];
    } catch (error) {
      console.log('🔴 News Error:', error);
      // Return empty array on error, don't show toast for news
      return [];
    }
  },

  // Get news by type
  async getNewsByType(type: 'news' | 'update' | 'info'): Promise<NewsItem[]> {
    try {
      console.log('🔵 Fetching news by type:', type);
      
      const response = await apiService.get<NewsResponse>(`${API_CONFIG.ENDPOINTS.NEWS.BY_TYPE}/${type}`);
      
      console.log('🟢 News by Type Response:', response);
      
      if (response.success) {
        return response.data.data as unknown as NewsItem[];
      }
      
      return [];
    } catch (error) {
      console.log('🔴 News by Type Error:', error);
      return [];
    }
  },
};
