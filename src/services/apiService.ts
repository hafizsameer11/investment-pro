import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import { API_CONFIG } from '../utils/apiConfig';
import * as SecureStore from 'expo-secure-store';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.DEFAULT_HEADERS,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        console.log('🔵 API Request:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 10)}...` : 'none',
          headers: config.headers
        });
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('✅ API Response:', {
          url: response.config.url,
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error: AxiosError) => {
        console.log('🔴 API Error Response:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data
        });
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // Handle logout on authentication errors
  private async handleLogout() {
    try {
      await SecureStore.deleteItemAsync('authToken');
      // Navigate to login - this will be handled by the App component
      // You can add navigation logic here if needed
    } catch (error) {
      console.log('Error clearing auth token:', error);
    }
  }

  // Normalize API response to handle both success formats
  private normalizeResponse(resp: any) {
    const r = resp.data || {};
    const success = typeof r.success === 'boolean' ? r.success : (r.status === 'success');
    const message = r.message ?? '';
    const data = r.data ?? r.result ?? null;
    return { success, message, data, raw: r };
  }

  // Error handling with toast notifications
  private handleApiError(error: AxiosError) {
    let message = 'Something went wrong. Please try again.';
    let status = 500;
    let title = 'Error';

    // Console log for debugging
    console.log('🔴 API Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    if (error.response) {
      status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          title = 'Authentication Error';
          message = 'Session expired. Please login again.';
          // Handle logout and redirect to login
          this.handleLogout();
          break;
        case 403:
          title = 'Access Denied';
          message = 'You don\'t have permission to perform this action.';
          break;
        case 404:
          title = 'Not Found';
          message = 'The requested resource was not found.';
          break;
        case 422:
          title = 'Validation Error';
          message = this.formatValidationErrors(data.errors);
          break;
        case 429:
          title = 'Rate Limited';
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          title = 'Server Error';
          message = 'Internal server error. Please try again later.';
          break;
        default:
          title = `Error ${status}`;
          message = data?.message || `Server returned error ${status}`;
      }
    } else if (error.request) {
      title = 'Network Error';
      message = 'Unable to connect to server. Please check your internet connection.';
    } else {
      title = 'Request Error';
      message = error.message || 'An unexpected error occurred.';
    }

    // Only show toast for critical errors (auth, network)
    // Let individual services handle their own error messages
    if (status === 401 || status === 403 || error.request) {
      Toast.show({
        type: 'error',
        text1: title,
        text2: message,
        position: 'top',
        visibilityTime: 5000,
      });
    }
  }

  // Format validation errors from Laravel
  private formatValidationErrors(errors: Record<string, string[]> | undefined): string {
    if (!errors) return 'Validation failed.';
    console.log(errors);
    
    const errorMessages = Object.values(errors).flat();
    return errorMessages.join(', ');
  }

  // Generic GET request
  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      console.log('🔵 API POST Request:', {
        url: `${this.api.defaults.baseURL}${endpoint}`,
        data: data,
        headers: config?.headers || this.api.defaults.headers
      });
      
      const response = await this.api.post(endpoint, data, config);
      
      console.log('🟢 API POST Response:', {
        status: response.status,
        data: response.data,
        success: response.data?.success
      });
      
      return response.data;
    } catch (error) {
      console.log('🔴 API POST Error:', error);
      throw error;
    }
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // File upload
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Success toast helper
export const showSuccessToast = (message: string) => {
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

// Info toast helper
export const showInfoToast = (message: string) => {
  Toast.show({
    type: 'info',
    text1: 'Info',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};
