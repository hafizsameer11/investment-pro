import axios from 'axios';
import { API_CONFIG } from '../utils/apiConfig';
import Toast from 'react-native-toast-message';

// Create a separate axios instance for password reset (no auth required)
const passwordResetApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Password Reset Service (no authentication required)
export const passwordResetService = {
  // Send password reset OTP
  async sendPasswordResetOtp(email: string): Promise<any> {
    try {
      console.log('🔵 Sending password reset OTP for:', email);
      
      const response = await passwordResetApi.post(API_CONFIG.ENDPOINTS.AUTH.SEND_RESET_OTP, { email });
      
      console.log('🟢 Password reset OTP response:', response.data);
      
      if (response.data.status === 'success' || response.data.success === true) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Please check your email for the verification code',
        });
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.log('🔴 Password reset OTP error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    }
  },

  // Verify password reset OTP
  async verifyPasswordResetOtp(email: string, otp: string): Promise<any> {
    try {
      console.log('🔵 Verifying password reset OTP for:', email);
      
      const response = await passwordResetApi.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_RESET_OTP, { email, otp });
      
      console.log('🟢 Password reset OTP verification response:', response.data);
      
      if (response.data.status === 'success' || response.data.success === true) {
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: 'Please enter your new password',
        });
        return response.data;
      } else {
        throw new Error(response.data.message || 'Invalid OTP');
      }
    } catch (error: any) {
      console.log('🔴 Password reset OTP verification error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    }
  },

  // Reset password
  async resetPassword(data: { email: string; otp: string; password: string; password_confirmation: string }): Promise<any> {
    try {
      console.log('🔵 Resetting password for:', data.email);
      
      const response = await passwordResetApi.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, data);
      
      console.log('🟢 Password reset response:', response.data);
      
      if (response.data.status === 'success' || response.data.success === true) {
        Toast.show({
          type: 'success',
          text1: 'Password Reset',
          text2: 'Your password has been reset successfully',
        });
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.log('🔴 Password reset error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
      throw error;
    }
  },
};


