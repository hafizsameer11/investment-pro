import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
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
import { dashboardService } from '../services/dashboardService';
import { otpService } from '../services/otpService';
import loyaltyService, { LoyaltyProgress } from '../services/loyaltyService';
import Toast from 'react-native-toast-message';

// ───────────────────────────────────────────────────────────
// Validation
// ───────────────────────────────────────────────────────────
const withdrawSchema = z.object({
  amount: z
    .string()
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 50;
    }, 'Minimum withdrawal amount is $50'),
  crypto: z.string().min(1, 'Please select a cryptocurrency'),
  walletAddress: z.string().min(10, 'Wallet address is required'),
  password: z.string().min(1, 'Account password is required'),
  // Backend requires OTP always (size:6)
  otp: z.string().length(6, 'OTP must be 6 digits'),
  notes: z.string().optional(),
});
type WithdrawFormData = z.infer<typeof withdrawSchema>;

export default function WithdrawScreen() {
  const [totalBalance, setTotalBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // UX only, no longer gates submission
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyProgress | null>(null);

  // Always show OTP since backend requires it
  const showOtpField = true;

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      if (!refreshing) setRefreshing(true);

      // Load balance and loyalty data in parallel
      const [dashboardResponse, loyalty] = await Promise.all([
        dashboardService.getDashboard(),
        loyaltyService.getUserLoyalty().catch(err => {
          console.log('🔴 Loyalty error:', err);
          return null;
        }),
      ]);

      if (dashboardResponse?.success && dashboardResponse?.data) {
        setTotalBalance(Number(dashboardResponse.data.total_balance ?? 0));
      } else {
        const local = await getAppData();
        setTotalBalance(Number(local.totalBalance ?? 0));
      }

      // Set loyalty data
      if (loyalty) {
        setLoyaltyData(loyalty);
      }

      if (refreshing) {
        Toast.show({
          type: 'success',
          text1: 'Balance Updated',
          text2: 'Your balance has been refreshed successfully',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      const local = await getAppData();
      setTotalBalance(Number(local.totalBalance ?? 0));
    } finally {
      setRefreshing(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Form
  // ───────────────────────────────────────────────────────────
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
    mode: 'onChange',
  });

  const watched = watch();
  const amountNum = useMemo(() => parseFloat(watched.amount || '0') || 0, [watched.amount]);
  const isAmountValid = amountNum >= 50 && amountNum <= totalBalance;

  // Optional: lightweight form ready state (you can also rely solely on handleSubmit validation)
  const isFormReady =
    isAmountValid &&
    !!watched.crypto &&
    !!watched.walletAddress &&
    !!watched.password &&
    watched.otp?.length === 6;

  const onSubmit = async (data: WithdrawFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(data.amount),
        wallet_address: data.walletAddress,
        crypto_type: data.crypto,
        password: data.password,
        otp: data.otp,
        notes: data.notes,
      };

      await investmentService.createWithdrawal(payload);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Your withdrawal request has been submitted successfully!',
        position: 'top',
        visibilityTime: 4000,
      });

      reset();
      setOtpSent(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Withdrawal Error',
        text2: msg,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    try {
      await otpService.sendWithdrawalOtp();
      setOtpSent(true);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Verification code has been sent to your email.',
        position: 'top',
        visibilityTime: 4000,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'OTP Error',
        text2: msg,
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadAppData}
            colors={['#0EA5E9']}
            tintColor="#0EA5E9"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crypto Withdrawal</Text>
          <Text style={styles.subtitle}>
            Withdraw your funds securely to your cryptocurrency wallet. We support USDT, Bitcoin, Dogecoin, and Ethereum.
          </Text>
        </View>

        {/* Account Balance */}
        <Card>
          <SectionTitle title="Account Balance" subtitle="Your available funds for withdrawal." />
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
              Crypto withdrawals are processed faster than traditional methods. Most transactions
              complete within 2-6 hours.
            </Text>
          </View>
        </Card>

        {/* Loyalty Boost Section */}
        {loyaltyData && (
          <Card>
            <SectionTitle 
              title="Loyalty Boost" 
              subtitle="Your loyalty rewards and next tier progress." 
            />
            
            <View style={styles.loyaltyContainer}>
              {loyaltyData.current_tier ? (
                <View style={styles.currentTier}>
                  <Text style={styles.currentTierTitle}>
                    Current Tier: {loyaltyData.current_tier.name}
                  </Text>
                  <Text style={styles.currentTierBonus}>
                    You'll get {loyaltyData.current_tier.bonus_percentage}% bonus on this withdrawal!
                  </Text>
                  <Text style={styles.loyaltyBonusEarned}>
                    Total bonus earned: ${loyaltyData.loyalty_bonus_earned.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <View style={styles.noTier}>
                  <Text style={styles.noTierText}>
                    Start investing to unlock loyalty tiers and earn bonus rewards!
                  </Text>
                </View>
              )}

              {loyaltyData.next_tier && (
                <View style={styles.nextTier}>
                  <Text style={styles.nextTierTitle}>
                    Next Tier: {loyaltyData.next_tier.name}
                  </Text>
                  <Text style={styles.nextTierDays}>
                    You're just {loyaltyData.days_remaining} days away from an extra {loyaltyData.next_tier.bonus_percentage}% bonus!
                  </Text>
                  <Text style={styles.nextTierDescription}>
                    Keep holding to maximize your profit
                  </Text>
                </View>
              )}

              <View style={styles.loyaltyProgress}>
                <Text style={styles.loyaltyProgressText}>
                  {loyaltyData.current_days} days invested without withdrawal
                </Text>
                <View style={styles.loyaltyProgressBar}>
                  <View 
                    style={[
                      styles.loyaltyProgressFill, 
                      { width: `${loyaltyData.progress_percentage}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Withdrawal Request */}
        <Card>
          <SectionTitle title="Withdrawal Request" subtitle="Complete the form below." />

          {/* Amount */}
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
                keyboardType="decimal-pad"
              />
            )}
          />
          <View style={styles.amountLimits}>
            <Text style={styles.amountLimitText}>Min: $50, Max: {usd(totalBalance)}</Text>
          </View>

          {/* Crypto */}
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

          {/* Wallet Address */}
          <Controller
            control={control}
            name="walletAddress"
            render={({ field: { onChange, value} }) => (
              <Input
                label="Your USDT Wallet Address"
                placeholder="Enter your USDT wallet address"
                value={value}
                onChangeText={onChange}
                error={errors.walletAddress?.message}
                autoCapitalize="none"
              />
            )}
          />
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#92400E" />
            <Text style={styles.warningText}>
              Double-check your wallet address. Incorrect addresses will result in permanent loss of funds.
            </Text>
          </View>

          {/* Password */}
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

          {/* OTP */}
          {showOtpField && (
            <View style={styles.otpContainer}>
              <Controller
                control={control}
                name="otp"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Email Verification (OTP)"
                    placeholder="6-digit code"
                    value={value}
                    onChangeText={(txt) => onChange(txt.replace(/[^0-9]/g, '').slice(0, 6))}
                    error={errors.otp?.message}
                    keyboardType="number-pad"
                    style={styles.otpInput}
                  />
                )}
              />
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
          )}

          {/* Notes */}
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

          {/* Security notices */}
          <View style={styles.securityNotices}>
            <View style={styles.securityHeader}>
              <Ionicons name="warning" size={20} color="#DC2626" />
              <Text style={styles.securityTitle}>Important Security Notices</Text>
            </View>
            <View style={styles.securityList}>
              <Text style={styles.securityItem}>• Verify your wallet address carefully</Text>
              <Text style={styles.securityItem}>• Only withdraw to wallets you control</Text>
              <Text style={styles.securityItem}>• Processing usually takes 2-6 hours</Text>
              <Text style={styles.securityItem}>• You’ll receive email confirmations</Text>
              <Text style={styles.securityItem}>• WIthdraw can be requested after 15 Days of investment. If you want to do withdrawal after 15 days you will get 50% of profit but if you wait for complete period of investment e.g 30 Days you can get complete withdraw</Text>
            </View>
          </View>

          {/* Submit */}
          <Button
            title={isSubmitting ? 'Submitting...' : 'Submit Withdrawal Request'}
            onPress={handleSubmit(onSubmit)}
            // ❗️No longer blocked by otpSent; backend will validate OTP.
            disabled={isSubmitting || !isAmountValid || !isFormReady}
            style={styles.submitButton}
          />
        </Card>

        {/* Info */}
        <Card>
          <SectionTitle
            title="Withdrawal Information"
            subtitle="Processing times and network fees for different cryptocurrencies."
          />
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoColumnTitle}>Processing Times</Text>
              {processingTimes.map((item, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={styles.infoCrypto}>{item.crypto}</Text>
                  <Text style={styles.infoValue}>{item.time}</Text>
                </View>
              ))}
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoColumnTitle}>Network Fees</Text>
              {networkFees.map((item, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={styles.infoCrypto}>{item.crypto}</Text>
                  <Text style={styles.infoValue}>{item.fee}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.feeNote}>
            <Text style={styles.feeNoteText}></Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1, padding: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24 },

  balanceContainer: { alignItems: 'center', marginBottom: 20 },
  balanceAmount: { fontSize: 32, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  balanceLabel: { fontSize: 14, color: '#6B7280' },

  limitsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  limitItem: { alignItems: 'center' },
  limitLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  limitValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },

  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EFF6FF', borderRadius: 8, padding: 16 },
  infoText: { fontSize: 14, color: '#1E40AF', marginLeft: 8, flex: 1, lineHeight: 20 },

  amountLimits: { marginTop: -12, marginBottom: 16 },
  amountLimitText: { fontSize: 12, color: '#6B7280' },

  networkInfo: { marginTop: -12, marginBottom: 16 },
  networkText: { fontSize: 12, color: '#6B7280' },

  warningBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF3C7', borderRadius: 8, padding: 16, marginBottom: 20 },
  warningText: { fontSize: 14, color: '#92400E', marginLeft: 8, flex: 1, lineHeight: 20 },

  otpContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  otpInput: { flex: 1, marginBottom: 0, marginRight: 12 },
  sendOtpButton: { backgroundColor: '#0EA5E9', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  sendOtpButtonDisabled: { backgroundColor: '#E5E7EB' },
  sendOtpText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  sendOtpTextDisabled: { color: '#9CA3AF' },

  securityNotices: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 16, marginBottom: 20 },
  securityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  securityTitle: { fontSize: 16, fontWeight: '600', color: '#DC2626', marginLeft: 8 },
  securityList: { marginLeft: 28 },
  securityItem: { fontSize: 14, color: '#7F1D1D', lineHeight: 20, marginBottom: 4 },

  submitButton: { marginTop: 8 },

  infoGrid: { flexDirection: 'row', marginBottom: 16 },
  infoColumn: { flex: 1 },
  infoColumnTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoCrypto: { fontSize: 14, color: '#374151', flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  feeNote: { alignItems: 'center' },
  feeNoteText: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },

  // Loyalty styles
  loyaltyContainer: { gap: 16 },
  currentTier: { backgroundColor: '#F0FDF4', padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#10B981' },
  currentTierTitle: { fontSize: 16, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  currentTierBonus: { fontSize: 14, color: '#047857', marginBottom: 4 },
  loyaltyBonusEarned: { fontSize: 12, color: '#059669', fontWeight: '600' },
  noTier: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 8, alignItems: 'center' },
  noTierText: { fontSize: 14, color: '#6B7280', textAlign: 'center', fontStyle: 'italic' },
  nextTier: { backgroundColor: '#FEF3C7', padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  nextTierTitle: { fontSize: 16, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  nextTierDays: { fontSize: 14, color: '#B45309', marginBottom: 4 },
  nextTierDescription: { fontSize: 12, color: '#D97706', fontWeight: '600' },
  loyaltyProgress: { alignItems: 'center' },
  loyaltyProgressText: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  loyaltyProgressBar: { width: '100%', height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  loyaltyProgressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
});
