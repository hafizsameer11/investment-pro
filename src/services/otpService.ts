import { apiService } from './apiService';
import { API_CONFIG } from '../utils/apiConfig';
import Toast from 'react-native-toast-message';

export interface OtpRequest {
  email: string;
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
  type: 'signup' | 'login' | 'withdrawal';
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expires_in?: number;
}

// OTP Service
export const otpService = {
  // Send OTP for signup
  async sendSignupOtp(email: string): Promise<OtpResponse> {
    try {
      console.log('🔵 Sending signup OTP:', { email });
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.OTP.SEND_SIGNUP, { email });
      
      console.log('🟢 Signup OTP Response:', response);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Verification code sent to your email',
          position: 'top',
          visibilityTime: 3000,
        });
      }
      
      return response;
    } catch (error) {
      console.log('🔴 Signup OTP Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      Toast.show({
        type: 'error',
        text1: 'OTP Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
      throw error;
    }
  },

  // Send OTP for login
  async sendLoginOtp(email: string): Promise<OtpResponse> {
    try {
      console.log('🔵 Sending login OTP:', { email });
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.OTP.SEND_LOGIN, { email });
      
      console.log('🟢 Login OTP Response:', response);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Verification code sent to your email',
          position: 'top',
          visibilityTime: 3000,
        });
      }
      
      return response;
    } catch (error) {
      console.log('🔴 Login OTP Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      Toast.show({
        type: 'error',
        text1: 'OTP Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
      throw error;
    }
  },

  // Send OTP for withdrawal
  async sendWithdrawalOtp(): Promise<OtpResponse> {
    try {
      console.log('🔵 Sending withdrawal OTP');
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.OTP.SEND_WITHDRAWAL);
      
      console.log('🟢 Withdrawal OTP Response:', response);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Verification code sent to your email',
          position: 'top',
          visibilityTime: 3000,
        });
      }
      
      return response;
    } catch (error) {
      console.log('🔴 Withdrawal OTP Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      Toast.show({
        type: 'error',
        text1: 'OTP Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
      throw error;
    }
  },

  // Verify OTP
  async verifyOtp(email: string, otp: string, type: 'signup' | 'login' | 'withdrawal'): Promise<OtpResponse> {
    try {
      console.log('🔵 Verifying OTP:', { email, otp, type });
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.OTP.VERIFY, {
        email,
        otp,
        type
      });
      
      console.log('🟢 OTP Verification Response:', response);
      
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: 'Verification successful',
          position: 'top',
          visibilityTime: 3000,
        });
      }
      
      return response;
    } catch (error) {
      console.log('🔴 OTP Verification Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      Toast.show({
        type: 'error',
        text1: 'Verification Error',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 4000,
      });
      throw error;
    }
  },
};
