import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, SectionTitle, Button, Input } from '../components/UI';
import { getAppData } from '../utils/appData';
import { usd } from '../utils/format';
import { investmentService } from '../services/investmentService';
import Toast from 'react-native-toast-message';

const withdrawSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 50;
  }, 'Minimum withdrawal amount is $50'),
  crypto: z.string().min(1, 'Please select a cryptocurrency'),
  walletAddress: z.string().min(1, 'Wallet address is required'),
  password: z.string().min(1, 'Account password is required'),
  otp: z.string().optional(),
  notes: z.string().optional(),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

export default function WithdrawScreen() {
  const [totalBalance, setTotalBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    const data = await getAppData();
    setTotalBalance(data.totalBalance);
  };
  const [otpSent, setOtpSent] = useState(false);
  const [showOtpField, setShowOtpField] = useState(process.env.EXPO_PUBLIC_ENABLE_WITHDRAW_OTP === 'true');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: '',
      crypto: 'USDT',
      walletAddress: '',
      password: '',
      otp: '',
      notes: '',
    },
  });

  const watchedAmount = watch('amount');
  const amount = parseFloat(watchedAmount) || 0;
  const isAmountValid = amount >= 50 && amount <= totalBalance;

  const onSubmit = async (data: WithdrawFormData) => {
    setIsSubmitting(true);
    try {
      const withdrawalData = {
        amount: parseFloat(data.amount),
        wallet_address: data.walletAddress,
        crypto_type: data.crypto,
        password: data.password,
        otp: data.otp,
        notes: data.notes,
      };
      
      await investmentService.createWithdrawal(withdrawalData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Your withdrawal request has been submitted successfully!',
        position: 'top',
        visibilityTime: 4000,
      });
      reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Withdrawal Error',
        text2: `Failed to submit withdrawal request: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    try {
      // Call OTP endpoint if available
      if (process.env.EXPO_PUBLIC_ENABLE_WITHDRAW_OTP === 'true') {
        await investmentService.requestOtp();
      }
      setOtpSent(true);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Verification code has been sent to your email.',
        position: 'top',
        visibilityTime: 4000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'OTP Error',
        text2: `Failed to send OTP: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  const processingTimes = [
    { crypto: 'USDT (TRC20)', time: '10-30 minutes' },
    { crypto: 'USDT (ERC20)', time: '15-45 minutes' },
    { crypto: 'Bitcoin', time: '30-120 minutes' },
    { crypto: 'Ethereum', time: '15-45 minutes' },
    { crypto: 'Dogecoin', time: '30-90 minutes' },
  ];

  const networkFees = [
    { crypto: 'USDT (TRC20)', fee: '$1-3' },
    { crypto: 'USDT (ERC20)', fee: '$5-20' },
    { crypto: 'Bitcoin', fee: '$2-10' },
    { crypto: 'Ethereum', fee: '$3-15' },
    { crypto: 'Dogecoin', fee: '$0.1-1' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crypto Withdrawal</Text>
          <Text style={styles.subtitle}>
            Withdraw your funds securely to your cryptocurrency wallet. We support USDT, Bitcoin, Dogecoin, and Ethereum.
          </Text>
        </View>

        {/* Account Balance */}
        <Card>
          <SectionTitle 
            title="Account Balance" 
            subtitle="Your available funds for withdrawal."
          />
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>{usd(totalBalance)}</Text>
            <Text style={styles.balanceLabel}>Available for withdrawal</Text>
          </View>

          <View style={styles.limitsContainer}>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Minimum:</Text>
              <Text style={styles.limitValue}>$50</Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Maximum:</Text>
              <Text style={styles.limitValue}>{usd(totalBalance)}</Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>Processing:</Text>
              <Text style={styles.limitValue}>2-6 hours</Text>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Crypto withdrawals are processed faster than traditional methods. Most transactions complete within 2-6 hours.
            </Text>
          </View>
        </Card>

        {/* Withdrawal Request */}
        <Card>
          <SectionTitle 
            title="Withdrawal Request" 
            subtitle="Complete the form below to submit your withdrawal request."
          />

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Withdrawal Amount (USD)"
                placeholder="Enter amount to withdraw"
                value={value}
                onChangeText={onChange}
                error={errors.amount?.message}
              />
            )}
          />

          <View style={styles.amountLimits}>
            <Text style={styles.amountLimitText}>
              Min: $50, Max: {usd(totalBalance)}
            </Text>
          </View>

          <Controller
            control={control}
            name="crypto"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Select Cryptocurrency"
                placeholder="USDT - Tether USD"
                value={value}
                onChangeText={onChange}
                error={errors.crypto?.message}
              />
            )}
          />

          <View style={styles.networkInfo}>
            <Text style={styles.networkText}>Network: TRC20 (Tron) or ERC20 (Ethereum)</Text>
          </View>

          <Controller
            control={control}
            name="walletAddress"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Your USDT Wallet Address"
                placeholder="Enter your USDT wallet address"
                value={value}
                onChangeText={onChange}
                error={errors.walletAddress?.message}
              />
            )}
          />

          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#92400E" />
            <Text style={styles.warningText}>
              Double-check your wallet address. Incorrect addresses will result in permanent loss of funds.
            </Text>
          </View>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Account Password"
                placeholder="Enter your account password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          <View style={styles.otpContainer}>
            {showOtpField && (
              <Controller
                control={control}
                name="otp"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Email Verification (OTP) - Optional"
                    placeholder="Enter verification code"
                    value={value}
                    onChangeText={onChange}
                    error={errors.otp?.message}
                    style={styles.otpInput}
                  />
                )}
              />
            )}
            <TouchableOpacity 
              style={[styles.sendOtpButton, otpSent && styles.sendOtpButtonDisabled]}
              onPress={handleSendOTP}
              disabled={otpSent}
            >
              <Text style={[styles.sendOtpText, otpSent && styles.sendOtpTextDisabled]}>
                {otpSent ? 'Sent' : 'Send Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Additional Notes (Optional)"
                placeholder="Any additional information or special instructions..."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                error={errors.notes?.message}
              />
            )}
          />

          <View style={styles.securityNotices}>
            <View style={styles.securityHeader}>
              <Ionicons name="warning" size={20} color="#DC2626" />
              <Text style={styles.securityTitle}>Important Security Notices</Text>
            </View>
            <View style={styles.securityList}>
              <Text style={styles.securityItem}>• Verify your wallet address carefully - transactions cannot be reversed</Text>
              <Text style={styles.securityItem}>• Only withdraw to wallets you control completely</Text>
              <Text style={styles.securityItem}>• Processing usually takes 2-6 hours but may take up to 24 hours during high volume</Text>
              <Text style={styles.securityItem}>• You'll receive email confirmations at each step of the process</Text>
            </View>
          </View>

          <Button
            title={isSubmitting ? "Submitting..." : "Submit Withdrawal Request"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || !isAmountValid}
            style={styles.submitButton}
          />
        </Card>

        {/* Withdrawal Information */}
        <Card>
          <SectionTitle 
            title="Withdrawal Information" 
            subtitle="Processing times and network fees for different cryptocurrencies."
          />
          
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoColumnTitle}>Processing Times</Text>
              {processingTimes.map((item, index) => (
                <View key={index} style={styles.infoRow}>
                  <Text style={styles.infoCrypto}>{item.crypto}</Text>
                  <Text style={styles.infoValue}>{item.time}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.infoColumn}>
              <Text style={styles.infoColumnTitle}>Network Fees</Text>
              {networkFees.map((item, index) => (
                <View key={index} style={styles.infoRow}>
                  <Text style={styles.infoCrypto}>{item.crypto}</Text>
                  <Text style={styles.infoValue}>{item.fee}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.feeNote}>
            <Text style={styles.feeNoteText}>*Network fees are deducted from withdrawal amount</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  limitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  limitItem: {
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  amountLimits: {
    marginTop: -12,
    marginBottom: 16,
  },
  amountLimitText: {
    fontSize: 12,
    color: '#6B7280',
  },
  networkInfo: {
    marginTop: -12,
    marginBottom: 16,
  },
  networkText: {
    fontSize: 12,
    color: '#6B7280',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  otpInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
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
    backgroundColor: '#E5E7EB',
  },
  sendOtpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sendOtpTextDisabled: {
    color: '#9CA3AF',
  },
  securityNotices: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
  },
  securityList: {
    marginLeft: 28,
  },
  securityItem: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 20,
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoColumn: {
    flex: 1,
  },
  infoColumnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoCrypto: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  feeNote: {
    alignItems: 'center',
  },
  feeNoteText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

