import { apiService } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';
import { DEV_CONFIG, shouldUseMockData } from '../utils/devConfig';
import Toast from 'react-native-toast-message';

// Types
export interface Chain {
  id: number;
  type: string;
  address: string;
  status: string;
}

// Chain Service
export const chainService = {
  // Get all available chains/wallet addresses
  async getChains(): Promise<Chain[]> {
    try {
      const response = await apiService.get<Chain[]>(API_CONFIG.ENDPOINTS.CHAIN.ALL_CHAINS);
      return response.data;
    } catch (error) {
      // Return mock data for development when API is not available
      if (shouldUseMockData(error)) {
        return DEV_CONFIG.MOCK_CHAINS;
      }
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Chains Error',
        text2: `Failed to load cryptocurrency chains: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
      
      throw error;
    }
  },

  // Get specific chain by ID
  async getChain(id: number): Promise<Chain> {
    try {
      const response = await apiService.get<Chain>(`${API_CONFIG.ENDPOINTS.CHAIN.CHAIN_DETAIL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error loading chain:', error);
      throw error;
    }
  },
};
