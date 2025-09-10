import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, SectionTitle, Button } from '../components/UI';
import { getAppData, updateAppData } from '../utils/appData';
import { formatDuration } from '../utils/format';
import { miningService } from '../services/miningService';
import { newsService, NewsItem } from '../services/newsService';
import { dashboardService } from '../services/dashboardService';
import Toast from 'react-native-toast-message';

export default function MiningScreen() {
  const [miningSession, setMiningSession] = useState({
    startAt: null as number | null,
    phase: 'idle' as 'idle' | 'starting' | 'running' | 'completed',
    progress: 0, // 0..1
    reward_claimed: false,
  });

  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [progress, setProgress] = useState(0); // 0..1
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  // Balance gate
  const [totalBalance, setTotalBalance] = useState(0);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initialLoad();
  }, []);

  const initialLoad = async () => {
    await Promise.all([loadMiningData(), loadNews(), loadBalance()]);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadMiningData(), loadNews(), loadBalance()]);
    } finally {
      setRefreshing(false);
    }
  };

  const loadBalance = async () => {
    try {
      const dashboardResponse = await dashboardService.getDashboard();
      if (dashboardResponse?.success && dashboardResponse?.data) {
        setTotalBalance(Number(dashboardResponse.data.total_balance ?? 0));
      } else {
        const local = await getAppData();
        setTotalBalance(Number(local.totalBalance ?? 0));
      }
    } catch {
      const local = await getAppData();
      setTotalBalance(Number(local.totalBalance ?? 0));
    }
  };

  const normalizeServerProgress01 = (value: unknown) => {
    // Server might send "progress" as string percentage like -100.02 or number 0..1
    // Handle both; clamp to [0,1]
    const n = Number(value);
    if (!isFinite(n)) return 0;
    // If it looks like a percentage outside [0,1], convert to 0..1
    if (n > 1 || n < 0) return Math.min(Math.max(n / 100, 0), 1);
    return Math.min(Math.max(n, 0), 1);
  };

  const loadMiningData = async () => {
    try {
      const status = await miningService.getMiningStatus();
      
      console.log('Mining Status:', status);

      // Server keys seen: status.status, status.progress, status.time_remaining, status.started_at
      // session.rewards_claimed (plural) in your sample; fallback to reward_claimed
      const claimed =
        Boolean(status?.session?.rewards_claimed) ||
        Boolean(status?.session?.reward_claimed);

      const serverPhase: 'idle' | 'starting' | 'running' | 'completed' =
        status.status === 'active'
          ? 'running'
          : status.status === 'stopped'
          ? 'idle'
          : status.status;

      const normalizedProgress = normalizeServerProgress01(status.progress);
      const remaining = Math.max(Number(status.time_remaining ?? 0), 0);

      // If completed+claimed, treat UI like idle (user can start again)
      const effectivePhase =
        serverPhase === 'completed' && claimed ? 'idle' : serverPhase;

      const startAt =
        status.started_at || status?.session?.started_at
          ? new Date(status.started_at || status?.session?.started_at).getTime()
          : null;

      const newState = {
        startAt,
        phase: effectivePhase,
        progress: normalizedProgress,
        reward_claimed: claimed,
      };

      setMiningSession(newState);
      setProgress(normalizedProgress);
      setTimeLeft(remaining);

      // Persist for restarts
      await updateAppData({ miningSession: newState });

      // Kick animation to this progress
      Animated.timing(progressAnim, {
        toValue: normalizedProgress,
        duration: 500,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Mining Error',
        text2: `Failed to load mining data: ${errorMessage}`,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  const loadNews = async () => {
    try {
      setIsLoadingNews(true);
      const news = await newsService.getNews();
      setNewsItems(news);
    } catch (error) {
      console.log('Failed to load news:', error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const SESSION_DURATION = 24 * 60 * 60; // 24h (seconds)

  // Re-evaluate session on mount / startAt changes
  useEffect(() => {
    if (miningSession.startAt) {
      const startTime = new Date(miningSession.startAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);

      if (elapsed >= SESSION_DURATION) {
        const newSession = {
          ...miningSession,
          phase: miningSession.reward_claimed ? ('idle' as const) : ('completed' as const),
        };
        updateAppData({ miningSession: newSession });
        setMiningSession(newSession);
      } else {
        const newSession = { ...miningSession, phase: 'running' as const };
        updateAppData({ miningSession: newSession });
        setMiningSession(newSession);
        updateProgress(elapsed);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miningSession.startAt]);

  // Tick timer while running
  useEffect(() => {
    if (miningSession.phase === 'running') {
      intervalRef.current = setInterval(() => {
        if (!miningSession.startAt) return;
        const startTime = new Date(miningSession.startAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);

        if (elapsed >= SESSION_DURATION) {
          const newSession = {
            ...miningSession,
            phase: miningSession.reward_claimed ? ('idle' as const) : ('completed' as const),
          };
          updateAppData({ miningSession: newSession });
          setMiningSession(newSession);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          updateProgress(elapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miningSession.phase, miningSession.startAt, miningSession.reward_claimed]);

  const updateProgress = (elapsed: number) => {
    const newProgress = Math.min(Math.max(elapsed / SESSION_DURATION, 0), 1);
    const newTimeLeft = Math.max(SESSION_DURATION - elapsed, 0);

    setProgress(newProgress);
    setTimeLeft(newTimeLeft);

    Animated.timing(progressAnim, {
      toValue: newProgress,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();
  };

  const handleStartMining = async () => {
    if (totalBalance <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Insufficient Balance',
        text2: 'You need a positive balance to start mining.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      await miningService.startMining();
      await Promise.all([loadMiningData(), loadBalance()]);
    } catch (error) {
      console.error('Error starting mining:', error);
      Toast.show({
        type: 'error',
        text1: 'Start Failed',
        text2: error instanceof Error ? error.message : 'Unable to start mining.',
        position: 'top',
      });
    }
  };

  const handleStartNewSession = async () => {
    try {
      // stop previous (if any), then reset to idle
      await miningService.stopMining();
      const reset = { startAt: null, phase: 'idle' as const, progress: 0, reward_claimed: false };
      setMiningSession(reset);
      setProgress(0);
      setTimeLeft(0);
      progressAnim.setValue(0);
      await loadBalance();
    } catch (error) {
      console.error('Error stopping mining:', error);
    }
  };

  const handleClaimRewards = async () => {
    try {
      await miningService.claimRewards();
      // After claim, server should flip rewards_claimed true → we’ll reflect that
      await Promise.all([loadMiningData(), loadBalance()]);
    } catch (error) {
      console.error('Error claiming rewards:', error);
      Toast.show({
        type: 'error',
        text1: 'Claim Failed',
        text2: error instanceof Error ? error.message : 'Unable to claim rewards.',
        position: 'top',
      });
    }
  };

  const getPhaseSubtitle = () => {
    // Use *server-intent* messaging
    if (miningSession.phase === 'idle') {
      return miningSession.reward_claimed
        ? 'Reward claimed — start a new mining session'
        : 'Ready to start mining session';
    }
    if (miningSession.phase === 'starting') return 'Initializing mining process...';
    if (miningSession.phase === 'running') return 'Mining in progress';
    if (miningSession.phase === 'completed') {
      return miningSession.reward_claimed
        ? 'Completed — you can start a new session'
        : 'Mining session completed — claim your reward';
    }
    return 'Ready to start mining session';
  };

  const getPhaseColor = () => {
    switch (miningSession.phase) {
      case 'idle':
        return '#6B7280';
      case 'starting':
        return '#F59E0B';
      case 'running':
        return '#10B981';
      case 'completed':
        return miningSession.reward_claimed ? '#3B82F6' : '#0EA5E9';
      default:
        return '#6B7280';
    }
  };

  const getPhaseIcon = () => {
    if (miningSession.phase === 'completed') {
      return miningSession.reward_claimed ? 'checkmark-circle' : 'gift';
    }
    switch (miningSession.phase) {
      case 'idle':
        return 'play-circle';
      case 'starting':
        return 'hourglass';
      case 'running':
        return 'cube';
      default:
        return 'play-circle';
    }
  };

  const canStart = useMemo(() => totalBalance > 0, [totalBalance]);

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
          <Text style={styles.title}>Mining</Text>
          <Text style={styles.subtitle}>
            Participate in our mining program and earn rewards
          </Text>
        </View>

        {/* Chain Status */}
        <Card>
          <SectionTitle title="Chain Status" subtitle={getPhaseSubtitle()} />

          <View style={styles.statusContainer}>
            <View style={styles.statusIcon}>
              <Ionicons name={getPhaseIcon() as any} size={32} color={getPhaseColor()} />
            </View>

            <View style={styles.statusInfo}>
              <Text style={styles.phaseText}>
                {miningSession.phase.charAt(0).toUpperCase() + miningSession.phase.slice(1)}
              </Text>
              <Text style={styles.progressText}>{Math.round(progress * 100)}% Complete</Text>
              {miningSession.phase === 'running' && (
                <Text style={styles.timeLeftText}>{formatDuration(timeLeft)} remaining</Text>
              )}
              {miningSession.phase === 'idle' && totalBalance <= 0 && (
                <Text style={styles.insufficientText}>Add funds to your account to start mining.</Text>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: getPhaseColor(),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Idle (or completed+claimed → effective idle): can start if balance */}
            {miningSession.phase === 'idle' && (
              <Button
                title={canStart ? 'Start Mining' : 'Insufficient Balance'}
                onPress={handleStartMining}
                style={styles.actionButton}
                disabled={!canStart}
              />
            )}

            {miningSession.phase === 'starting' && (
              <Button title="Starting..." onPress={() => {}} disabled style={styles.actionButton} />
            )}

            {miningSession.phase === 'running' && (
              <Button title="Mining..." onPress={() => {}} disabled style={styles.actionButton} />
            )}

            {/* Completed: show Claim OR allow Start New Session depending on reward_claimed */}
            {miningSession.phase === 'completed' && (
              <View style={styles.completedActions}>
                <View style={styles.completedStatus}>
                  <Ionicons
                    name={miningSession.reward_claimed ? 'checkmark-circle' : 'gift'}
                    size={24}
                    color={miningSession.reward_claimed ? '#10B981' : '#0EA5E9'}
                  />
                  <Text style={styles.completedText}>
                    {miningSession.reward_claimed ? 'Completed' : 'Reward Available'}
                  </Text>
                </View>

                {!miningSession.reward_claimed ? (
                  // Only claim, no start
                  <Button title="Claim Rewards" onPress={handleClaimRewards} style={styles.actionButton} />
                ) : (
                  // Reward already claimed → let them start a new session
                  <Button
                    title="Start New Session"
                    onPress={handleStartNewSession}
                    variant="secondary"
                    style={styles.actionButton}
                  />
                )}
              </View>
            )}
          </View>
        </Card>

        {/* Mining Information */}
        <Card>
          <SectionTitle title="Mining Information" subtitle="Learn about our mining program." />

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color="#3B82F6" />
              <Text style={styles.infoTitle}>Session Duration</Text>
              <Text style={styles.infoValue}>24 Hours</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
              <Text style={styles.infoTitle}>Reward Rate</Text>
              <Text style={styles.infoValue}>Variable</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="shield" size={20} color="#F59E0B" />
              <Text style={styles.infoTitle}>Security</Text>
              <Text style={styles.infoValue}>High</Text>
            </View>
          </View>

          <Text style={styles.descriptionText}>
            We simulate block confirmations and mining operations to provide a realistic mining experience.
            Rewards are calculated based on your mining performance and can be claimed once the session is completed.
          </Text>
        </Card>

        {/* Mining Statistics (Matrix rain) */}
        <Card>
          <SectionTitle title="Mining Statistics" subtitle="Your mining performance overview." />
          <MatrixRain />
        </Card>

        {/* How Mining Works */}
        <Card>
          <SectionTitle title="How Mining Works" subtitle="Understanding the mining process." />

          <View style={styles.howItWorks}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Start Session</Text>
                <Text style={styles.stepDescription}>
                  Begin a 24-hour mining session by clicking the start button
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Mining Process</Text>
                <Text style={styles.stepDescription}>
                  Our system simulates mining operations and block confirmations
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Reward Calculation</Text>
                <Text style={styles.stepDescription}>
                  Rewards are calculated based on mining performance and session completion
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Claim Rewards</Text>
                <Text style={styles.stepDescription}>
                  Claim your mining rewards once the session is completed
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Important Notes */}
        <Card>
          <SectionTitle title="Important Notes" subtitle="Please read before starting mining." />

          <View style={styles.notesContainer}>
            <Text style={styles.noteText}>• Mining sessions run for exactly 24 hours from start time</Text>
            <Text style={styles.noteText}>• Progress is saved automatically and persists across app restarts</Text>
            <Text style={styles.noteText}>• Rewards are calculated based on session completion and performance</Text>
            <Text style={styles.noteText}>• You can only have one active mining session at a time</Text>
            <Text style={styles.noteText}>• Mining rewards will be added to your account balance upon completion</Text>
          </View>
        </Card>

        {/* Daily News & Updates */}
        <Card>
          <SectionTitle
            title="Daily News & Updates"
            subtitle="Latest updates and announcements from InvestPro."
          />

          <View style={styles.newsContainer}>
            {isLoadingNews ? (
              <View style={styles.newsLoading}>
                <Text style={styles.newsLoadingText}>Loading news...</Text>
              </View>
            ) : newsItems?.length > 0 ? (
              newsItems?.map((item) => (
                <View key={item.id} style={styles.newsItem}>
                  <View style={styles.newsHeader}>
                    <View style={styles.newsBadge}>
                      <Text style={styles.newsBadgeText}>{item.type.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.newsDate}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsContent}>{item.content}</Text>
                </View>
              ))
            ) : (
              <View style={styles.newsEmpty}>
                <Text style={styles.newsEmptyText}>No news available at the moment</Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

/** ───────────────────────────────────────────────────────────
 * Matrix-style code rain
 * ───────────────────────────────────────────────────────────
 */
const MatrixRain = () => {
  const HEIGHT = 180;
  const COLS = 12;
  const ROWS = 22;
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%#@!*+-';
  const [tick, setTick] = useState(0);

  const anims = useRef(
    Array.from({ length: COLS }).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const loops = anims.map((val, i) => {
      const duration = 3000 + (i % 5) * 500;
      return Animated.loop(
        Animated.timing(val, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
    });
    loops.forEach((l) => l.start());

    const id = setInterval(() => setTick((t) => (t + 1) % 1000000), 1200);

    return () => {
      loops.forEach((l) => l.stop());
      clearInterval(id);
    };
  }, [anims]);

  const randomChar = () => CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));

  return (
    <View style={[styles.matrixPanel, { height: HEIGHT }]}>
      {anims.map((val, colIdx) => {
        const translateY = val.interpolate({
          inputRange: [0, 1],
          outputRange: [-HEIGHT, HEIGHT],
        });

        const leftPct = (colIdx / COLS) * 100;

        const glyphs = Array.from({ length: ROWS }).map((_, rowIdx) => {
          const opacity = Math.max(0.15, Math.min(1, rowIdx / ROWS + 0.2));
          const size = 12 + ((rowIdx % 5) === 0 ? 1 : 0);
          return (
            <Text
              key={`${colIdx}-${rowIdx}-${tick}`}
              style={{
                color: '#22c55e',
                fontFamily: 'Courier',
                fontSize: size,
                opacity,
                lineHeight: 14,
              }}
            >
              {randomChar()}
            </Text>
          );
        });

        return (
          <Animated.View
            key={`col-${colIdx}`}
            style={[styles.matrixColumn, { left: `${leftPct}%`, transform: [{ translateY }] }]}
          >
            {glyphs}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1, padding: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  statusIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  statusInfo: { flex: 1 },
  phaseText: { fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  progressText: { fontSize: 16, color: '#6B7280', marginBottom: 2 },
  timeLeftText: { fontSize: 14, color: '#10B981', fontWeight: '500' },
  insufficientText: { fontSize: 13, color: '#DC2626', marginTop: 4 },
  progressContainer: { marginBottom: 24 },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressPercentage: { fontSize: 14, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
  buttonContainer: { marginBottom: 16 },
  actionButton: { width: '100%' },
  completedActions: { alignItems: 'center', gap: 12 },
  completedStatus: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  completedText: { fontSize: 18, fontWeight: '600', color: '#10B981', marginLeft: 8 },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  infoItem: { alignItems: 'center', flex: 1 },
  infoTitle: { fontSize: 12, color: '#6B7280', marginTop: 8, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  descriptionText: { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  // Matrix Rain
  matrixPanel: {
    backgroundColor: '#0b1220', borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#0f172a', position: 'relative', marginTop: 8,
  },
  matrixColumn: { position: 'absolute', top: -20, width: '8%', alignItems: 'center' },

  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statItem: {
    width: '48%', alignItems: 'center', paddingVertical: 16,
    backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 12,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  howItWorks: { marginTop: 16 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#0EA5E9',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  stepNumberText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  stepDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  notesContainer: { marginTop: 16 },
  noteText: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 8 },
  newsContainer: { gap: 16 },
  newsItem: {
    padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: '#0EA5E9',
  },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  newsBadge: { backgroundColor: '#0EA5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  newsBadgeText: { fontSize: 10, fontWeight: '600', color: 'white' },
  newsDate: { fontSize: 12, color: '#6B7280' },
  newsTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  newsContent: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  newsLoading: { alignItems: 'center', paddingVertical: 20 },
  newsLoadingText: { fontSize: 14, color: '#6B7280' },
  newsEmpty: { alignItems: 'center', paddingVertical: 20 },
  newsEmptyText: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
});
