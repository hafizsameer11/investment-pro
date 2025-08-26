import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, SectionTitle, Stat, Button } from '../components/UI';
import { usd } from '../utils/format';
import { getAppData, updateAppData } from '../utils/appData';
import { clearAuthData } from '../utils/auth';
import { dashboardService } from '../services/dashboardService';
import { authService } from '../services/authService';
import { transactionService, UserTransaction } from '../services/transactionService';
import Toast from 'react-native-toast-message';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [appData, setAppData] = useState({
    totalBalance: 0,
    activePlans: 0,
    todaysProfit: 0,
    totalProfit: 0,
    networkEarnings: 0,
    directReferrals: 0,
    totalNetwork: 0,
    seenWelcome: false,
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<UserTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      setRefreshing(true);
      setLoadingTransactions(true);
      
      // Load local app data
      const localData = await getAppData();
      setAppData(localData);
      
      // Load dashboard data and transactions in parallel
      const [dashboardResponse, transactions] = await Promise.all([
        dashboardService.getDashboard(),
        transactionService.getRecentTransactions()
      ]);
      
      console.log("transaction data",recentTransactions)
      // Safely update app data with API response using snake_case keys
      setAppData(prev => ({
        ...prev,
        totalBalance: dashboardResponse.data?.total_balance ?? prev.totalBalance,
        activePlans: dashboardResponse.data?.active_plans ?? prev.activePlans,
        todaysProfit: dashboardResponse.data?.daily_profit ?? prev.todaysProfit,
        networkEarnings: dashboardResponse.data?.referral_bonus_earned ?? prev.networkEarnings,
      }));
      
      // Set recent transactions
      setRecentTransactions(transactions);
      
      if (!localData.seenWelcome) {
        setShowWelcomeModal(true);
      }
      
      // Show success message on refresh
      if (refreshing) {
        Toast.show({
          type: 'success',
          text1: 'Dashboard Updated',
          text2: 'Your dashboard data has been refreshed successfully',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Dashboard Error',
        text2: `Failed to load dashboard data: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
      // Keep existing data if API fails
    } finally {
      setRefreshing(false);
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (!appData.seenWelcome) {
      setShowWelcomeModal(true);
    }
  }, [appData.seenWelcome]);

  // Helper functions for transaction display
  const getTransactionIcon = (type: string): string => {
    if (!type) return 'card';
    switch (type) {
      case 'deposit': return 'arrow-down-circle';
      case 'withdrawal': return 'arrow-up-circle';
      case 'investment': return 'trending-up';
      case 'profit': return 'gift';
      case 'referral': return 'people';
      case 'unknown': return 'card';
      default: return 'card';
    }
  };

  const getTransactionColor = (type: string): string => {
    if (!type) return '#6B7280';
    switch (type) {
      case 'deposit': return '#10B981';
      case 'withdrawal': return '#EF4444';
      case 'investment': return '#3B82F6';
      case 'profit': return '#F59E0B';
      case 'referral': return '#8B5CF6';
      case 'unknown': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTransactionTypeLabel = (type: string): string => {
    if (!type) return 'Transaction';
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'investment': return 'Investment';
      case 'profit': return 'Profit';
      case 'referral': return 'Referral Bonus';
      case 'unknown': return 'Transaction';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getStatusColor = (status: string): string => {
    if (!status) return '#F3F4F6';
    switch (status) {
      case 'completed': return '#D1FAE5';
      case 'pending': return '#FEF3C7';
      case 'failed': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const handleGetStarted = async () => {
    await updateAppData({ seenWelcome: true });
    setAppData(prev => ({ ...prev, seenWelcome: true }));
    setShowWelcomeModal(false);
  };

  const handleWhatsAppJoin = () => {
    // TODO: Implement WhatsApp link opening
    Alert.alert('WhatsApp', 'Opening WhatsApp channel...');
  };

  const handleEmailSupport = () => {
    // TODO: Implement email client opening
    Alert.alert('Email Support', 'Opening email client...');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      // clearAuthData is already called in authService.logout()
      // The App component will automatically redirect to login when userToken becomes null
    } catch (error) {
      // Error is already handled in authService.logout()
      console.log('Logout completed');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Withdraw':
        (navigation as any).navigate('More', { screen: 'Withdraw' });
        break;
      case 'Transaction History':
        (navigation as any).navigate('More', { screen: 'TransactionHistory' });
        break;
      case 'Mining':
        (navigation as any).navigate('More', { screen: 'Mining' });
        break;
      case 'Active Investments':
        (navigation as any).navigate('More', { screen: 'ActiveInvestments' });
        break;
      case 'Referrals':
        (navigation as any).navigate('More', { screen: 'Referrals' });
        break;
      default:
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: `${action} feature will be available soon`,
          position: 'top',
          visibilityTime: 3000,
        });
    }
  };

  const networkLevelsData = [
    { level: 1, bonus: '10%', referrals: 0, earned: 0, color: '#3B82F6' },
    { level: 2, bonus: '7%', referrals: 0, earned: 0, color: '#10B981' },
    { level: 3, bonus: '5%', referrals: 0, earned: 0, color: '#8B5CF6' },
    { level: 4, bonus: '3%', referrals: 0, earned: 0, color: '#F59E0B' },
    { level: 5, bonus: '2%', referrals: 0, earned: 0, color: '#EC4899' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadAppData} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Here's your investment overview.</Text>
        </View>

        {/* Stats Row 1 */}
        <View style={styles.statsRow}>
          <Stat
            label="Total Balance"
            value={usd(appData.totalBalance)}
            icon={<Ionicons name="wallet" size={20} color="#0EA5E9" />}
            trend="+8.2% from last month"
          />
          <Stat
            label="Active Investments"
            value={appData.activePlans.toString()}
            icon={<Ionicons name="trending-up" size={20} color="#10B981" />}
            trend="Plans running smoothly"
          />
        </View>

        {/* Stats Row 2 */}
        <View style={styles.statsRow}>
          <Stat
            label="Today's Profit"
            value={usd(appData.todaysProfit)}
            icon={<Ionicons name="cash" size={20} color="#F59E0B" />}
            trend="+12.5% vs yesterday"
          />
          <Stat
            label="Total Profit"
            value={usd(appData.totalProfit)}
            icon={<Ionicons name="trophy" size={20} color="#8B5CF6" />}
            trend="Since account opening"
          />
        </View>

        {/* Quick Actions */}
        <Card>
          <SectionTitle title="Quick Actions" subtitle="Access important features quickly." />
          <View style={styles.quickActionsRow}>
            <TouchableOpacity 
              style={styles.quickActionButton} 
              onPress={() => handleQuickAction('Withdraw')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="arrow-up-circle" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Withdraw</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton} 
              onPress={() => handleQuickAction('Transaction History')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="time" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton} 
              onPress={() => handleQuickAction('Mining')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#0EA5E9' }]}>
                <Ionicons name="cube" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Mining</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton} 
              onPress={() => handleQuickAction('Active Investments')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' }]}>
                <Ionicons name="trending-up" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Investments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton} 
              onPress={() => handleQuickAction('Referrals')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="people" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>Referrals</Text>
            </TouchableOpacity>
          </View>
          

        </Card>

        {/* Recent Activity */}
        <Card>
          <SectionTitle title="Recent Activity" subtitle="Your latest transactions." />
          
          {loadingTransactions ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : recentTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id || Math.random()} style={styles.transactionItem}>
                  <View style={styles.transactionIcon}>
                    <Ionicons 
                      name={getTransactionIcon(transaction.type) as any} 
                      size={20} 
                      color={getTransactionColor(transaction.type)} 
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionType}>{getTransactionTypeLabel(transaction.type)}</Text>
                    <Text style={styles.transactionDate}>
                      {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'Unknown Date'}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.transactionAmountText,
                      { color: getTransactionColor(transaction.type) }
                    ]}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}{usd(transaction.amount || 0)}
                    </Text>
                    <View style={[
                      styles.transactionStatus,
                      { backgroundColor: getStatusColor(transaction.status) }
                    ]}>
                      <Text style={styles.transactionStatusText}>
                        {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Unknown'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="time" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No transactions yet.</Text>
              <Text style={styles.emptyStateSubtext}>Your transaction history will appear here.</Text>
            </View>
          )}
        </Card>

        {/* Multi-Level Network Structure */}
        <Card>
          <SectionTitle 
            title="Multi-Level Network Structure" 
            subtitle="Build your network and earn from 5 levels deep."
          />
          
          <View style={styles.networkGrid}>
            {networkLevelsData?.map((level) => (
              <View key={level.level} style={[styles.networkLevel, { backgroundColor: level.color }]}>
                <Text style={styles.levelNumber}>{level.referrals}</Text>
                <Text style={styles.levelLabel}>Level {level.level}</Text>
                <Text style={styles.levelBonus}>{level.bonus} bonus</Text>
                <Text style={styles.levelEarned}>${level.earned} earned</Text>
              </View>
            ))}
          </View>

          <View style={styles.networkSummary}>
            <Text style={styles.networkEarnings}>{usd(appData.networkEarnings)}</Text>
            <Text style={styles.networkEarningsLabel}>Total Network Earnings</Text>
            <Text style={styles.networkReferrals}>From {appData.totalNetwork} total referrals across all levels</Text>
          </View>
        </Card>

        {/* How Network Earnings Work */}
        <Card>
          <SectionTitle 
            title="How Your Network Earnings Work" 
            subtitle="Multi-level commission structure explained."
          />
          
          <View style={styles.commissionStructure}>
            {networkLevelsData?.map((level) => (
              <View key={level.level} style={styles.commissionRow}>
                <Text style={styles.commissionLevel}>Level {level.level} ({level.level === 1 ? 'Direct Referrals' : `${level.level}${level.level === 2 ? 'nd' : level.level === 3 ? 'rd' : 'th'} Generation`})</Text>
                <Text style={styles.commissionBonus}>{level.bonus} Bonus</Text>
              </View>
            ))}
          </View>

          <View style={styles.exampleSection}>
            <Text style={styles.exampleTitle}>Example Calculation:</Text>
            <Text style={styles.exampleText}>• When your direct referral invests $1,000, you earn $100 (10%)</Text>
            <Text style={styles.exampleText}>• When their referral invests $1,000, you earn $70 (7%)</Text>
            <Text style={styles.exampleText}>• Continue earning from 5 levels deep in your network</Text>
            <Text style={styles.exampleText}>• All bonuses are added directly to your account balance</Text>
          </View>
        </Card>

        {/* Support & Community */}

      </ScrollView>

      {/* Welcome Modal */}
      <Modal
        visible={false}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Welcome to InvestPro</Text>
            <Text style={styles.modalText}>
              Your trusted partner in intelligent investing. We combine cutting-edge technology with proven strategies to maximize your investment potential.
            </Text>
            <Button title="Get Started" onPress={handleGetStarted} />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoutButton: {
    padding: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  networkLevel: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelBonus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  levelEarned: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  networkSummary: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  networkEarnings: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  networkEarningsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  networkReferrals: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commissionStructure: {
    marginBottom: 20,
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commissionLevel: {
    fontSize: 14,
    color: '#374151',
  },
  commissionBonus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  exampleSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  supportLink: {
    fontSize: 12,
    color: '#0EA5E9',
    textDecorationLine: 'underline',
  },
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
});
