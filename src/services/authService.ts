import { apiService, showSuccessToast } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';
import { saveAuthData, clearAuthData } from '../utils/auth';

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
  id: string;
  email: string;
  fullName: string;
  referralCode: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  token_type: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  status: string;
  data: User;
  message: string;
}

// Auth Service
export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response.success) {
        // Save auth data to SecureStore
        await saveAuthData(response.data.token, response.data.user);
        showSuccessToast('Login successful!');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiService.post<RegisterResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.success) {
        showSuccessToast('Registration successful! Please login.');
      }
      
      return response.data;
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
    } catch (error) {
      // Even if API call fails, clear local data
      await clearAuthData();
      throw error;
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
