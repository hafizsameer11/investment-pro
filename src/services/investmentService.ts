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

export interface UserInvestment {
  id: number;
  plan_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: string;
  days_remaining: number;
  progress_percentage: number;
  total_profit: number;
  daily_profit: number;
  daily_profit_rate: number;
  duration_days: number;
  created_at: string;
}

export interface DepositRequest {
  amount: number;
  transaction_hash?: string;
  crypto_type?: string;
  chain_id?: number;
  notes?: string;
  deposit_picture?: string | null; // For file upload - can be null if no image
}

export interface WithdrawalRequest {
  amount: number;
  wallet_address: string;
  crypto_type: string;
  password: string;
  otp?: string;
  notes?: string;
}
function extractPayload(resp: any) {
  // Handle cases where apiService already returns payload
  // and cases where it's an axios-like { data: ... } wrapper
  const root = resp?.data ?? resp;
  return root?.data ?? root;
}

function toNumber(v: any, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

// Investment Service
export const investmentService = {
  // Get Investment Plans
  async getPlans(): Promise<InvestmentPlan[]> {
    try {
      console.log('🔵 Getting investment plans...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.INVESTMENT.PLANS);
      console.log('🟢 Plans response:', response);
      
      if (response.data && response.data.status === 'success' && response.data.data && Array.isArray(response.data.data)) {
        console.log('🟢 Plans data found:', response.data.data.length, 'plans');
        return response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('🟢 Direct plans data found:', response.data.length, 'plans');
        return response.data;
      } else {
        console.log('🔴 Invalid plans response structure:', response);
        throw new Error('Invalid response structure from plans API');
      }
    } catch (error) {
      console.log('🔴 Plans error:', error);
      
      // Return mock data for development when API is not available
      if (shouldUseMockData(error)) {
        console.log('🟡 Using mock plans data');
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
  async getInvestments(): Promise<UserInvestment[]> {
    try {
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.INVESTMENT.USER_INVESTMENTS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create Deposit (just add money to wallet)
  async createDeposit(depositData: DepositRequest): Promise<any> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('amount', depositData.amount.toString());
      formData.append('crypto_type', depositData.crypto_type || '');
      formData.append('transaction_hash', depositData.transaction_hash || '');
      formData.append('chain_id', (depositData.chain_id || 1).toString());
      formData.append('notes', depositData.notes || '');
      
      // Add image file if exists
      if (depositData.deposit_picture) {
        const imageUri = depositData.deposit_picture;
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('deposit_picture', {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);
      }
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.DEPOSIT.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showSuccessToast('Deposit request submitted successfully');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Activate Plan (use existing balance to start investment)
  async activatePlan(planId: number, amount: number): Promise<any> {
    try {
      console.log('🔵 Activating plan:', { planId, amount });
      const endpoint = `${API_CONFIG.ENDPOINTS.PLAN.ACTIVATE}/${planId}`;
      console.log('🔵 Using endpoint:', endpoint);
      const response = await apiService.post(endpoint, { amount });
      console.log('✅ Plan activation response:', response);
      showSuccessToast('Plan activated successfully');
      return response;
    } catch (error) {
      console.log('🔴 Plan activation error:', error);
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
      const resp = await apiService.get<any>(API_CONFIG.ENDPOINTS.DEPOSIT.USER_DEPOSITS);
      const payload = extractPayload(resp);
      const rows: any[] = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

      // Normalize number/string amounts and relation naming
      return rows.map((t) => ({
        ...t,
        amount: toNumber(t?.amount, 0),
        status: String(t?.status ?? ''),
        investment_plan: t?.investment_plan ?? t?.investmentPlan ?? null,
        created_at: String(t?.created_at ?? ''),
        updated_at: String(t?.updated_at ?? ''),
      }));
    } catch (error) {
      throw error;
    }
  },

  async getUserWithdrawals(): Promise<any[]> {
    try {
      const resp = await apiService.get<any>(API_CONFIG.ENDPOINTS.WITHDRAWAL.USER_WITHDRAWALS);
      const payload = extractPayload(resp);
      const rows: any[] = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      return rows.map((t) => ({
        ...t,
        amount: toNumber(t?.amount, 0),
        status: String(t?.status ?? ''),
        created_at: String(t?.created_at ?? ''),
        updated_at: String(t?.updated_at ?? ''),
      }));
    } catch (error) {
      throw error;
    }
  },
};
