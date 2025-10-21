-- Social Features Schema for QuranPulse App
-- Run these commands in your Supabase SQL Editor

-- Reading Groups Table
CREATE TABLE IF NOT EXISTS reading_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  members JSONB NOT NULL DEFAULT '[]',
  target JSONB NOT NULL,
  progress JSONB NOT NULL DEFAULT '{"total": 0, "completed": 0, "percentage": 0}',
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  max_members INTEGER,
  tags JSONB DEFAULT '[]',
  rules JSONB DEFAULT '[]',
  schedule JSONB
);

-- Group Activities Table
CREATE TABLE IF NOT EXISTS group_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES reading_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('joined', 'completed', 'milestone', 'message', 'progress')),
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Friend Requests Table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Shared Progress Table
CREATE TABLE IF NOT EXISTS shared_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_id INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  progress_type TEXT NOT NULL CHECK (progress_type IN ('verse_completed', 'surah_completed', 'milestone', 'streak')),
  message TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  likes JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]'
);

-- Reading Challenges Table
CREATE TABLE IF NOT EXISTS reading_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES reading_groups(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly', 'khatam')),
  target_amount INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  participants JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reading_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Reading Groups
CREATE POLICY "Users can view public groups" ON reading_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own groups" ON reading_groups FOR SELECT USING (
  created_by = auth.uid() OR 
  members @> '[{"id": "' || auth.uid() || '"}]'
);
CREATE POLICY "Users can create groups" ON reading_groups FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Group admins can update groups" ON reading_groups FOR UPDATE USING (
  created_by = auth.uid() OR
  members @> '[{"id": "' || auth.uid() || '", "role": "admin"}]'
);
CREATE POLICY "Group admins can delete groups" ON reading_groups FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for Group Activities
CREATE POLICY "Users can view activities of their groups" ON group_activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM reading_groups 
    WHERE id = group_id AND 
    (is_public = true OR members @> '[{"id": "' || auth.uid() || '"}]')
  )
);
CREATE POLICY "Group members can create activities" ON group_activities FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM reading_groups 
    WHERE id = group_id AND 
    members @> '[{"id": "' || auth.uid() || '"}]'
  )
);

-- RLS Policies for Friendships
CREATE POLICY "Users can view their own friendships" ON friendships FOR SELECT USING (
  user_id = auth.uid() OR friend_id = auth.uid()
);
CREATE POLICY "Users can create friendships" ON friendships FOR INSERT WITH CHECK (
  user_id = auth.uid() OR friend_id = auth.uid()
);
CREATE POLICY "Users can update their friendships" ON friendships FOR UPDATE USING (
  user_id = auth.uid() OR friend_id = auth.uid()
);
CREATE POLICY "Users can delete their friendships" ON friendships FOR DELETE USING (
  user_id = auth.uid() OR friend_id = auth.uid()
);

-- RLS Policies for Friend Requests
CREATE POLICY "Users can view their friend requests" ON friend_requests FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "Users can create friend requests" ON friend_requests FOR INSERT WITH CHECK (
  sender_id = auth.uid()
);
CREATE POLICY "Users can update received requests" ON friend_requests FOR UPDATE USING (
  receiver_id = auth.uid()
);
CREATE POLICY "Users can delete their requests" ON friend_requests FOR DELETE USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- RLS Policies for Shared Progress
CREATE POLICY "Users can view public progress" ON shared_progress FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view friends' progress" ON shared_progress FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM friendships 
    WHERE ((user_id = auth.uid() AND friend_id = shared_progress.user_id) OR 
           (friend_id = auth.uid() AND user_id = shared_progress.user_id)) 
    AND status = 'accepted'
  )
);
CREATE POLICY "Users can view their own progress" ON shared_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own progress" ON shared_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own progress" ON shared_progress FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own progress" ON shared_progress FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for Reading Challenges
CREATE POLICY "Users can view public challenges" ON reading_challenges FOR SELECT USING (
  group_id IS NULL OR
  EXISTS (
    SELECT 1 FROM reading_groups 
    WHERE id = group_id AND 
    (is_public = true OR members @> '[{"id": "' || auth.uid() || '"}]')
  )
);
CREATE POLICY "Users can create challenges" ON reading_challenges FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Challenge creators can update challenges" ON reading_challenges FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Challenge creators can delete challenges" ON reading_challenges FOR DELETE USING (creator_id = auth.uid());

-- Create Indexes for Performance
CREATE INDEX idx_reading_groups_created_by ON reading_groups(created_by);
CREATE INDEX idx_reading_groups_is_public ON reading_groups(is_public);
CREATE INDEX idx_group_activities_group_id ON group_activities(group_id);
CREATE INDEX idx_group_activities_user_id ON group_activities(user_id);
CREATE INDEX idx_group_activities_timestamp ON group_activities(timestamp DESC);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX idx_shared_progress_user_id ON shared_progress(user_id);
CREATE INDEX idx_shared_progress_is_public ON shared_progress(is_public);
CREATE INDEX idx_shared_progress_created_at ON shared_progress(created_at DESC);
CREATE INDEX idx_reading_challenges_group_id ON reading_challenges(group_id);
CREATE INDEX idx_reading_challenges_creator_id ON reading_challenges(creator_id);
CREATE INDEX idx_reading_challenges_is_active ON reading_challenges(is_active);

-- Create Function to Update Updated At Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers for Updated At
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();