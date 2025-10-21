/**
 * Group Card Component
 * Displays reading group information in a card format
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
import { ReadingGroup } from '../../types';

interface GroupCardProps {
  group: ReadingGroup;
  onPress: () => void;
  onJoin?: () => void;
  isMember?: boolean;
  showJoinButton?: boolean;
}

export default function GroupCard({
  group,
  onPress,
  onJoin,
  isMember = false,
  showJoinButton = true,
}: GroupCardProps) {
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
      default:
        return 'people';
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
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Ionicons
            name={getCategoryIcon(group.category)}
            size={20}
            color={getCategoryColor(group.category)}
          />
          <Text style={[styles.category, { color: getCategoryColor(group.category) }]}>
            {group.category}
          </Text>
        </View>
        
        {isMember && (
          <View style={styles.memberBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.memberText}>Member</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{group.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {group.description}
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="people" size={16} color="#9CA3AF" />
          <Text style={styles.statText}>{group.memberCount} members</Text>
        </View>
        
        <View style={styles.stat}>
          <Ionicons name="calendar" size={16} color="#9CA3AF" />
          <Text style={styles.statText}>
            {new Date(group.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.creatorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {group.creator?.user_metadata?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.creatorName}>
            {group.creator?.user_metadata?.full_name || 'Unknown User'}
          </Text>
        </View>

        {showJoinButton && !isMember && (
          <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>

      {group.tags && group.tags.length > 0 && (
        <View style={styles.tags}>
          {group.tags.slice(0, 3).map((tag, index) => (
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
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberText: {
    fontSize: 10,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '600',
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
  stats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  creatorName: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
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