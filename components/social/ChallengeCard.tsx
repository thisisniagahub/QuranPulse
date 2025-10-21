/**
 * Challenge Card Component
 * Displays reading challenge information in a card format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReadingChallenge } from '../../types';

interface ChallengeCardProps {
  challenge: ReadingChallenge;
  onPress: () => void;
  onJoin?: () => void;
  isParticipant?: boolean;
  showJoinButton?: boolean;
}

export default function ChallengeCard({
  challenge,
  onPress,
  onJoin,
  isParticipant = false,
  showJoinButton = true,
}: ChallengeCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'quran':
        return 'book';
      case 'hadith':
        return 'library';
      case 'prayer':
        return 'time';
      case 'learning':
        return 'school';
      case 'streak':
        return 'flame';
      case 'speed':
        return 'speedometer';
      default:
        return 'flag';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'quran':
        return '#10B981';
      case 'hadith':
        return '#3B82F6';
      case 'prayer':
        return '#F59E0B';
      case 'learning':
        return '#8B5CF6';
      case 'streak':
        return '#EF4444';
      case 'speed':
        return '#06B6D4';
      default:
        return '#6B7280';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#10B981';
      case 'medium':
        return '#F59E0B';
      case 'hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatTargetValue = (type: string, value: number) => {
    switch (type) {
      case 'surahs':
        return `${value} Surahs`;
      case 'juz':
        return `${value} Juz`;
      case 'verses':
        return `${value} Verses`;
      case 'days':
        return `${value} Days`;
      case 'hours':
        return `${value} Hours`;
      default:
        return value.toString();
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    return `${diffDays} days left`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Ionicons
            name={getCategoryIcon(challenge.category)}
            size={20}
            color={getCategoryColor(challenge.category)}
          />
          <Text style={[styles.category, { color: getCategoryColor(challenge.category) }]}>
            {challenge.category}
          </Text>
        </View>
        
        <View style={styles.difficultyContainer}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
            <Text style={styles.difficultyText}>{challenge.difficulty}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      <View style={styles.targetContainer}>
        <View style={styles.targetItem}>
          <Ionicons name="target" size={16} color="#9CA3AF" />
          <Text style={styles.targetText}>
            {formatTargetValue(challenge.targetType, challenge.targetValue)}
          </Text>
        </View>
        
        <View style={styles.targetItem}>
          <Ionicons name="people" size={16} color="#9CA3AF" />
          <Text style={styles.targetText}>{challenge.participantCount} participants</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min((challenge.currentProgress || 0) / challenge.targetValue * 100, 100)}%`,
                backgroundColor: getCategoryColor(challenge.category)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {challenge.currentProgress || 0} / {challenge.targetValue}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.timeInfo}>
          <Ionicons name="time" size={16} color="#9CA3AF" />
          <Text style={styles.timeText}>{getTimeRemaining()}</Text>
        </View>

        {showJoinButton && !isParticipant && (
          <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}

        {isParticipant && (
          <View style={styles.participantBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.participantText}>Participating</Text>
          </View>
        )}
      </View>

      {challenge.tags && challenge.tags.length > 0 && (
        <View style={styles.tags}>
          {challenge.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 12,
  },
  targetContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  targetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  targetText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  participantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantText: {
    fontSize: 10,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});