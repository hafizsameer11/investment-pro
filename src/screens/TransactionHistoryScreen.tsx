import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, SectionTitle } from '../components/UI';
import { usd } from '../utils/format';
import { investmentService } from '../services/investmentService';
import Toast from 'react-native-toast-message';

interface Transaction {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  investment_plan?: {
    plan_name: string;
  };
}

export default function TransactionHistoryScreen() {
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [depositsData, withdrawalsData] = await Promise.all([
        investmentService.getUserDeposits(),
        investmentService.getUserWithdrawals(),
      ]);
      setDeposits(depositsData);
      setWithdrawals(withdrawalsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Transaction Error',
        text2: `Failed to load transaction history: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'rejected':
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransactionItem = (transaction: Transaction, type: 'deposit' | 'withdrawal') => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>
            {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
            {transaction.investment_plan && ` - ${transaction.investment_plan.plan_name}`}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.created_at)}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={styles.amountText}>
            {type === 'deposit' ? '+' : '-'}{usd(transaction.amount)}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionFooter}>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon(transaction.status) as any} 
            size={16} 
            color={getStatusColor(transaction.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </Text>
        </View>
        <Text style={styles.transactionId}>ID: #{transaction.id}</Text>
      </View>
    </View>
  );

  const renderEmptyState = (type: string) => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyStateText}>No {type} found</Text>
      <Text style={styles.emptyStateSubtext}>
        Your {type} history will appear here once you make transactions.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transaction History</Text>
          <Text style={styles.subtitle}>
            View all your deposits and withdrawal requests
          </Text>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'deposits' && styles.activeTabButton]}
            onPress={() => setActiveTab('deposits')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'deposits' && styles.activeTabButtonText]}>
              Deposits ({deposits?.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'withdrawals' && styles.activeTabButton]}
            onPress={() => setActiveTab('withdrawals')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'withdrawals' && styles.activeTabButtonText]}>
              Withdrawals ({withdrawals?.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Card>
          {activeTab === 'deposits' ? (
            <>
              {deposits?.length > 0 ? (
                deposits?.map(transaction => renderTransactionItem(transaction, 'deposit'))
              ) : (
                renderEmptyState('deposits')
              )}
            </>
          ) : (
            <>
              {withdrawals?.length > 0 ? (
                withdrawals?.map(transaction => renderTransactionItem(transaction, 'withdrawal'))
              ) : (
                renderEmptyState('withdrawals')
              )}
            </>
          )}
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#0EA5E9',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  transactionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
    fontSize: 14,
    color: '#6B7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  transactionId: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
