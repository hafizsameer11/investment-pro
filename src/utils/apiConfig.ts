// API Configuration
export const API_CONFIG = {
  // Production API URL
  BASE_URL: 'https://investpro.hmstech.xyz/api',
  API_VERSION: '',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/login',
      REGISTER: '/register',
      LOGOUT: '/logout',
      PROFILE: '/profile',
      UPDATE: '/update',
      KYC: '/kyc',
    },
    DASHBOARD: {
      DASHBOARD: '/dashboard',
      ABOUT: '/about',
    },
    INVESTMENT: {
      PLANS: '/investment_plan',
      INVESTMENT: '/investment',
      USER_INVESTMENTS: '/investment',
    },
    DEPOSIT: {
      CREATE: '/deposits',
      APPROVAL: '/approval-deposits',
      USER_DEPOSITS: '/user-deposits',
    },
    PLAN: {
      ACTIVATE: '/activate-plan',
    },
    WITHDRAWAL: {
      CREATE: '/withdrawal',
      OTP: '/withdrawals/otp',
      APPROVAL: '/approval-withdrawal',
      USER_WITHDRAWALS: '/user-withdrawals',
    },
    TRANSACTION: {
      USER_TRANSACTIONS: '/single-transaction',
      ALL_TRANSACTIONS: '/all-transaction',
    },
    CONTACT: {
      CONTACT: '/contact',
    },
    USER: {
      ALL_USERS: '/allUser',
    },
    CHAIN: {
      ALL_CHAINS: '/chains',
      CHAIN_DETAIL: '/chains',
    },
    MINING: {
      START: '/mining/start',
      STATUS: '/mining/status',
      STOP: '/mining/stop',
      CLAIM_REWARDS: '/mining/claim-rewards',
    },
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token: string) => {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Authorization': `Bearer ${token}`,
  };
};
