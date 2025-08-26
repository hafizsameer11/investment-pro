import { apiService } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';

export interface Transaction {
  id: number;
  user_id: number;
  type: string; // 'deposit', 'withdrawal', 'investment', 'profit', 'referral'
  amount: number;
  status: string; // 'pending', 'completed', 'failed'
  description: string;
  created_at: string;
  updated_at: string;
}

export interface UserTransaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

export interface RawTransaction {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  deposit_id?: number;
  withdrawal_id?: number;
  deposit?: {
    id: number;
    amount: number;
    status: string;
    chain_id: number;
    investment_plan_id?: number;
    deposit_date: string;
    deposit_picture: string;
    created_at: string;
    updated_at: string;
    user_id: number;
  } | null;
  withdrawal?: {
    id: number;
    amount: number;
    status: string;
    created_at: string;
    updated_at: string;
    user_id: number;
  } | null;
}

export const transactionService = {
  /**
   * Get user's recent transactions
   */
  async getUserTransactions(): Promise<UserTransaction[]> {
    try {
      console.log('🔵 Getting user transactions...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.TRANSACTION.USER_TRANSACTIONS);
      console.log('🟢 User transactions response:', response);
      
      let transactions: UserTransaction[] = [];
      
      // Handle different response structures
      if ((response as any).status === 'success' && response.data && Array.isArray(response.data)) {
        console.log('🟢 User transactions data found (top-level status):', response.data.length, 'transactions');
        transactions = response.data as unknown as UserTransaction[];
      } else if (response.data && (response.data as any).status === 'success' && (response.data as any).data && Array.isArray((response.data as any).data)) {
        console.log('🟢 User transactions data found (nested structure):', (response.data as any).data.length, 'transactions');
        transactions = (response.data as any).data as unknown as UserTransaction[];
      } else if (response.data && Array.isArray(response.data)) {
        console.log('🟢 Direct user transactions data found:', response.data.length, 'transactions');
        transactions = response.data as unknown as UserTransaction[];
      } else {
        console.log('🔴 Invalid user transactions response structure:', response);
        return [];
      }

      console.log('🟢 Processed transactions:', transactions);
      return transactions;
    } catch (error) {
      console.log('🔴 User transactions error:', error);
      return [];
    }
  },

  /**
   * Get all transactions (admin)
   */
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      console.log('🔵 Getting all transactions...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.TRANSACTION.ALL_TRANSACTIONS);
      console.log('🟢 All transactions response:', response);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('🟢 All transactions data found:', response.data.data.length, 'transactions');
        return response.data.data as unknown as Transaction[];
      } else if (response.data && Array.isArray(response.data)) {
        console.log('🟢 Direct all transactions data found:', response.data.length, 'transactions');
        return response.data as unknown as Transaction[];
      } else {
        console.log('🔴 Invalid all transactions response structure:', response);
        return [];
      }
    } catch (error) {
      console.log('🔴 All transactions error:', error);
      return [];
    }
  },

  /**
   * Get recent transactions (last 5)
   */
  async getRecentTransactions(): Promise<UserTransaction[]> {
    try {
      const transactions = await this.getUserTransactions();
      console.log('🔵 Raw transactions for recent:', transactions);
      
      // Filter out any malformed transactions and return only the last 5
      const validTransactions = transactions.filter(transaction => 
        transaction && 
        typeof transaction === 'object' && 
        transaction.id && 
        transaction.type && 
        transaction.type !== 'unknown' &&
        transaction.amount !== undefined &&
        transaction.amount > 0
      );
      
      console.log('🟢 Valid transactions for recent:', validTransactions);
      return validTransactions.slice(0, 5);
    } catch (error) {
      console.log('🔴 Recent transactions error:', error);
      return [];
    }
  },
};
