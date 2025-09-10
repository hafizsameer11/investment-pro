import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, SectionTitle, Input, Button } from '../components/UI';
import { passwordResetService } from '../services/passwordResetService';
import Toast from 'react-native-toast-message';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [email, setEmail] = useState('');

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleSendOtp = async () => {
    const emailValue = forgotPasswordForm.getValues('email');
    if (!emailValue) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setOtpLoading(true);
    try {
      await passwordResetService.sendPasswordResetOtp(emailValue);
      setEmail(emailValue);
      setStep('otp');
      resetPasswordForm.setValue('email', emailValue);
    } catch (error) {
      // Error is already handled by the service with Toast
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const { email: formEmail, otp } = resetPasswordForm.getValues();
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setIsLoading(true);
    try {
      await passwordResetService.verifyPasswordResetOtp(formEmail, otp);
      setStep('reset');
    } catch (error) {
      // Error is already handled by the service with Toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await passwordResetService.resetPassword(data);
      navigation.navigate('Login');
    } catch (error) {
      // Error is already handled by the service with Toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Password</Text>
        </View>

        <Card style={styles.card}>
          <SectionTitle
            title={
              step === 'email'
                ? 'Reset Your Password'
                : step === 'otp'
                ? 'Verify Your Email'
                : 'Set New Password'
            }
            subtitle={
              step === 'email'
                ? 'Enter your email address to receive a verification code'
                : step === 'otp'
                ? 'Enter the 6-digit code sent to your email'
                : 'Create a new password for your account'
            }
          />

          {step === 'email' && (
            <View>
              <Controller
                control={forgotPasswordForm.control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={value}
                    onChangeText={onChange}
                    error={forgotPasswordForm.formState.errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />

              <Button
                title={otpLoading ? 'Sending...' : 'Send Reset Code'}
                onPress={handleSendOtp}
                disabled={otpLoading}
                style={styles.button}
              />
            </View>
          )}

          {step === 'otp' && (
            <View>
              <Controller
                control={resetPasswordForm.control}
                name="otp"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Verification Code"
                    placeholder="Enter 6-digit code"
                    value={value}
                    onChangeText={onChange}
                    error={resetPasswordForm.formState.errors.otp?.message}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                )}
              />

              <Button
                title="Verify Code"
                onPress={handleVerifyOtp}
                disabled={isLoading}
                style={styles.button}
              />
            </View>
          )}

          {step === 'reset' && (
            <View>
              <Controller
                control={resetPasswordForm.control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="New Password"
                    placeholder="Enter new password"
                    value={value}
                    onChangeText={onChange}
                    error={resetPasswordForm.formState.errors.password?.message}
                    secureTextEntry
                  />
                )}
              />

              <Controller
                control={resetPasswordForm.control}
                name="password_confirmation"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    value={value}
                    onChangeText={onChange}
                    error={resetPasswordForm.formState.errors.password_confirmation?.message}
                    secureTextEntry
                  />
                )}
              />

              <Button
                title={isLoading ? 'Resetting...' : 'Reset Password'}
                onPress={resetPasswordForm.handleSubmit(handleResetPassword)}
                disabled={isLoading}
                style={styles.button}
              />
            </View>
          )}
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
