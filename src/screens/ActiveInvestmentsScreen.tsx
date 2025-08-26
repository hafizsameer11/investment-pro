import React, { useState, useEffect } from 'react';
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

import { Card, SectionTitle } from '../components/UI';
import { usd } from '../utils/format';
import { investmentService, UserInvestment } from '../services/investmentService';
import Toast from 'react-native-toast-message';

export default function ActiveInvestmentsScreen() {
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      if (!refreshing) {
        setLoading(true);
      }
      const response = await investmentService.getInvestments();
      setInvestments(response);
      
      // Show success message on refresh
      if (refreshing) {
        Toast.show({
          type: 'success',
          text1: 'Investments Updated',
          text2: 'Your investment data has been refreshed successfully',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Investments Error',
        text2: `Failed to load investments: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'completed':
        return '#3B82F6';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#EF4444'; // Red for near completion
    if (percentage >= 60) return '#F59E0B'; // Orange for mid-way
    return '#10B981'; // Green for early stage
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadInvestments} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Active Investments</Text>
          <Text style={styles.subtitle}>
            Track your investment progress and earnings
          </Text>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <SectionTitle title="Investment Summary" subtitle="Overview of your active investments" />
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{investments?.length}</Text>
              <Text style={styles.summaryStatLabel}>Active Plans</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {usd(investments?.reduce((sum, inv) => sum + inv.amount, 0))}
              </Text>
              <Text style={styles.summaryStatLabel}>Total Invested</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {usd(investments?.reduce((sum, inv) => sum + inv.total_profit, 0))}
              </Text>
              <Text style={styles.summaryStatLabel}>Total Profit</Text>
            </View>
          </View>
        </Card>

        {/* Investments List */}
        {loading ? (
          <Card style={styles.loadingCard}>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading investments...</Text>
            </View>
          </Card>
        ) : investments?.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Active Investments</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any active investment plans yet. Start investing to see your progress here.
              </Text>
            </View>
          </Card>
        ) : (
          investments?.map((investment) => (
            <Card key={investment.id} style={styles.investmentCard}>
              <View style={styles.investmentHeader}>
                <View style={styles.investmentInfo}>
                  <Text style={styles.planName}>{investment.plan_name}</Text>
                  <Text style={styles.investmentAmount}>
                    {usd(investment.amount)} invested
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(investment.status) }]}>
                  <Text style={styles.statusText}>{investment.status}</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {investment.progress_percentage.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${investment.progress_percentage}%`,
                        backgroundColor: getProgressColor(investment.progress_percentage)
                      }
                    ]} 
                  />
                </View>
              </View>

              {/* Investment Details */}
              <View style={styles.investmentDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Start Date</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(investment.start_date)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Days Remaining</Text>
                    <Text style={styles.detailValue}>
                      {investment.days_remaining} days
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="trending-up" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Daily Rate</Text>
                    <Text style={styles.detailValue}>
                      {investment.daily_profit_rate}%
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Daily Profit</Text>
                    <Text style={[styles.detailValue, styles.profitValue]}>
                      {usd(investment.daily_profit)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calculator" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Total Earned</Text>
                    <Text style={[styles.detailValue, styles.profitValue]}>
                      {usd(investment.total_profit)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color="#6B7280" />
                    <Text style={styles.detailLabel}>Duration</Text>
                    <Text style={styles.detailValue}>
                      {investment.duration_days} days
                    </Text>
                  </View>
                </View>
              </View>

              {/* End Date */}
              <View style={styles.endDateContainer}>
                <Ionicons name="flag" size={16} color="#6B7280" />
                <Text style={styles.endDateLabel}>Ends on: </Text>
                <Text style={styles.endDateValue}>
                  {formatDate(investment.end_date)}
                </Text>
              </View>
            </Card>
          ))
        )}
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
  summaryCard: {
    marginBottom: 24,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingCard: {
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  investmentCard: {
    marginBottom: 16,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  investmentInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  investmentAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  investmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  profitValue: {
    color: '#10B981',
  },
  endDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  endDateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  endDateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
