import { apiService } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';
import { DEV_CONFIG, shouldUseMockData } from '../utils/devConfig';
import Toast from 'react-native-toast-message';

// Types
export interface DashboardData {
  total_balance: number;
  active_plans: number;
  daily_profit: number;
  referral_bonus_earned: number;
  withdrawal_amount: number;
}

export interface AboutData {
  total_users: number;
  active_plans: string;
}

// Dashboard Service
export const dashboardService = {
  // Get Dashboard Data
  async getDashboard(): Promise<{ success: boolean; message: string; data: DashboardData }> {
    try {
      console.log('🔵 Fetching dashboard data from API...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.DASHBOARD.DASHBOARD);
      console.log('✅ Dashboard API response:', response);
      
      // Handle different response structures
      if ((response as any).status === 'success' && response.data) {
        console.log('🟢 Dashboard data found (top-level status):', response.data);
        return {
          success: true,
          message: (response as any).message || 'Dashboard data retrieved successfully',
          data: response.data as DashboardData
        };
      } else if (response.data && (response.data as any).status === 'success' && (response.data as any).data) {
        console.log('🟢 Dashboard data found (nested structure):', (response.data as any).data);
        return {
          success: true,
          message: (response.data as any).message || 'Dashboard data retrieved successfully',
          data: (response.data as any).data as DashboardData
        };
      } else if (response.success && response.data) {
        console.log('🟢 Dashboard data found (direct structure):', response.data);
        return {
          success: true,
          message: response.message || 'Dashboard data retrieved successfully',
          data: response.data as DashboardData
        };
      } else {
        console.log('🔴 Invalid dashboard response structure:', response);
        throw new Error('Invalid response structure from dashboard API');
      }
    } catch (error) {
      console.log('🔴 Dashboard API error:', error);
      
      // Return mock data for development when API is not available
      if (shouldUseMockData(error)) {
        console.log('🟡 Using mock data due to API error');
        return { success: true, message: 'Mock data', data: DEV_CONFIG.MOCK_DASHBOARD };
      }
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Dashboard Error',
        text2: `Failed to load dashboard data: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
      
      throw error;
    }
  },

  // Get About Data
  async getAbout(): Promise<AboutData> {
    try {
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.DASHBOARD.ABOUT);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};
