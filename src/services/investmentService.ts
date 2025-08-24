import { apiService, showSuccessToast } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';
import { DEV_CONFIG, shouldUseMockData } from '../utils/devConfig';
import Toast from 'react-native-toast-message';

// Types
export interface InvestmentPlan {
  id: number;
  plan_name: string;
  min_amount: number;
  max_amount: number;
  profit_percentage: number;
  duration: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: number;
  user_id: number;
  plan_id: number;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DepositRequest {
  amount: number;
  transaction_hash?: string;
  crypto_type?: string;
}

export interface WithdrawalRequest {
  amount: number;
  wallet_address: string;
  crypto_type: string;
  password: string;
  otp?: string;
  notes?: string;
}

// Investment Service
export const investmentService = {
  // Get Investment Plans
  async getPlans(): Promise<InvestmentPlan[]> {
    try {
      const response = await apiService.get<InvestmentPlan[]>(API_CONFIG.ENDPOINTS.INVESTMENT.PLANS);
      return response.data;
    } catch (error) {
      // Return mock data for development when API is not available
      if (shouldUseMockData(error)) {
        return DEV_CONFIG.MOCK_PLANS;
      }
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Plans Error',
        text2: `Failed to load investment plans: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
      
      throw error;
    }
  },

  // Get User Investments
  async getInvestments(): Promise<Investment[]> {
    try {
      const response = await apiService.get<Investment[]>(API_CONFIG.ENDPOINTS.INVESTMENT.INVESTMENT);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create Deposit
  async createDeposit(planId: number, depositData: DepositRequest): Promise<any> {
    try {
      const response = await apiService.post(`${API_CONFIG.ENDPOINTS.DEPOSIT.CREATE}/${planId}`, depositData);
      showSuccessToast('Deposit request submitted successfully');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create Withdrawal
  // Request OTP for withdrawal
  async requestOtp(): Promise<any> {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.WITHDRAWAL.OTP);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async createWithdrawal(withdrawalData: WithdrawalRequest): Promise<any> {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.WITHDRAWAL.CREATE, withdrawalData);
      showSuccessToast('Withdrawal request submitted successfully');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get User Deposits
  async getUserDeposits(): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.DEPOSIT.USER_DEPOSITS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get User Withdrawals
  async getUserWithdrawals(): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(API_CONFIG.ENDPOINTS.WITHDRAWAL.USER_WITHDRAWALS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
