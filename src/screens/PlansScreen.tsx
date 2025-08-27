
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, SectionTitle, Button } from '../components/UI';
import { usd } from '../utils/format';
import { investmentService } from '../services/investmentService';
import { dashboardService } from '../services/dashboardService';
import Toast from 'react-native-toast-message';
import { useState, useEffect } from 'react';

interface Plan {
  id: string;
  name: string;
  tagline: string;
  returnRate: string;
  minAmount: number;
  maxAmount: number;
  referralBonus: number;
  features: string[];
  icon: string;
  color: string;
}

interface ApiPlan {
  id: number;
  plan_name: string;
  min_amount: number;
  max_amount: number;
  profit_percentage: number;
  duration: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// const plans: Plan[] = [
//   {
//     id: 'starter',
//     name: 'Starter Plan',
//     tagline: 'Perfect for beginners',
//     returnRate: '15.00%',
//     minAmount: 500,
//     maxAmount: 1000,
//     referralBonus: 50,
//     features: [
//       '30-day investment period',
//       'Daily profit distribution',
//       '24/7 customer support',
//       'Capital protection',
//     ],
//     icon: 'leaf',
//     color: '#10B981',
//   },
//   {
//     id: 'growth',
//     name: 'Growth Plan',
//     tagline: 'High-growth potential',
//     returnRate: '15.00%',
//     minAmount: 1000,
//     maxAmount: 5000,
//     referralBonus: 100,
//     features: [
//       '45-day investment period',
//       'Premium profit rates',
//       'Priority customer support',
//       'Advanced portfolio insights',
//       'Dedicated account manager',
//     ],
//     icon: 'rocket',
//     color: '#3B82F6',
//   },
//   {
//     id: 'premium',
//     name: 'Premium Plan',
//     tagline: 'Maximum returns',
//     returnRate: '30.00%',
//     minAmount: 5000,
//     maxAmount: 0, // No maximum
//     referralBonus: 300,
//     features: [
//       '60-day investment period',
//       'Highest profit margins',
//       'VIP customer support',
//       'Custom investment strategies',
//       'Exclusive market insights',
//       'White-glove service',
//     ],
//     icon: 'diamond',
//     color: '#8B5CF6',
//   },
// ];

export default function PlansScreen() {
  const [apiPlans, setApiPlans] = useState<ApiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      console.log('🔵 Loading plans...');
      const response = await investmentService.getPlans();
      console.log('🟢 Plans response:', response);
      
      // Handle different API response structures
      const plans = Array.isArray(response?.data) ? response.data
                  : Array.isArray(response) ? response
                  : [];
      
      if (plans && Array.isArray(plans)) {
        setApiPlans(plans);
        console.log('🟢 Plans set to state:', plans.length, 'plans');
      } else {
        console.log('🔴 Invalid plans data:', plans);
        setApiPlans([]);
      }
      
      // Show success message on refresh
      if (refreshing) {
        Toast.show({
          type: 'success',
          text1: 'Plans Updated',
          text2: 'Investment plans have been refreshed successfully',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.log('🔴 Load plans error:', error);
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Plans Error',
        text2: `Failed to load investment plans: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
      // Set empty array to prevent undefined errors
      setApiPlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Map API plans to UI plans
  const getDisplayPlans = (): Plan[] => {
    console.log('🔵 Getting display plans, apiPlans:', apiPlans);
    
    if (apiPlans && Array.isArray(apiPlans) && apiPlans.length > 0) {
      console.log('🟢 Using API plans:', apiPlans.length, 'plans');
      const plans3= apiPlans?.map((apiPlan, index) => ({
        id: apiPlan.id.toString(),
        name: apiPlan.plan_name,
        tagline: `${apiPlan.profit_percentage}% daily profit`,
        returnRate: `${apiPlan.profit_percentage}%`,
        minAmount: apiPlan.min_amount,
        maxAmount: apiPlan.max_amount,
        referralBonus: [50, 100, 300][index] || 50,
        features: [
          `${apiPlan.duration}-day investment period`,
          'Daily profit distribution',
          '24/7 customer support',
          'Capital protection',
          'Earn Direct and indirect Referral Bonus',
        ],
        icon: ['leaf', 'rocket', 'diamond'][index] || 'leaf',
        color: ['#10B981', '#3B82F6', '#8B5CF6'][index] || '#10B981',
      }));
      console.log('🟢 Plans3:', plans3);
      return plans3;
    }
  };

  const handleInvestmentSubmit = async () => {
    if (!selectedPlan) return;
    
    console.log('🔵 Investment amount entered:', investmentAmount);
    if (investmentAmount) {
      const investAmount = parseFloat(investmentAmount);
      console.log('🔵 Parsed investment amount:', investAmount);
      
      // Get current balance
      const dashboardData = await dashboardService.getDashboard();
      const userBalance = dashboardData?.data?.total_balance || 0;
      
      console.log('🔵 Amount validation:', {
        isNaN: isNaN(investAmount),
        belowMin: investAmount < selectedPlan.minAmount,
        aboveMax: investAmount > selectedPlan.maxAmount,
        exceedsBalance: investAmount > userBalance
      });
      
      if (isNaN(investAmount) || investAmount < selectedPlan.minAmount || investAmount > selectedPlan.maxAmount) {
        console.log('🔴 Invalid amount entered');
        Alert.alert('Invalid Amount', `Please enter an amount between ${usd(selectedPlan.minAmount)} and ${usd(selectedPlan.maxAmount)}`);
        return;
      }
      
      if (investAmount > userBalance) {
        console.log('🔴 Insufficient balance for investment');
        Alert.alert('Insufficient Balance', `You don't have enough balance for this investment.`);
        return;
      }
      
      try {
        console.log('🔵 Calling investmentService.activatePlan with:', { planId: parseInt(selectedPlan.id), amount: investAmount });
        await investmentService.activatePlan(parseInt(selectedPlan.id), investAmount);
        console.log('✅ Plan activation successful');
        Alert.alert('Success', 'Plan activated successfully!');
        
        // Close modal and refresh data
        setShowInvestmentModal(false);
        setSelectedPlan(null);
        setInvestmentAmount('');
        loadPlans();
      } catch (error) {
        console.log('🔴 Plan activation failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        Alert.alert('Error', `Failed to activate plan: ${errorMessage}`);
      }
    }
  };

  const handleInvestNow = async (plan: Plan) => {
    try {
      console.log('🔵 Invest Now clicked for plan:', plan);
      
      // Get user's current balance from dashboard
      const dashboardData = await dashboardService.getDashboard();
      console.log('🔵 Dashboard data:', dashboardData);
      
      const userBalance = dashboardData?.data?.total_balance || 0;
      console.log('🔵 User balance:', userBalance);
      console.log('🔵 Plan min amount:', plan.minAmount);
      console.log('🔵 Balance comparison:', userBalance < plan.minAmount);
      
      if (userBalance < plan.minAmount) {
        Alert.alert(
          'Insufficient Balance',
          `You need at least ${usd(plan.minAmount)} to invest in this plan. Your current balance is ${usd(userBalance)}.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Make Deposit',
              onPress: () => {
                // Navigate to deposit screen
                Alert.alert('Deposit', 'Please go to the Deposit tab to add funds to your account.');
              },
            },
          ]
        );
      } else {
        console.log('🔵 Showing custom investment modal');
        // Show custom investment modal
        setSelectedPlan(plan);
        setInvestmentAmount(plan.minAmount.toString());
        setShowInvestmentModal(true);
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      // If balance check fails, just show the invest option
      Alert.alert('Invest Now', `Selected plan: ${plan.name}. Please go to the Deposit tab to complete your investment.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadPlans} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Investment Plans</Text>
          <Text style={styles.subtitle}>
            Choose from our carefully crafted investment plans designed to maximize your returns
          </Text>
        </View>

        {/* Filter Buttons */}
        {/* <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
            <Text style={styles.filterButtonTextActive}>All Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Beginner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Professional</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Enterprise</Text>
          </TouchableOpacity>
        </View> */}

        {/* Plans */}
        <View style={styles.plansContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          ) : (
            getDisplayPlans()?.map((plan) => (
            <Card key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: plan.color }]}>
                  <Ionicons name={plan.icon as any} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planTagline}>{plan.tagline}</Text>
                </View>
              </View>

              <View style={styles.planStats}>
                <View style={styles.returnRateContainer}>
                  <Text style={styles.returnRate}>{plan.returnRate}</Text>
                  <Text style={styles.returnRateLabel}>Weekly Return</Text>
                </View>
                <View style={styles.investmentRange}>
                  <Text style={styles.rangeLabel}>Investment Range</Text>
                  <Text style={styles.rangeValue}>
                    Min: {usd(plan.minAmount)} - Max: {plan.maxAmount === 0 ? 'No limit' : usd(plan.maxAmount)}
                  </Text>
                </View>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features?.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* <View style={styles.referralBonus}>
                <Text style={styles.referralBonusLabel}>Referral Bonus:</Text>
                <Text style={styles.referralBonusValue}>{usd(plan.referralBonus)}</Text>
              </View> */}

              <Button
                title="Invest Now"
                onPress={() => handleInvestNow(plan)}
                style={styles.investButton}
              />
            </Card>
          ))
          )}
        </View>

        {/* Information Card */}
        <Card style={styles.infoCard}>
          <SectionTitle 
            title="How It Works" 
            subtitle="Understanding your investment journey."
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              Daily profits are calculated automatically based on your chosen plan and investment amount. 
              Returns are distributed daily to your account balance, and you can track your progress in real-time.
            </Text>
            <Text style={styles.infoText}>
              All plans include capital protection and are backed by our comprehensive risk management system. 
              Start with any plan that fits your investment goals and risk tolerance.
            </Text>
          </View>
        </Card>

        {/* Why Choose Our Plans */}
        <Card>
          <SectionTitle 
            title="Why Choose Our Investment Plans?" 
            subtitle="Discover the advantages of investing with InvestPro."
          />
          
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              </View>
              <Text style={styles.benefitTitle}>Secure & Protected</Text>
              <Text style={styles.benefitDescription}>
                Your investments are protected with bank-level security
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="trending-up" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.benefitTitle}>Proven Returns</Text>
              <Text style={styles.benefitDescription}>
                Consistent profit generation with transparent tracking
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name="headset" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.benefitTitle}>Expert Support</Text>
              <Text style={styles.benefitDescription}>
                24/7 professional support from our investment experts
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Custom Investment Modal */}
      <Modal
        visible={showInvestmentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInvestmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Invest in {selectedPlan?.name}
            </Text>
            <Text style={styles.modalSubtitle}>
              Enter amount (min: {usd(selectedPlan?.minAmount || 0)}, max: {usd(selectedPlan?.maxAmount || 0)})
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={investmentAmount}
              onChangeText={setInvestmentAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowInvestmentModal(false);
                  setSelectedPlan(null);
                  setInvestmentAmount('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonInvest]}
                onPress={handleInvestmentSubmit}
              >
                <Text style={styles.modalButtonInvestText}>Invest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  planTagline: {
    fontSize: 14,
    color: '#6B7280',
  },
  planStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  returnRateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginRight: 12,
  },
  returnRate: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  returnRateLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  investmentRange: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  referralBonus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    marginBottom: 20,
  },
  referralBonusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
  },
  referralBonusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  investButton: {
    width: '100%',
  },
  infoCard: {
    marginBottom: 24,
  },
  infoContent: {
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  benefitsContainer: {
    marginTop: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    flex: 1,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonInvest: {
    backgroundColor: '#10B981',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalButtonInvestText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
