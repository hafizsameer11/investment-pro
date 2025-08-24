import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppData {
  totalBalance: number;
  activePlans: number;
  todaysProfit: number;
  totalProfit: number;
  networkEarnings: number;
  directReferrals: number;
  totalNetwork: number;
  miningSession: {
    startAt: number | null;
    phase: 'idle' | 'starting' | 'running' | 'completed';
    progress: number;
  };
  seenWelcome: boolean;
}

const APP_DATA_KEY = 'appData';

// Default app data
const defaultAppData: AppData = {
  totalBalance: 0,
  activePlans: 0,
  todaysProfit: 0,
  totalProfit: 0,
  networkEarnings: 0,
  directReferrals: 0,
  totalNetwork: 0,
  miningSession: {
    startAt: null,
    phase: 'idle',
    progress: 0,
  },
  seenWelcome: false,
};

// Get app data
export const getAppData = async (): Promise<AppData> => {
  try {
    const data = await AsyncStorage.getItem(APP_DATA_KEY);
    return data ? { ...defaultAppData, ...JSON.parse(data) } : defaultAppData;
      } catch (error) {
      return defaultAppData;
    }
};

// Save app data
export const saveAppData = async (data: Partial<AppData>): Promise<void> => {
  try {
    const currentData = await getAppData();
    const newData = { ...currentData, ...data };
    await AsyncStorage.setItem(APP_DATA_KEY, JSON.stringify(newData));
      } catch (error) {
      // Silent error handling
    }
};

// Update specific fields
export const updateAppData = async (updates: Partial<AppData>): Promise<void> => {
  await saveAppData(updates);
};

// Reset app data
export const resetAppData = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(APP_DATA_KEY, JSON.stringify(defaultAppData));
      } catch (error) {
      // Silent error handling
    }
};
