/**
 * User Profile Screen
 * Display user stats, achievements, and settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import ReadingProgressService from '../services/readingProgressService';
import AchievementService from '../services/achievementService';
import DailyChallengeService from '../services/dailyChallengeService';

interface UserStats {
  totalVersesRead: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
  completedSurahs: number;
  bookmarkedVerses: number;
  achievements: number;
  level: number;
  points: number;
  rank: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentAchievements, setRecentAchievements] = useState([]);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      // Load various stats
      const progress = await ReadingProgressService.getProgress();
      const achievements = AchievementService.getUnlockedAchievements();
      const level = AchievementService.getUserLevel();
      const challengeStats = DailyChallengeService.getStats();

      setStats({
        totalVersesRead: progress?.totalVerses || 0,
        totalTimeSpent: progress?.totalMinutes || 0,
        currentStreak: progress?.currentStreak || 0,
        longestStreak: progress?.longestStreak || 0,
        completedSurahs: progress?.completedSurahs?.length || 0,
        bookmarkedVerses: 0, // Would load from bookmark service
        achievements: achievements.length,
        level: level.level,
        points: AchievementService.getTotalPoints(),
        rank: level.title,
      });

      setRecentAchievements(achievements.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('profile') || 'Profile'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
              <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.levelText}>Lvl {stats?.level}</Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {profile?.full_name || t('profile.user')}
              </Text>
              <Text style={[styles.userRank, { color: colors.accent }]}>
                {stats?.rank || t('profile.beginnerRank')}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]}>
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Points Progress */}
          <View style={styles.pointsContainer}>
            <View style={styles.pointsRow}>
              <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>
                {t('profile.totalPoints')}
              </Text>
              <Text style={[styles.pointsValue, { color: colors.primary }]}>
                {stats?.points || 0}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${((stats?.points || 0) % 1000) / 10}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.nextLevel, { color: colors.textMuted }]}>
              {1000 - ((stats?.points || 0) % 1000)} {t('profile.pointsToNextLevel')}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="book"
            label={t('profile.versesRead')}
            value={stats?.totalVersesRead || 0}
            color={colors.info}
            backgroundColor={colors.surface}
            textColor={colors.text}
          />
          <StatCard
            icon="time"
            label={t('profile.timeSpent')}
            value={formatTime(stats?.totalTimeSpent || 0)}
            color={colors.warning}
            backgroundColor={colors.surface}
            textColor={colors.text}
          />
          <StatCard
            icon="flame"
            label={t('profile.currentStreak')}
            value={`${stats?.currentStreak || 0} ${t('profile.days')}`}
            color={colors.error}
            backgroundColor={colors.surface}
            textColor={colors.text}
          />
          <StatCard
            icon="trophy"
            label="Achievements"
            value={stats?.achievements || 0}
            color={colors.success}
            backgroundColor={colors.surface}
            textColor={colors.text}
          />
        </View>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Achievements
              </Text>
              <TouchableOpacity onPress={() => router.push('/achievements')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            
            {recentAchievements.map((achievement: any) => (
              <View
                key={achievement.id}
                style={[styles.achievementItem, { backgroundColor: colors.surface }]}
              >
                <Text style={styles.achievementBadge}>{achievement.reward.badge}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementName, { color: colors.text }]}>
                    {achievement.name}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: colors.textSecondary }]}>
                    {achievement.description}
                  </Text>
                </View>
                <Text style={[styles.achievementPoints, { color: colors.primary }]}>
                  +{achievement.reward.points}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/reading-groups')}
            >
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Groups
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/statistics')}
            >
              <Ionicons name="stats-chart" size={24} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Statistics
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/bookmarks')}
            >
              <Ionicons name="bookmark" size={24} color={colors.warning} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Bookmarks
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/downloads')}
            >
              <Ionicons name="download" size={24} color={colors.success} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                Downloads
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color, backgroundColor, textColor }) {
  return (
    <View style={[styles.statCard, { backgroundColor }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: textColor + '99' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRank: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  pointsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pointsLabel: {
    fontSize: 14,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  nextLevel: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  achievementBadge: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
  },
  achievementPoints: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    marginTop: 8,
  },
});
