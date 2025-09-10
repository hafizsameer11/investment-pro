// screens/AboutScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, SectionTitle } from '../components/UI';
import { dashboardService } from '../services/dashboardService';

// ===== Configurable growth settings =====
const EMAIL = 'smith@investpro.agency';
// Treat total_users as the base at START_DATE and grow by GROWTH_PER_DAY
const GROWTH_START_DATE = '2025-01-01'; // YYYY-MM-DD
const GROWTH_PER_DAY = 3;               // users added per day

function daysSince(dateStr) {
  try {
    const start = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

export default function AboutScreen() {
  const [aboutData, setAboutData] = useState({
    total_users: 480, // base at START_DATE
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAbout();
      console.log('🟢 About data loaded:', data);
      if (data && typeof data === 'object') {
        // Expecting { total_users: number, ... }
        setAboutData(prev => ({
          ...prev,
          total_users: Number(data.total_users) || prev.total_users,
        }));
      }
    } catch (error) {
      console.log('🔴 About data error:', error);
      // Keep defaults if API fails
    } finally {
      setLoading(false);
    }
  };

  const openEmail = async (email) => {
    const url = `mailto:${email}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      return Linking.openURL(url);
    }
    Alert.alert('Email Error', 'No email client found on this device.');
  };

  const handleContact = (type) => {
    switch (type) {
      case 'email':
        openEmail(EMAIL);
        break;
      default:
        Alert.alert('Contact', `Contact via ${type}`);
    }
  };

  // Compute daily-growing Active Users count
  const activeUsers = useMemo(() => {
    const base = Number(aboutData?.total_users ?? 0);
    const d = daysSince(GROWTH_START_DATE);
    const grown = base + d * GROWTH_PER_DAY;
    return grown > 0 ? grown : base;
  }, [aboutData?.total_users]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>About InvestPro</Text>
          <Text style={styles.subtitle}>
            Your trusted partner in intelligent investing. We combine cutting-edge technology with proven strategies to maximize your investment potential.
          </Text>
        </View>

        {/* Our Mission */}
        <Card>
          <View style={styles.missionContainer}>
            <View style={styles.missionImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop' }}
                style={styles.missionImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.missionContent}>
              <Text style={styles.missionTitle}>Our Mission</Text>
              <Text style={styles.missionText}>
                At InvestPro, we believe that everyone deserves access to professional-grade investment opportunities. Our mission is to democratize wealth creation through innovative technology and transparent investment strategies.
              </Text>
              <Text style={styles.missionText}>
                Founded in 2020 by a team of experienced financial professionals and technology experts, we've helped thousands of investors achieve their financial goals through our carefully curated investment plans.
              </Text>

              {/* Stats (Only Active Users, auto-growing) */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activeUsers.toLocaleString()}+</Text>
                  <Text style={styles.statLabel}>Active Users</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* How It Works */}
        <Card>
          <SectionTitle
            title="How It Works"
            subtitle="Your journey to financial growth starts here."
          />

          <View style={styles.stepsContainer}>
            <View className="step" style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Sign Up & Verify</Text>
                <Text style={styles.stepDescription}>
                  Create your account and complete our secure KYC verification process
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Choose Your Plan</Text>
                <Text style={styles.stepDescription}>
                  Select from our range of investment plans tailored to your risk tolerance
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Fund Your Account</Text>
                <Text style={styles.stepDescription}>
                  Make a secure deposit using bank transfer or cryptocurrency
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Watch It Grow</Text>
                <Text style={styles.stepDescription}>
                  Monitor your investments and receive daily profit distributions
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Security First */}
        <Card>
          <SectionTitle
            title="Security First"
            subtitle="Your security is our top priority."
          />

          <Text style={styles.securityDescription}>
            Your security is our top priority. We employ bank-level encryption and multi-layer security protocols to protect your funds and personal information.
          </Text>

          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.securityFeatureText}>256-bit SSL encryption</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.securityFeatureText}>Two-factor authentication</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.securityFeatureText}>Cold storage for crypto assets</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.securityFeatureText}>Regular security audits</Text>
            </View>
            <View style={styles.securityFeature}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.securityFeatureText}>Regulatory compliance</Text>
            </View>
          </View>
        </Card>

        {/* Investment Strategy */}
        <Card>
          <SectionTitle
            title="Our Investment Strategy"
            subtitle="We employ a diversified approach combining traditional and innovative investment methods."
          />

          <View style={styles.strategyContainer}>
            <View style={styles.strategyItem}>
              <View style={styles.strategyIcon}>
                <Ionicons name="trending-up" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.strategyTitle}>Diversified Portfolio</Text>
              <Text style={styles.strategyDescription}>
                We spread investments across multiple asset classes to minimize risk and maximize returns
              </Text>
            </View>

            <View style={styles.strategyItem}>
              <View style={styles.strategyIcon}>
                <Ionicons name="analytics" size={24} color="#10B981" />
              </View>
              <Text style={styles.strategyTitle}>AI-Powered Analysis</Text>
              <Text style={styles.strategyDescription}>
                Advanced algorithms analyze market trends and optimize investment decisions in real-time
              </Text>
            </View>

            <View style={styles.strategyItem}>
              <View style={styles.strategyIcon}>
                <Ionicons name="shield" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.strategyTitle}>Risk Management</Text>
              <Text style={styles.strategyDescription}>
                Comprehensive risk assessment and management protocols protect your investments
              </Text>
            </View>
          </View>
        </Card>

        {/* Owner */}
        <Card>
          <SectionTitle
            title="Owner"
            subtitle="Leadership behind InvestPro."
          />
          <View style={styles.ownerContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              }}


              style={styles.ownerAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>PAUL SMITH</Text>
              <Text style={styles.ownerRole}>Founder</Text>
              <Text style={styles.ownerBio}>
                Paul is a fintech strategist with a decade of experience in algorithmic trading and portfolio risk management.
                Before InvestPro, he led quant research at a boutique hedge fund, where he helped design data-driven strategies
                for multi-asset portfolios. He’s passionate about making professional investing accessible to everyone.
              </Text>
            </View>
          </View>
        </Card>

        {/* Risk Disclosure */}
        <Card>
          <SectionTitle
            title="Important Risk Disclosure"
            subtitle="Please read carefully before investing."
          />

          <View style={styles.riskContainer}>
            <View style={styles.riskItem}>
              <Text style={styles.riskTitle}>Investment Risk</Text>
              <Text style={styles.riskText}>
                All investments carry inherent risks, and past performance does not guarantee future results. The value of investments can go down as well as up.
              </Text>
            </View>

            <View style={styles.riskItem}>
              <Text style={styles.riskTitle}>Capital at Risk</Text>
              <Text style={styles.riskText}>
                You may not get back the full amount you invested. Only invest money you can afford to lose.
              </Text>
            </View>

            <View style={styles.riskItem}>
              <Text style={styles.riskTitle}>Market Volatility</Text>
              <Text style={styles.riskText}>
                Investment returns can be affected by market volatility, economic conditions, and other factors beyond our control.
              </Text>
            </View>

            <View style={styles.riskItem}>
              <Text style={styles.riskTitle}>Regulatory Changes</Text>
              <Text style={styles.riskText}>
                Changes in laws and regulations may affect the investment landscape and your returns.
              </Text>
            </View>
          </View>
        </Card>

        {/* Get in Touch */}
        <Card>
          <SectionTitle
            title="Get in Touch"
            subtitle="We're here to help you succeed."
          />

          <View style={styles.contactContainer}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContact('email')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color="#3B82F6" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactValue}>{EMAIL}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Support Email */}
        <Card>
          <View style={styles.supportContainer}>
            <View style={styles.supportHeader}>
              <Ionicons name="help-circle" size={24} color="#0EA5E9" />
              <Text style={styles.supportTitle}>Need Help?</Text>
            </View>
            <Text style={styles.supportText}>
              For any questions, technical support, or account assistance, please contact us at:
            </Text>
            <TouchableOpacity
              style={styles.supportEmailContainer}
              onPress={() => handleContact('email')}
            >
              <Text style={styles.supportEmail}>{EMAIL}</Text>
              <Ionicons name="mail-outline" size={20} color="#0EA5E9" />
            </TouchableOpacity>
            <Text style={styles.supportNote}>
              Our support team is available 24/7 to assist you with any inquiries.
            </Text>
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

  missionContainer: { flexDirection: 'column', marginBottom: 20 },
  missionImageContainer: { width: 'auto', height: 170, marginRight: 16 },
  missionImage: { width: '100%', height: '100%', borderRadius: 8 },
  missionContent: { flex: 1 },
  missionTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  missionText: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 12 },

  statsContainer: { flexDirection: 'row', marginTop: 16, gap: 12 },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#0EA5E9', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },

  stepsContainer: { marginTop: 16 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  stepIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#0EA5E9',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  stepNumber: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  stepDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  securityDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
  securityFeatures: { marginTop: 16 },
  securityFeature: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  securityFeatureText: { fontSize: 14, color: '#374151', marginLeft: 12 },

  strategyContainer: { marginTop: 16 },
  strategyItem: { marginBottom: 24 },
  strategyIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  strategyTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  strategyDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  ownerContainer: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  ownerAvatar: { width: 72, height: 72, borderRadius: 36, marginRight: 8 },
  ownerName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  ownerRole: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  ownerBio: { fontSize: 14, color: '#4B5563', lineHeight: 20 },

  riskContainer: { marginTop: 16 },
  riskItem: { marginBottom: 20 },
  riskTitle: { fontSize: 16, fontWeight: '600', color: '#DC2626', marginBottom: 8 },
  riskText: { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  contactContainer: { marginTop: 16 },
  contactItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  contactIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  contactContent: { flex: 1 },
  contactTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  contactValue: { fontSize: 14, color: '#6B7280' },

  supportContainer: { alignItems: 'center', paddingVertical: 20 },
  supportHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  supportTitle: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginLeft: 8 },
  supportText: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, marginBottom: 16 },
  supportEmailContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF',
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginBottom: 16,
  },
  supportEmail: { fontSize: 18, fontWeight: '600', color: '#0EA5E9', marginRight: 8 },
  supportNote: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});
