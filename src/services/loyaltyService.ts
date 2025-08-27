import { apiService } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';

export interface LoyaltyTier {
  id: number;
  name: string;
  days_required: number;
  bonus_percentage: number;
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyProgress {
  current_days: number;
  current_tier: LoyaltyTier | null;
  next_tier: LoyaltyTier | null;
  days_remaining: number;
  progress_percentage: number;
  loyalty_bonus_earned: number;
  all_tiers: LoyaltyTier[];
  first_investment_date: string | null;
  last_withdrawal_date: string | null;
}

export interface LoyaltyResponse {
  status: string;
  data: LoyaltyProgress;
  message?: string;
}

export interface LoyaltyTiersResponse {
  status: string;
  data: LoyaltyTier[];
  message?: string;
}

class LoyaltyService {
  /**
   * Get user's loyalty status and progress
   */
  async getUserLoyalty(): Promise<LoyaltyProgress> {
    try {
      console.log('🔵 Getting user loyalty status...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.LOYALTY.USER_STATUS);
      console.log('🟢 Loyalty response:', response);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.log('🔴 Loyalty error:', error);
      throw error;
    }
  }

  /**
   * Get all loyalty tiers (admin)
   */
  async getAllLoyaltyTiers(): Promise<LoyaltyTier[]> {
    try {
      console.log('🔵 Getting all loyalty tiers...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.LOYALTY.ALL_TIERS);
      console.log('🟢 Loyalty tiers response:', response);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.log('🔴 Loyalty tiers error:', error);
      throw error;
    }
  }

  /**
   * Create new loyalty tier (admin)
   */
  async createLoyaltyTier(data: {
    name: string;
    days_required: number;
    bonus_percentage: number;
    description?: string;
    is_active?: boolean;
  }): Promise<LoyaltyTier> {
    try {
      console.log('🔵 Creating loyalty tier...');
      const response = await apiService.post<any>(API_CONFIG.ENDPOINTS.LOYALTY.ALL_TIERS, data);
      console.log('🟢 Create loyalty tier response:', response);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.log('🔴 Create loyalty tier error:', error);
      throw error;
    }
  }

  /**
   * Update loyalty tier (admin)
   */
  async updateLoyaltyTier(id: number, data: {
    name: string;
    days_required: number;
    bonus_percentage: number;
    description?: string;
    is_active?: boolean;
  }): Promise<LoyaltyTier> {
    try {
      console.log('🔵 Updating loyalty tier...');
      const response = await apiService.put<any>(`${API_CONFIG.ENDPOINTS.LOYALTY.ALL_TIERS}/${id}`, data);
      console.log('🟢 Update loyalty tier response:', response);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.log('🔴 Update loyalty tier error:', error);
      throw error;
    }
  }

  /**
   * Delete loyalty tier (admin)
   */
  async deleteLoyaltyTier(id: number): Promise<void> {
    try {
      console.log('🔵 Deleting loyalty tier...');
      await apiService.delete(`${API_CONFIG.ENDPOINTS.LOYALTY.ALL_TIERS}/${id}`);
      console.log('🟢 Delete loyalty tier successful');
    } catch (error) {
      console.log('🔴 Delete loyalty tier error:', error);
      throw error;
    }
  }

  /**
   * Get loyalty tier by ID (admin)
   */
  async getLoyaltyTier(id: number): Promise<LoyaltyTier> {
    try {
      console.log('🔵 Getting loyalty tier...');
      const response = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.LOYALTY.ALL_TIERS}/${id}`);
      console.log('🟢 Get loyalty tier response:', response);
      
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.log('🔴 Get loyalty tier error:', error);
      throw error;
    }
  }
}

export default new LoyaltyService();
