// Development Configuration
export const DEV_CONFIG = {
  // Enable mock data when backend is not available
USE_MOCK_DATA: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
  
  // Mock data for development
  MOCK_DASHBOARD: {
    total_balance: 12500.00,
    active_plans: 3,
    daily_profit: 125.50,
    referral_bonus_earned: 850.25,
    withdrawal_amount: 2500.75,
  },
  
  MOCK_PLANS: [
    {
      id: 1,
      plan_name: 'Starter Plan',
      min_amount: 100,
      max_amount: 1000,
      profit_percentage: 2.5,
      duration: 30,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      plan_name: 'Growth Plan',
      min_amount: 1000,
      max_amount: 10000,
      profit_percentage: 3.5,
      duration: 60,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      plan_name: 'Premium Plan',
      min_amount: 10000,
      max_amount: 100000,
      profit_percentage: 5.0,
      duration: 90,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  
  MOCK_CHAINS: [
    {
      id: 1,
      type: 'USDT (TRC20)',
      address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      status: 'active',
    },
    {
      id: 2,
      type: 'USDT (ERC20)',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      status: 'active',
    },
    {
      id: 3,
      type: 'Bitcoin (BTC)',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      status: 'active',
    },
    {
      id: 4,
      type: 'Ethereum (ETH)',
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      status: 'active',
    },
    {
      id: 5,
      type: 'Dogecoin (DOGE)',
      address: 'D8j6vFfLhu6LqKto2KQY7iNfLwS9X7Y2Z1',
      status: 'active',
    },
  ],
  
  MOCK_DEPOSITS: [],
  MOCK_WITHDRAWALS: [],
};

// Helper function to check if we should use mock data
export const shouldUseMockData = (error: any): boolean => {
  console.log('🔍 Checking if should use mock data:', {
    USE_MOCK_DATA: DEV_CONFIG.USE_MOCK_DATA,
    errorCode: error.code,
    errorStatus: error.response?.status,
    errorMessage: error.message
  });
  
  if (!DEV_CONFIG.USE_MOCK_DATA) {
    console.log('🟡 Mock data disabled, not using mock data');
    return false;
  }
  
  // Use mock data for network errors or 500 errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
    console.log('🟡 Using mock data due to network error');
    return true;
  }
  if (error.response?.status === 500) {
    console.log('🟡 Using mock data due to 500 error');
    return true;
  }
  if (error.response?.status === 0) {
    console.log('🟡 Using mock data due to network timeout');
    return true;
  }
  
  console.log('🟡 Not using mock data, error does not qualify');
  return false;
};
