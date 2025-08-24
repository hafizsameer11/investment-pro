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

import { Card, SectionTitle, Button } from '../components/UI';
import { getAppData } from '../utils/appData';
import { usd } from '../utils/format';

export default function ReferralsScreen() {
  const [appData, setAppData] = useState({
    networkEarnings: 0,
    directReferrals: 0,
    totalNetwork: 0,
  });

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    const data = await getAppData();
    setAppData(data);
  };

  const networkLevelsData = [
    { level: 1, bonus: '10%', referrals: appData.directReferrals, earned: 0, color: '#3B82F6' },
    { level: 2, bonus: '7%', referrals: 0, earned: 0, color: '#10B981' },
    { level: 3, bonus: '5%', referrals: 0, earned: 0, color: '#8B5CF6' },
    { level: 4, bonus: '3%', referrals: 0, earned: 0, color: '#F59E0B' },
    { level: 5, bonus: '2%', referrals: 0, earned: 0, color: '#EC4899' },
  ];

  const referralRewards = [
    { plan: 'Starter Plan', bonus: 50 },
    { plan: 'Growth Plan', bonus: 100 },
    { plan: 'Premium Plan', bonus: 300 },
  ];

  const handleCopyReferralCode = () => {
    // TODO: Implement copy to clipboard
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleWhatsAppJoin = () => {
    // TODO: Open WhatsApp link
    Alert.alert('WhatsApp', 'Opening WhatsApp channel...');
  };

  const handleEmailSupport = () => {
    // TODO: Open email client
    Alert.alert('Email Support', 'Opening email client...');
  };

  const handleShowTree = () => {
    Alert.alert('Network Tree', 'Network tree visualization would open here');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Multi-Level Referral Network</Text>
          <Text style={styles.subtitle}>
            Build your network and earn from 5 levels deep
          </Text>
        </View>

        {/* Network Structure */}
        <Card>
          <SectionTitle 
            title="Multi-Level Network Structure" 
            subtitle="Visual representation of your referral levels."
          />
          
          <View style={styles.networkGrid}>
            {networkLevelsData.map((level) => (
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
            {networkLevelsData.map((level) => (
              <View key={level.level} style={styles.commissionRow}>
                <Text style={styles.commissionLevel}>
                  Level {level.level} ({level.level === 1 ? 'Direct Referrals' : `${level.level}${level.level === 2 ? 'nd' : level.level === 3 ? 'rd' : 'th'} Generation`})
                </Text>
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
        <Card>
          <SectionTitle 
            title="Support & Community" 
            subtitle="Get help and connect with other investors."
          />
          
          <TouchableOpacity style={styles.supportCard} onPress={handleWhatsAppJoin}>
            <View style={styles.supportIcon}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Join WhatsApp Channel</Text>
              <Text style={styles.supportDescription}>
                Get updates, tips, and connect with other investors.
              </Text>
              <Text style={styles.supportLink}>
                https://whatsapp.com/channel/0029Vb6RLxBEFeXctph9WY2I
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportCard} onPress={handleEmailSupport}>
            <View style={styles.supportIcon}>
              <Ionicons name="mail" size={24} color="#3B82F6" />
            </View>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Email Support</Text>
              <Text style={styles.supportDescription}>
                Contact our support team for assistance.
              </Text>
              <Text style={styles.supportLink}>info.investproteam@gmail.com</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Your Referral Code */}
        <Card>
          <SectionTitle 
            title="Your Referral Code" 
            subtitle="Share this code to earn referral bonuses."
          />
          
          <View style={styles.referralCodeContainer}>
            <View style={styles.referralCodeBox}>
              <Text style={styles.referralCode}>REF1418161A</Text>
              <TouchableOpacity style={styles.copyCodeIcon} onPress={handleCopyReferralCode}>
                <Ionicons name="copy-outline" size={20} color="#0EA5E9" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyReferralCode}>
              <Ionicons name="copy" size={16} color="#FFFFFF" />
              <Text style={styles.copyButtonText}>Copy Code</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.referralRewards}>
            <Text style={styles.referralRewardsTitle}>Referral Rewards:</Text>
            {referralRewards.map((reward, index) => (
              <View key={index} style={styles.rewardItem}>
                <Text style={styles.rewardPlan}>{reward.plan}:</Text>
                <Text style={styles.rewardBonus}>{usd(reward.bonus)} bonus</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <SectionTitle 
            title="Network Summary" 
            subtitle="Your referral network statistics."
          />
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="people" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{appData.directReferrals}</Text>
              <Text style={styles.statLabel}>Direct Referrals</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="trending-up" size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>{appData.totalNetwork}</Text>
              <Text style={styles.statLabel}>Total Network</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="gift" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{usd(appData.networkEarnings)}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="layers" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{networkLevelsData.length}</Text>
              <Text style={styles.statLabel}>Network Levels</Text>
            </View>
          </View>
        </Card>

        {/* Direct Referrals */}
        <Card>
          <SectionTitle 
            title={`Direct Referrals (${appData.directReferrals})`} 
            subtitle="People you've directly referred to the platform."
          />
          
          {appData.directReferrals === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No direct referrals yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Share your referral code to start earning commissions!
              </Text>
            </View>
          ) : (
            <View style={styles.referralsList}>
              {/* TODO: Add actual referrals list */}
              <Text style={styles.comingSoon}>Referrals list coming soon...</Text>
            </View>
          )}
        </Card>

        {/* Network Tree */}
        <Card>
          <View style={styles.networkTreeHeader}>
            <Text style={styles.networkTreeTitle}>Network Tree</Text>
            <TouchableOpacity style={styles.showTreeButton} onPress={handleShowTree}>
              <Text style={styles.showTreeButtonText}>Show Tree</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.networkTreeContent}>
            <Text style={styles.networkTreeDescription}>
              Visual representation of your complete referral network structure.
            </Text>
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
    flex: 1,
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
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  referralCodeBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyCodeIcon: {
    padding: 4,
  },
  referralCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  referralRewards: {
    marginTop: 16,
  },
  referralRewardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rewardPlan: {
    fontSize: 14,
    color: '#374151',
  },
  rewardBonus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
    textAlign: 'center',
  },
  referralsList: {
    paddingVertical: 16,
  },
  comingSoon: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  networkTreeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  networkTreeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  showTreeButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  showTreeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  networkTreeContent: {
    paddingVertical: 16,
  },
  networkTreeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
