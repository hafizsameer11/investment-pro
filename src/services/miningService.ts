import { apiService, showSuccessToast } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';

// Types
export interface MiningStatus {
  status: 'idle' | 'active' | 'completed' | 'stopped';
  progress: number;
  time_remaining: number;
  started_at?: string;
  reward?: number;
}

export interface MiningSession {
  id: number;
  user_id: number;
  started_at: string;
  stopped_at?: string;
  status: string;
  progress: number;
  rewards_claimed: boolean;
  created_at: string;
  updated_at: string;
}

// Mining Service
export const miningService = {
  // Start mining session
  async startMining(): Promise<MiningSession> {
    try {
      const response = await apiService.post<any>(API_CONFIG.ENDPOINTS.MINING.START);
      showSuccessToast('Mining session started successfully!');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get mining status
  async getMiningStatus(): Promise<MiningStatus> {
    try {
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.MINING.STATUS);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Stop mining session
  async stopMining(): Promise<MiningSession> {
    try {
      const response = await apiService.post<any>(API_CONFIG.ENDPOINTS.MINING.STOP);
      showSuccessToast('Mining session stopped successfully!');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Claim mining rewards
  async claimRewards(): Promise<MiningSession> {
    try {
      const response = await apiService.post<any>(API_CONFIG.ENDPOINTS.MINING.CLAIM_REWARDS);
      showSuccessToast('Mining rewards claimed successfully!');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};
