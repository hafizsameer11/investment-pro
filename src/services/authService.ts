import { apiService, showSuccessToast } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';
import { saveAuthData, clearAuthData, isAuthenticated } from '../utils/auth';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  referral_code?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  referral_code?: string;
  role: string;
  status: string;
  user_code: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
  email_verified_at?: string;
}

export interface LoginResponse {
  status: string; // "success" or "error"
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  status: string;
  data: User;
  message: string;
}

// Auth Service
export const authService = {
  // Callback to notify when auth state changes
  onAuthStateChange: null as ((token: string | null) => void) | null,
  // Login
  async login(credentials: LoginRequest): Promise<{ token: string; user: User }> {
    try {
      console.log('🔵 Login Request:', {
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        credentials: { ...credentials, password: '[HIDDEN]' }
      });

      const response = await apiService.post<any>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      
      console.log('🟢 Login Response:', response);
      
      // Simple approach - cast to any to avoid TypeScript issues
      const simpleResponse = response as any;
      console.log('🟢 Simple Response Check:', {
        hasToken: !!simpleResponse.token,
        hasUser: !!simpleResponse.user,
        status: simpleResponse.status
      });
      
      if (simpleResponse.status === true && simpleResponse.token) {
        // Save auth data to SecureStore
        await saveAuthData(simpleResponse.token, simpleResponse.user);
        showSuccessToast('Login successful!');
        
        // Notify auth state change
        if (authService.onAuthStateChange) {
          authService.onAuthStateChange(simpleResponse.token);
        }
        
        return {
          token: simpleResponse.token,
          user: simpleResponse.user
        };
      } else {
        throw new Error(simpleResponse.message || 'Login failed');
      }
    } catch (error) {
      console.log('🔴 Login Error:', error);
      throw error;
    }
  },

  // Register
  async register(userData: RegisterRequest): Promise<any> {
    try {
      const response = await apiService.post<RegisterResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.success) {
        showSuccessToast('Registration successful! Please login.');
      }
      
      return response; // Return the full response, not just data
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      await clearAuthData();
      showSuccessToast('Logged out successfully');
      
      // Notify auth state change
      if (authService.onAuthStateChange) {
        authService.onAuthStateChange(null);
      }
    } catch (error) {
      // Even if API call fails, clear local data
      await clearAuthData();
      showSuccessToast('Logged out successfully');
      
      // Notify auth state change even on error
      if (authService.onAuthStateChange) {
        authService.onAuthStateChange(null);
      }
      // Don't throw error since we want to logout even if API fails
    }
  },

  // Get Profile
  async getProfile(): Promise<User> {
    try {
      const response = await apiService.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      return response.data; // Backend returns user data
    } catch (error) {
      throw error;
    }
  },

  // Update Profile
  async updateProfile(userData: Partial<User>): Promise<any> {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.UPDATE, userData);
      showSuccessToast('Profile updated successfully');
      return response;
    } catch (error) {
      throw error;
    }
  },
};
