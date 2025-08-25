import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, SectionTitle } from '../components/UI';

interface MoreMenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

const menuItems: MoreMenuItem[] = [
  {
    id: 'active-investments',
    title: 'Active Investments',
    subtitle: 'Track your investment progress and earnings',
    icon: 'trending-up',
    route: 'ActiveInvestments',
    color: '#10B981',
  },
  {
    id: 'withdraw',
    title: 'Withdraw',
    subtitle: 'Withdraw your earnings',
    icon: 'arrow-up-circle',
    route: 'Withdraw',
    color: '#F59E0B',
  },
  {
    id: 'mining',
    title: 'Mining',
    subtitle: 'Start mining sessions and earn rewards',
    icon: 'cube',
    route: 'Mining',
    color: '#0EA5E9',
  },
  {
    id: 'history',
    title: 'Transaction History',
    subtitle: 'View your deposits and withdrawals',
    icon: 'time',
    route: 'TransactionHistory',
    color: '#8B5CF6',
  },
  {
    id: 'referrals',
    title: 'Referrals',
    subtitle: 'Invite friends and earn bonuses',
    icon: 'people',
    route: 'Referrals',
    color: '#F59E0B',
  },
  {
    id: 'about',
    title: 'About',
    subtitle: 'Learn more about InvestPro',
    icon: 'information-circle',
    route: 'About',
    color: '#6B7280',
  },
];

interface MoreScreenProps {
  navigation: any;
  route: any;
}

export default function MoreScreen({ navigation }: MoreScreenProps) {
  const handleMenuPress = (item: MoreMenuItem) => {
    navigation.navigate(item.route);
  };

  const renderMenuItem = (item: MoreMenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More Options</Text>
          <Text style={styles.headerSubtitle}>Access all features and settings</Text>
        </View>

        <Card style={styles.menuCard}>
          <SectionTitle title="Features" />
          {menuItems.map(renderMenuItem)}
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.infoText}>Your data is secure and encrypted</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#F59E0B" />
            <Text style={styles.infoText}>24/7 customer support available</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  menuCard: {
    margin: 20,
    marginTop: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    margin: 20,
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
  },
});
