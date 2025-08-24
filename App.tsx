import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PlansScreen from './src/screens/PlansScreen';
import DepositScreen from './src/screens/DepositScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import ReferralsScreen from './src/screens/ReferralsScreen';
import AboutScreen from './src/screens/AboutScreen';
import MiningScreen from './src/screens/MiningScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import MoreScreen from './src/screens/MoreScreen';

// Import auth utilities
import { isAuthenticated } from './src/utils/auth';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigator for More section
function MoreStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="MoreMain" 
        component={MoreScreen} 
        options={{ title: 'More Options' }}
      />
      <Stack.Screen 
        name="Mining" 
        component={MiningScreen} 
        options={{ title: 'Mining' }}
      />
      <Stack.Screen 
        name="TransactionHistory" 
        component={TransactionHistoryScreen} 
        options={{ title: 'Transaction History' }}
      />
      <Stack.Screen 
        name="Referrals" 
        component={ReferralsScreen} 
        options={{ title: 'Referrals' }}
      />
      <Stack.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'About' }}
      />
      <Stack.Screen 
        name="Withdraw" 
        component={WithdrawScreen} 
        options={{ title: 'Withdraw' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Plans') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Deposit') {
            iconName = focused ? 'arrow-down-circle' : 'arrow-down-circle-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Plans" 
        component={PlansScreen}
        options={{ title: 'Plans' }}
      />
      <Tab.Screen 
        name="Deposit" 
        component={DepositScreen}
        options={{ title: 'Deposit' }}
      />
      <Tab.Screen 
        name="More" 
        component={MoreStack}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    checkAuth();
  }, []);

  // Function to update auth state (will be passed to screens)
  const updateAuthState = (token: string | null) => {
    setUserToken(token);
    // Force a re-check of auth state to ensure consistency
    if (token) {
      setTimeout(() => {
        checkAuth();
      }, 100);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    setUserToken(null);
  };

  const checkAuth = async () => {
    try {
      const authenticated = await isAuthenticated();
      setUserToken(authenticated ? 'dummy-token' : null);
    } catch (error) {
      // Silent error handling for auth check
      setUserToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    // You can add a splash screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                initialParams={{ updateAuthState }}
              />
              <Stack.Screen 
                name="Signup" 
                component={SignupScreen}
                initialParams={{ updateAuthState }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}

