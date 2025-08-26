import { apiService } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';

export interface ReferralUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  status: string;
}

export interface ReferralStats {
  total_referrals: number;
  total_earnings: number;
  referral_code: string;
  per_user_bonus: number;
  level_1_referrals: number;
  level_2_referrals: number;
  level_3_referrals: number;
  level_4_referrals: number;
  level_5_referrals: number;
}

export interface ReferralNetworkNode {
  id: number;
  name: string;
  email: string;
  user_code: string;
  level: number;
  joined_at: string;
  status: string;
  sub_referrals: ReferralNetworkNode[];
}

export interface ReferralData {
  referrals: ReferralUser[];
  stats: {
    total_referrals: number;
    total_earnings: number;
    referral_code: string;
  };
}

export const referralService = {
  /**
   * Get users who joined with the current user's referral code
   */
  async getMyReferrals(): Promise<ReferralData> {
    try {
      console.log('🔵 Getting my referrals...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.REFERRAL.MY_REFERRALS);
      console.log('🟢 Referrals response:', response);
      
      // Handle different API response structures
      const payload = response?.data;
      const rows = Array.isArray(payload?.data) ? payload.data
                 : Array.isArray(payload) ? payload
                 : [];
      
      return {
        referrals: rows,
        stats: {
          total_referrals: rows.length,
          total_earnings: 0,
          referral_code: '',
        }
      };
    } catch (error) {
      console.log('🔴 Referrals error:', error);
      throw error;
    }
  },

  /**
   * Get multi-level referral network
   */
  async getReferralNetwork(): Promise<ReferralNetworkNode[]> {
    try {
      console.log('🔵 Getting referral network...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.REFERRAL.NETWORK);
      console.log('🟢 Network response:', response);
      
      // Handle different API response structures
      const payload = response?.data?.data ?? response?.data ?? {};
      const level1 = Array.isArray(payload.level1) ? payload.level1 : [];
      
      return level1.map((item: any) => ({
        id: item.id || 0,
        name: item.user?.name || item.name || '',
        email: item.user?.email || item.email || '',
        user_code: item.user?.user_code || item.user_code || '',
        level: 1,
        joined_at: item.created_at || item.joined_at || '',
        status: item.user?.status || item.status || '',
        sub_referrals: [],
      }));
    } catch (error) {
      console.log('🔴 Network error:', error);
      throw error;
    }
  },

  /**
   * Get referral statistics
   */
  async getReferralStats(): Promise<ReferralStats> {
    try {
      console.log('🔵 Getting referral stats...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.REFERRAL.STATS);
      console.log('🟢 Stats response:', response);
      
      // Handle different API response structures
      const payload = response?.data?.data ?? response?.data ?? {};
      
      return {
        total_referrals: Number(payload.totalReferrals ?? 0),
        total_earnings: Number(payload.totalEarnings ?? 0),
        referral_code: payload.referral_code ?? '',
        per_user_bonus: Number(payload.perUserBonus ?? 0),
        level_1_referrals: Number(payload.activeReferrals ?? 0),
        level_2_referrals: 0,
        level_3_referrals: 0,
        level_4_referrals: 0,
        level_5_referrals: 0,
      };
    } catch (error) {
      console.log('🔴 Stats error:', error);
      throw error;
    }
  },
};
