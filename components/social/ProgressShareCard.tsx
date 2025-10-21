/**
 * Progress Share Card Component
 * Displays shared reading progress in social feed
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedProgress } from '../../types';

interface ProgressShareCardProps {
  progress: SharedProgress;
  onPress: () => void;
  onLike?: () => void;
  onComment?: () => void;
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
}

export default function ProgressShareCard({
  progress,
  onPress,
  onLike,
  onComment,
  isLiked = false,
  likeCount = 0,
  commentCount = 0,
}: ProgressShareCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    onLike?.();
  };

  const getProgressIcon = (type: string) => {
    switch (type) {
      case 'surah_completed':
        return 'book';
      case 'juz_completed':
        return 'library';
      case 'prayer_streak':
        return 'time';
      case 'reading_streak':
        return 'flame';
      case 'achievement':
        return 'trophy';
      default:
        return 'checkmark-circle';
    }
  };

  const getProgressColor = (type: string) => {
    switch (type) {
      case 'surah_completed':
        return '#10B981';
      case 'juz_completed':
        return '#3B82F6';
      case 'prayer_streak':
        return '#F59E0B';
      case 'reading_streak':
        return '#EF4444';
      case 'achievement':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const formatProgressValue = (type: string, value: number) => {
    switch (type) {
      case 'surah_completed':
        return `Surah ${value}`;
      case 'juz_completed':
        return `Juz ${value}`;
      case 'prayer_streak':
        return `${value} days`;
      case 'reading_streak':
        return `${value} days`;
      case 'achievement':
        return value.toString();
      default:
        return value.toString();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {progress.userName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{progress.userName || 'Unknown User'}</Text>
            <Text style={styles.timestamp}>
              {new Date(progress.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressType}>
          <Ionicons
            name={getProgressIcon(progress.type)}
            size={20}
            color={getProgressColor(progress.type)}
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{progress.title}</Text>
        {progress.description && (
          <Text style={styles.description}>{progress.description}</Text>
        )}
        
        <View style={styles.progressValue}>
          <Text style={[styles.value, { color: getProgressColor(progress.type) }]}>
            {formatProgressValue(progress.type, progress.value)}
          </Text>
        </View>
      </View>

      {progress.imageUrl && (
        <Image source={{ uri: progress.imageUrl }} style={styles.image} />
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? '#EF4444' : '#9CA3AF'}
          />
          <Text style={[styles.actionText, { color: liked ? '#EF4444' : '#9CA3AF' }]}>
            {likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
          <Text style={styles.actionText}>{commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
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
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressType: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  progressValue: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 4,
  },
});