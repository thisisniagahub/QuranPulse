/**
 * Friend Card Component
 * Displays friend information and friend request cards
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
import { Friendship, FriendRequest, UserProfile } from '../../types';

interface FriendCardProps {
  friend: Friendship;
  userProfile?: UserProfile;
  onPress: () => void;
}

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}

export function FriendCard({ friend, userProfile, onPress }: FriendCardProps) {
  const profile = userProfile || friend.friendProfile;
  const displayName = profile?.user_metadata?.full_name || 'Unknown User';
  const username = profile?.username || '';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{displayName}</Text>
        {username && <Text style={styles.username}>@{username}</Text>}
        <Text style={styles.friendSince}>
          Friends since {new Date(friend.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export function FriendRequestCard({ request, onAccept, onReject }: FriendRequestCardProps) {
  const fromUser = request.fromUser;
  const displayName = fromUser?.user_metadata?.full_name || 'Unknown User';
  const username = fromUser?.username || '';

  return (
    <View style={styles.requestContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.requestInfo}>
        <Text style={styles.name}>{displayName}</Text>
        {username && <Text style={styles.username}>@{username}</Text>}
        {request.message && (
          <Text style={styles.message}>"{request.message}"</Text>
        )}
        <Text style={styles.requestTime}>
          {new Date(request.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
          <Ionicons name="close" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  username: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  friendSince: {
    fontSize: 12,
    color: '#6B7280',
  },
  requestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  message: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  requestTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});