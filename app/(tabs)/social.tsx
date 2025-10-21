import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { SocialStats, SocialFeedItem, Friendship, FriendRequest, ReadingGroup, ReadingChallenge } from '../../types';
import SocialService from '../../services/socialService';
import ReadingGroupService from '../../services/readingGroupService';
import FriendshipService from '../../services/friendshipService';
import ReadingChallengeService from '../../services/readingChallengeService';
import GroupCard from '../../components/social/GroupCard';
import FriendCard, { FriendRequestCard } from '../../components/social/FriendCard';
import ProgressShareCard from '../../components/social/ProgressShareCard';
import ChallengeCard from '../../components/social/ChallengeCard';

export default function SocialTabScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'friends' | 'challenges'>('feed');
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [socialFeed, setSocialFeed] = useState<SocialFeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<ReadingGroup[]>([]);
  const [challenges, setChallenges] = useState<ReadingChallenge[]>([]);

  useEffect(() => {
    if (user) {
      loadSocialData();
    }
  }, [user, activeTab]);

  const loadSocialData = async () => {
    try {
      if (!user?.id) return;

      // Load social stats
      const stats = await SocialService.getSocialStats(user.id);
      setSocialStats(stats);

      // Load data based on active tab
      switch (activeTab) {
        case 'feed':
          const feed = await SocialService.getSocialFeed(user.id);
          setSocialFeed(feed);
          break;
        case 'friends':
          const [friendsList, requestsList] = await Promise.all([
            FriendshipService.getFriends(user.id),
            FriendshipService.getPendingRequests(user.id),
          ]);
          setFriends(friendsList);
          setFriendRequests(requestsList);
          break;
        case 'groups':
          const userGroups = await ReadingGroupService.getMyGroups(user.id);
          setGroups(userGroups);
          break;
        case 'challenges':
          const userChallenges = await ReadingChallengeService.getUserChallenges(user.id);
          setChallenges(userChallenges);
          break;
      }
    } catch (error) {
      console.error('Error loading social data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSocialData();
    setRefreshing(false);
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      const result = await FriendshipService.acceptFriendRequest(requestId);
      
      if (result) {
        Alert.alert('Success', 'Friend request accepted!');
        loadSocialData();
      } else {
        Alert.alert('Error', 'Failed to accept friend request');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      const result = await FriendshipService.rejectFriendRequest(requestId);
      
      if (result) {
        Alert.alert('Success', 'Friend request rejected');
        loadSocialData();
      } else {
        Alert.alert('Error', 'Failed to reject friend request');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const result = await ReadingGroupService.joinGroup(
        groupId, 
        user?.id || '', 
        user?.user_metadata?.full_name || 'User'
      );
      
      if (result) {
        Alert.alert('Success', 'You joined the group!');
        loadSocialData();
      } else {
        Alert.alert('Error', 'Failed to join group');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const result = await ReadingChallengeService.joinChallenge(
        challengeId, 
        user?.id || '', 
        user?.user_metadata?.full_name || 'User'
      );
      
      if (result) {
        Alert.alert('Success', 'You joined the challenge!');
        loadSocialData();
      } else {
        Alert.alert('Error', 'Failed to join challenge');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join challenge');
    }
  };

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="people" size={24} color="#10B981" />
        <Text style={styles.statNumber}>{socialStats?.totalFriends || 0}</Text>
        <Text style={styles.statLabel}>Friends</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="people" size={24} color="#3B82F6" />
        <Text style={styles.statNumber}>{socialStats?.totalGroups || 0}</Text>
        <Text style={styles.statLabel}>Groups</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="flag" size={24} color="#F59E0B" />
        <Text style={styles.statNumber}>{socialStats?.totalChallenges || 0}</Text>
        <Text style={styles.statLabel}>Challenges</Text>
      </View>
      
      <View style={styles.statCard}>
        <Ionicons name="share" size={24} color="#8B5CF6" />
        <Text style={styles.statNumber}>{socialStats?.sharedProgressCount || 0}</Text>
        <Text style={styles.statLabel}>Shared</Text>
      </View>
    </View>
  );

  const renderFeed = () => (
    <View style={styles.tabContent}>
      {socialFeed.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#374151" />
          <Text style={styles.emptyStateTitle}>No Activity Yet</Text>
          <Text style={styles.emptyStateText}>
            Connect with friends and join groups to see their progress here
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => router.push('/social/find-friends' as any)}
          >
            <Text style={styles.emptyStateButtonText}>Find Friends</Text>
          </TouchableOpacity>
        </View>
      ) : (
        socialFeed.map((item) => {
          if (item.type === 'shared_progress') {
            return (
              <ProgressShareCard
                key={item.id}
                progress={item.data as any}
                onPress={() => router.push(`/social/progress/${item.id}` as any)}
              />
            );
          } else if (item.type === 'group_activity') {
            return (
              <View key={item.id} style={styles.activityCard}>
                <Text style={styles.activityText}>{(item.data as any).description}</Text>
                <Text style={styles.activityTime}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </View>
            );
          } else if (item.type === 'challenge_update') {
            return (
              <ChallengeCard
                key={item.id}
                challenge={item.data as any}
                onPress={() => router.push(`/social/challenge/${item.id}` as any)}
              />
            );
          }
          return null;
        })
      )}
    </View>
  );

  const renderGroups = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => router.push('/social/create-group' as any)}
      >
        <Ionicons name="add-circle" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.discoverButton}
        onPress={() => router.push('/social/discover-groups' as any)}
      >
        <Ionicons name="compass" size={20} color="#10B981" />
        <Text style={styles.discoverButtonText}>Discover Groups</Text>
      </TouchableOpacity>

      {groups.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#374151" />
          <Text style={styles.emptyStateTitle}>No Groups Yet</Text>
          <Text style={styles.emptyStateText}>
            Join or create a reading group to learn together
          </Text>
        </View>
      ) : (
        groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onPress={() => router.push(`/social/group/${group.id}` as any)}
            onJoin={() => handleJoinGroup(group.id)}
            isMember={true}
            showJoinButton={false}
          />
        ))
      )}
    </View>
  );

  const renderFriends = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => router.push('/social/find-friends' as any)}
      >
        <Ionicons name="person-add" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Find Friends</Text>
      </TouchableOpacity>

      {friendRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friend Requests ({friendRequests.length})</Text>
          {friendRequests.map((request) => (
            <FriendRequestCard
              key={request.id}
              request={request}
              onAccept={() => handleAcceptFriendRequest(request.id)}
              onReject={() => handleRejectFriendRequest(request.id)}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Friends ({friends.length})</Text>
        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={64} color="#374151" />
            <Text style={styles.emptyStateTitle}>No Friends Yet</Text>
            <Text style={styles.emptyStateText}>
              Find and connect with friends to share your Quran journey
            </Text>
          </View>
        ) : (
          friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              userProfile={friend.friendProfile}
              onPress={() => router.push(`/social/profile/${friend.friendId}` as any)}
            />
          ))
        )}
      </View>
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => router.push('/social/create-challenge' as any)}
      >
        <Ionicons name="add-circle" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Challenge</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.discoverButton}
        onPress={() => router.push('/social/discover-challenges' as any)}
      >
        <Ionicons name="compass" size={20} color="#10B981" />
        <Text style={styles.discoverButtonText}>Discover Challenges</Text>
      </TouchableOpacity>

      {challenges.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flag-outline" size={64} color="#374151" />
          <Text style={styles.emptyStateTitle}>No Challenges Yet</Text>
          <Text style={styles.emptyStateText}>
            Join or create a reading challenge to stay motivated
          </Text>
        </View>
      ) : (
        challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onPress={() => router.push(`/social/challenge/${challenge.id}` as any)}
            onJoin={() => handleJoinChallenge(challenge.id)}
            isParticipant={true}
            showJoinButton={false}
          />
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/more' as any)}>
            <Ionicons name="grid" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/social/search' as any)} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {socialStats && renderStatsCards()}

      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'feed' && styles.tabButtonActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Ionicons
            name="home"
            size={20}
            color={activeTab === 'feed' ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === 'feed' && styles.tabButtonTextActive
          ]}>
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'groups' && styles.tabButtonActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'groups' ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === 'groups' && styles.tabButtonTextActive
          ]}>
            Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'friends' && styles.tabButtonActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Ionicons
            name="person"
            size={20}
            color={activeTab === 'friends' ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === 'friends' && styles.tabButtonTextActive
          ]}>
            Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'challenges' && styles.tabButtonActive]}
          onPress={() => setActiveTab('challenges')}
        >
          <Ionicons
            name="flag"
            size={20}
            color={activeTab === 'challenges' ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === 'challenges' && styles.tabButtonTextActive
          ]}>
            Challenges
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'groups' && renderGroups()}
        {activeTab === 'friends' && renderFriends()}
        {activeTab === 'challenges' && renderChallenges()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchButton: {
    marginLeft: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#10B981',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  discoverButton: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  discoverButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 24,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activityCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activityText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
});