import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input } from '../components/UI';
import { authService } from '../services/authService';
import { otpService } from '../services/otpService';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginScreenProps {
  navigation: any;
  route: any;
}

export default function LoginScreen({ navigation, route }: LoginScreenProps) {
  const { updateAuthState } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleSendOtp = async () => {
    const email = getValues('email');
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address first');
      return;
    }

    setOtpLoading(true);
    try {
      await otpService.sendLoginOtp(email);
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Verification code has been sent to your email');
    } catch (error) {
      // Error is already handled in otpService
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    if (!otpSent) {
      Alert.alert('Error', 'Please send and verify OTP first');
      return;
    }

    console.log('🔵 Login Form Submit:', { email: data.email, password: '[HIDDEN]', otp: '[HIDDEN]' });
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      console.log('🟢 Login Success Response:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
        tokenType: typeof response.token
      });
      
      // Update auth state to trigger navigation to main app
      if (updateAuthState && response.token) {
        updateAuthState(response.token);
      }
      // Show success message briefly before redirect
      setTimeout(() => {
        // The redirect will happen automatically via App.tsx state change
      }, 500);
    } catch (error) {
      console.log('🔴 Login Screen Error:', error);
      Alert.alert('Error', 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="logo-bitcoin" size={64} color="#0EA5E9" />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your InvestPro account</Text>
      </View>

      <Card style={styles.formCard}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Password"
              placeholder="Enter your password"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              }
            />
          )}
        />

        <View style={styles.otpContainer}>
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email Verification (OTP)"
                placeholder="Enter 6-digit verification code"
                value={value}
                onChangeText={onChange}
                error={errors.otp?.message}
                keyboardType="numeric"
                maxLength={6}
                style={styles.otpInput}
              />
            )}
          />
          <TouchableOpacity 
            style={[styles.sendOtpButton, otpSent && styles.sendOtpButtonDisabled]}
            onPress={handleSendOtp}
            disabled={otpLoading || otpSent}
          >
            <Text style={[styles.sendOtpText, otpSent && styles.sendOtpTextDisabled]}>
              {otpLoading ? 'Sending...' : otpSent ? 'Sent' : 'Send Code'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title={isLoading ? 'Signing In...' : 'Sign In'}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading || !otpSent}
          style={styles.loginButton}
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  otpInput: {
    flex: 1,
  },
  sendOtpButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  sendOtpButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendOtpText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  sendOtpTextDisabled: {
    color: '#E5E7EB',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  signupLink: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  eyeIcon: {
    padding: 8,
  },
});

