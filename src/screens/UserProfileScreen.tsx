import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, SectionTitle } from '../components/UI';
import { authService, User } from '../services/authService';
import { getUserData } from '../utils/auth';
import Toast from 'react-native-toast-message';

export default function UserProfileScreen({ navigation }: { navigation: any }) {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('🔄 UserProfile state changed:', {
      userProfile: userProfile ? 'exists' : 'null',
      isLoading,
      refreshing
    });
  }, [userProfile, isLoading, refreshing]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      console.log('🔵 Loading user profile...');
      const userData = await authService.getProfile();
      console.log('🟢 User data received:', userData);
      console.log('🟢 User data type:', typeof userData);
      console.log('🟢 User data keys:', userData ? Object.keys(userData) : 'null');
      setUserProfile(userData); // Backend returns user data directly
    } catch (error) {
      console.log('🔴 Profile Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Profile Error',
        text2: 'Failed to load profile information',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userProfile });
  };

  const handleKYCStatus = () => {
    if (userProfile?.status === 'active') {
      Alert.alert('KYC Status', 'Your account is verified and active!');
    } else {
      Alert.alert('KYC Status', 'Your account is pending verification. Please contact support.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    // In a real app, you'd use Clipboard API
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-circle-outline" size={64} color="#6B7280" />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>User Profile</Text>
          <Text style={styles.subtitle}>Your account information and settings</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color="#0EA5E9" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userEmail}>{userProfile.email}</Text>
              <TouchableOpacity 
                style={[
                  styles.kycBadge, 
                  userProfile.status === 'active' ? styles.kycVerified : styles.kycPending
                ]}
                onPress={handleKYCStatus}
              >
                <Ionicons 
                  name={userProfile.status === 'active' ? 'checkmark-circle' : 'time-outline'} 
                  size={16} 
                  color={userProfile.status === 'active' ? '#10B981' : '#F59E0B'} 
                />
                <Text style={[
                  styles.kycText,
                  userProfile.status === 'active' ? styles.kycTextVerified : styles.kycTextPending
                ]}>
                  {userProfile.status === 'active' ? 'Verified' : 'Pending Verification'}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={20} color="#0EA5E9" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Personal Information */}
        <Card>
          <SectionTitle 
            title="Personal Information" 
            subtitle="Your basic account details"
          />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Full Name</Text>
              </View>
              <Text style={styles.infoValue}>{userProfile.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Email Address</Text>
              </View>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{userProfile.email}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(userProfile.email, 'Email')}
                >
                  <Ionicons name="copy-outline" size={16} color="#0EA5E9" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Phone Number</Text>
              </View>
              <Text style={styles.infoValue}>{userProfile.phone || 'Not provided'}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Member Since</Text>
              </View>
              <Text style={styles.infoValue}>
                {new Date(userProfile.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Referral Information */}
        <Card>
          <SectionTitle 
            title="Referral Information" 
            subtitle="Your referral code and earnings"
          />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="share-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Your Referral Code</Text>
              </View>
              <View style={styles.infoValueContainer}>
                <Text style={styles.infoValue}>{userProfile.user_code}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(userProfile.user_code, 'Referral Code')}
                >
                  <Ionicons name="copy-outline" size={16} color="#0EA5E9" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="people-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabelText}>Referred By</Text>
              </View>
              <Text style={styles.infoValue}>
                {userProfile.referral_code || 'No referral code used'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Account Actions */}
        <Card>
          <SectionTitle 
            title="Account Actions" 
            subtitle="Manage your account settings"
          />
          
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={20} color="#0EA5E9" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleKYCStatus}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#0EA5E9" />
              <Text style={styles.actionButtonText}>KYC Status</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="notifications-outline" size={20} color="#0EA5E9" />
              <Text style={styles.actionButtonText}>Notification Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="lock-closed-outline" size={20} color="#0EA5E9" />
              <Text style={styles.actionButtonText}>Security Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
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
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  kycVerified: {
    backgroundColor: '#D1FAE5',
  },
  kycPending: {
    backgroundColor: '#FEF3C7',
  },
  kycText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  kycTextVerified: {
    color: '#10B981',
  },
  kycTextPending: {
    color: '#F59E0B',
  },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabelText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  actionsSection: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
