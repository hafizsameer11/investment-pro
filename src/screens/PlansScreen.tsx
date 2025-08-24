import React from 'react';
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

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    tagline: 'Perfect for beginners',
    returnRate: '15.00%',
    minAmount: 500,
    maxAmount: 1000,
    referralBonus: 50,
    features: [
      '30-day investment period',
      'Daily profit distribution',
      '24/7 customer support',
      'Capital protection',
    ],
    icon: 'leaf',
    color: '#10B981',
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    tagline: 'High-growth potential',
    returnRate: '15.00%',
    minAmount: 1000,
    maxAmount: 5000,
    referralBonus: 100,
    features: [
      '45-day investment period',
      'Premium profit rates',
      'Priority customer support',
      'Advanced portfolio insights',
      'Dedicated account manager',
    ],
    icon: 'rocket',
    color: '#3B82F6',
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    tagline: 'Maximum returns',
    returnRate: '30.00%',
    minAmount: 5000,
    maxAmount: 0, // No maximum
    referralBonus: 300,
    features: [
      '60-day investment period',
      'Highest profit margins',
      'VIP customer support',
      'Custom investment strategies',
      'Exclusive market insights',
      'White-glove service',
    ],
    icon: 'diamond',
    color: '#8B5CF6',
  },
];

export default function PlansScreen() {
  const [apiPlans, setApiPlans] = useState<ApiPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const plans = await investmentService.getPlans();
      setApiPlans(plans);
    } catch (error) {
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Plans Error',
        text2: `Failed to load investment plans: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Map API plans to UI plans
  const getDisplayPlans = (): Plan[] => {
    if (apiPlans.length > 0) {
      return apiPlans.map((apiPlan, index) => ({
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
        ],
        icon: ['leaf', 'rocket', 'diamond'][index] || 'leaf',
        color: ['#10B981', '#3B82F6', '#8B5CF6'][index] || '#10B981',
      }));
    }
    return plans; // Fallback to local plans
  };

  const handleInvestNow = async (plan: Plan) => {
    try {
      // Get user's current balance from dashboard
      const dashboardData = await dashboardService.getDashboard();
      const userBalance = dashboardData?.data?.total_balance || 0;
      
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
                // You can add navigation here when you have navigation setup
                Alert.alert('Deposit', 'Please go to the Deposit tab to add funds to your account.');
              },
            },
          ]
        );
      } else {
        // Navigate to deposit screen with plan selected
        Alert.alert('Invest Now', `Selected plan: ${plan.name}. Please go to the Deposit tab to complete your investment.`);
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      // If balance check fails, just show the invest option
      Alert.alert('Invest Now', `Selected plan: ${plan.name}. Please go to the Deposit tab to complete your investment.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Investment Plans</Text>
          <Text style={styles.subtitle}>
            Choose from our carefully crafted investment plans designed to maximize your returns
          </Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
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
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading plans...</Text>
            </View>
          ) : (
            getDisplayPlans().map((plan) => (
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
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.referralBonus}>
                <Text style={styles.referralBonusLabel}>Referral Bonus:</Text>
                <Text style={styles.referralBonusValue}>{usd(plan.referralBonus)}</Text>
              </View>

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
});
