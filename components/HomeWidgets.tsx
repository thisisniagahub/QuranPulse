/**
 * Home Widget Components
 * Widget-like components for home screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

// Mini Prayer Times Widget
export function PrayerTimesWidget({ prayerTimes }) {
  const { colors } = useTheme();
  const router = useRouter();
  
  const nextPrayer = getNextPrayer(prayerTimes);
  
  return (
    <TouchableOpacity
      style={[styles.widget, { backgroundColor: colors.surface }]}
      onPress={() => router.push('/prayer')}
    >
      <View style={styles.widgetHeader}>
        <Ionicons name="time" size={20} color={colors.primary} />
        <Text style={[styles.widgetTitle, { color: colors.text }]}>
          Next Prayer
        </Text>
      </View>
      
      <Text style={[styles.widgetMainText, { color: colors.primary }]}>
        {nextPrayer.name}
      </Text>
      <Text style={[styles.widgetSubText, { color: colors.textSecondary }]}>
        {nextPrayer.time}
      </Text>
      
      <View style={[styles.widgetProgress, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.widgetProgressFill,
            { 
              backgroundColor: colors.primary,
              width: `${nextPrayer.progress}%`,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

// Daily Progress Widget
export function DailyProgressWidget({ progress }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  
  return (
    <TouchableOpacity
      style={[styles.widget, { backgroundColor: colors.surface }]}
      onPress={() => router.push('/progress')}
    >
      <View style={styles.widgetHeader}>
        <Ionicons name="trending-up" size={20} color={colors.success} />
        <Text style={[styles.widgetTitle, { color: colors.text }]}>
          {t('todayProgress') || "Today's Progress"}
        </Text>
      </View>
      
      <View style={styles.progressCircle}>
        <Text style={[styles.progressPercent, { color: colors.success }]}>
          {progress.percentage}%
        </Text>
      </View>
      
      <View style={styles.progressStats}>
        <View style={styles.progressStat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {progress.verses}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Verses
          </Text>
        </View>
        <View style={styles.progressStat}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {progress.minutes}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Minutes
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Quick Actions Widget
export function QuickActionsWidget() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const actions = [
    { icon: 'book', label: 'Continue', route: '/last-read', color: colors.primary },
    { icon: 'mic', label: 'Recite', route: '/recitation', color: colors.accent },
    { icon: 'bookmark', label: 'Saved', route: '/bookmarks', color: colors.warning },
    { icon: 'search', label: 'Search', route: '/search', color: colors.info },
  ];
  
  return (
    <View style={[styles.widgetWide, { backgroundColor: colors.surface }]}>
      <Text style={[styles.widgetTitle, { color: colors.text }]}>
        Quick Actions
      </Text>
      
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => router.push(action.route as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Streak Widget
export function StreakWidget({ streak }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.widgetSmall, { backgroundColor: colors.surface }]}>
      <Ionicons name="flame" size={32} color={colors.error} />
      <Text style={[styles.streakNumber, { color: colors.text }]}>
        {streak}
      </Text>
      <Text style={[styles.streakLabel, { color: colors.textMuted }]}>
        Day Streak
      </Text>
    </View>
  );
}

// Daily Challenge Widget
export function DailyChallengeWidget({ challenge }) {
  const { colors } = useTheme();
  const router = useRouter();
  
  return (
    <TouchableOpacity
      style={[styles.widgetWide, { backgroundColor: colors.surface }]}
      onPress={() => router.push('/challenges')}
    >
      <View style={styles.widgetHeader}>
        <Ionicons name="trophy" size={20} color={colors.warning} />
        <Text style={[styles.widgetTitle, { color: colors.text }]}>
          Daily Challenge
        </Text>
      </View>
      
      <Text style={[styles.challengeTitle, { color: colors.text }]}>
        {challenge.title}
      </Text>
      <Text style={[styles.challengeDesc, { color: colors.textSecondary }]}>
        {challenge.description}
      </Text>
      
      <View style={styles.challengeProgress}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { 
                backgroundColor: colors.warning,
                width: `${challenge.progress}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textMuted }]}>
          {challenge.current}/{challenge.target}
        </Text>
      </View>
      
      <View style={styles.challengeReward}>
        <Text style={styles.rewardBadge}>{challenge.reward.badge}</Text>
        <Text style={[styles.rewardPoints, { color: colors.warning }]}>
          +{challenge.reward.points} pts
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Recent Activity Widget
export function RecentActivityWidget({ activities }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.widgetWide, { backgroundColor: colors.surface }]}>
      <Text style={[styles.widgetTitle, { color: colors.text }]}>
        Recent Activity
      </Text>
      
      <View style={styles.activityList}>
        {activities.slice(0, 3).map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <Ionicons 
              name={activity.icon as any} 
              size={16} 
              color={colors.primary} 
            />
            <Text style={[styles.activityText, { color: colors.textSecondary }]}>
              {activity.text}
            </Text>
            <Text style={[styles.activityTime, { color: colors.textMuted }]}>
              {activity.time}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Helper function
function getNextPrayer(prayerTimes) {
  // This would calculate the actual next prayer
  return {
    name: 'Dhuhr',
    time: '12:45 PM',
    progress: 65,
  };
}

const styles = StyleSheet.create({
  widget: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  widgetWide: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  widgetSmall: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  widgetMainText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  widgetSubText: {
    fontSize: 14,
    marginBottom: 12,
  },
  widgetProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  widgetProgressFill: {
    height: '100%',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 12,
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 14,
    marginBottom: 12,
  },
  challengeProgress: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardBadge: {
    fontSize: 24,
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityList: {
    marginTop: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
  },
});

export default {
  PrayerTimesWidget,
  DailyProgressWidget,
  QuickActionsWidget,
  StreakWidget,
  DailyChallengeWidget,
  RecentActivityWidget,
};
