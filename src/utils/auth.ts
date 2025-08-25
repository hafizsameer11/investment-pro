import * as SecureStore from 'expo-secure-store';

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

export interface AuthData {
  token: string;
  user: User;
}

// Auth storage keys
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

// Save auth data
export const saveAuthData = async (token: string, user: User): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
  } catch (error) {
    // Silent error handling
  }
};

// Get auth token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

// Get user data
export const getUserData = async (): Promise<User | null> => {
  try {
    const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};

// Clear auth data (logout)
export const clearAuthData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  } catch (error) {
    // Silent error handling
  }
};

// Save user data only
export const saveUserData = async (user: User): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
  } catch (error) {
    // Silent error handling
  }
};
