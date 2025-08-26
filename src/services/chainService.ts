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
      console.log('🔵 Getting chains...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.CHAIN.ALL_CHAINS);
      console.log('🟢 Chains response:', response);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('🟢 Chains data found:', response.data.data.length, 'chains');
        return response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('🟢 Direct chains data found:', response.data.length, 'chains');
        return response.data;
      } else {
        console.log('🔴 Invalid chains response structure:', response);
        throw new Error('Invalid response structure from chains API');
      }
    } catch (error) {
      console.log('🔴 Chains error:', error);
      
      // Return mock data for development when API is not available
      if (shouldUseMockData(error)) {
        console.log('🟡 Using mock chains data');
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
      console.log('🔵 Getting chain with ID:', id);
      const response = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.CHAIN.CHAIN_DETAIL}/${id}`);
      console.log('🟢 Chain response:', response);
      
      if (response.data && response.data.data) {
        console.log('🟢 Chain data found:', response.data.data);
        return response.data.data;
      } else if (response.data) {
        console.log('🟢 Direct chain data found:', response.data);
        return response.data;
      } else {
        console.log('🔴 Invalid chain response structure:', response);
        throw new Error('Invalid response structure from chain API');
      }
    } catch (error) {
      console.log('🔴 Chain error:', error);
      throw error;
    }
  },
};
