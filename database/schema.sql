-- QuranPulse Database Schema
-- Comprehensive database setup for all features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- USER MANAGEMENT TABLES
-- ===========================================

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    location VARCHAR(100),
    language_preference VARCHAR(10) DEFAULT 'en',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en',
    font_size INTEGER DEFAULT 16,
    show_transliteration BOOLEAN DEFAULT true,
    show_translation BOOLEAN DEFAULT true,
    audio_autoplay BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true,
    prayer_reminders BOOLEAN DEFAULT true,
    reading_reminders BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- QURAN & READING TABLES
-- ===========================================

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    verse_key VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, verse_key)
);

-- Reading progress table
CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    verse_key VARCHAR(20) NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading sessions table
CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'quran', 'hadith', 'iqra', 'mengaji'
    duration_minutes INTEGER DEFAULT 0,
    verses_read INTEGER DEFAULT 0,
    surahs_completed INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AUDIO & MEDIA TABLES
-- ===========================================

-- Audio tracks table
CREATE TABLE IF NOT EXISTS audio_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reciter_id VARCHAR(50) NOT NULL,
    surah_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    duration_seconds INTEGER,
    quality VARCHAR(20) DEFAULT 'high',
    is_downloaded BOOLEAN DEFAULT false,
    local_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloaded audio table
CREATE TABLE IF NOT EXISTS downloaded_audio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
    local_path TEXT NOT NULL,
    file_size BIGINT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- ===========================================
-- PRAYER & LOCATION TABLES
-- ===========================================

-- Prayer times table
CREATE TABLE IF NOT EXISTS prayer_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    location_name VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    fajr TIME NOT NULL,
    sunrise TIME NOT NULL,
    dhuhr TIME NOT NULL,
    asr TIME NOT NULL,
    maghrib TIME NOT NULL,
    isha TIME NOT NULL,
    hijri_date VARCHAR(50),
    hijri_month VARCHAR(50),
    hijri_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer settings table
CREATE TABLE IF NOT EXISTS prayer_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location_name VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    calculation_method VARCHAR(50) DEFAULT 'Kuala Lumpur',
    fajr_reminder BOOLEAN DEFAULT true,
    dhuhr_reminder BOOLEAN DEFAULT true,
    asr_reminder BOOLEAN DEFAULT true,
    maghrib_reminder BOOLEAN DEFAULT true,
    isha_reminder BOOLEAN DEFAULT true,
    reminder_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- SOCIAL FEATURES TABLES
-- ===========================================

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id),
    CHECK (from_user_id != to_user_id)
);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id),
    CHECK (user_id != blocked_user_id)
);

-- Social stats table
CREATE TABLE IF NOT EXISTS social_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_friends INTEGER DEFAULT 0,
    total_groups INTEGER DEFAULT 0,
    total_challenges INTEGER DEFAULT 0,
    shared_progress_count INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- READING GROUPS TABLES
-- ===========================================

-- Reading groups table
CREATE TABLE IF NOT EXISTS reading_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_open BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 50,
    member_count INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES reading_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'admin', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Group targets table
CREATE TABLE IF NOT EXISTS group_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES reading_groups(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'surahs', 'verses', 'days'
    target_value INTEGER NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group progress table
CREATE TABLE IF NOT EXISTS group_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES reading_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_id UUID REFERENCES group_targets(id) ON DELETE CASCADE,
    progress_value INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id, target_id)
);

-- Group schedules table
CREATE TABLE IF NOT EXISTS group_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES reading_groups(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern VARCHAR(20), -- 'daily', 'weekly', 'monthly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group activities table
CREATE TABLE IF NOT EXISTS group_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES reading_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'reading', 'discussion', 'achievement'
    title VARCHAR(100) NOT NULL,
    description TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- READING CHALLENGES TABLES
-- ===========================================

-- Reading challenges table
CREATE TABLE IF NOT EXISTS reading_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
    target_type VARCHAR(50) NOT NULL, -- 'surahs', 'verses', 'days', 'hours'
    target_value INTEGER NOT NULL,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_open BOOLEAN DEFAULT true,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    participant_count INTEGER DEFAULT 0,
    current_progress INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES reading_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'participant', -- 'admin', 'participant'
    progress INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- ===========================================
-- SOCIAL FEED TABLES
-- ===========================================

-- Social feed table
CREATE TABLE IF NOT EXISTS social_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'shared_progress', 'group_activity', 'challenge_update'
    data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared progress table
CREATE TABLE IF NOT EXISTS shared_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'surah_completed', 'juz_completed', 'prayer_streak', 'reading_streak', 'achievement'
    title VARCHAR(100) NOT NULL,
    description TEXT,
    value INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    progress_id UUID NOT NULL REFERENCES shared_progress(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(progress_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    progress_id UUID NOT NULL REFERENCES shared_progress(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AI & LEARNING TABLES
-- ===========================================

-- AI chat history table
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    message_type VARCHAR(20) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mengaji sessions table
CREATE TABLE IF NOT EXISTS mengaji_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    audio_file_url TEXT,
    transcription TEXT,
    analysis JSONB,
    score INTEGER,
    feedback TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Iqra progress table
CREATE TABLE IF NOT EXISTS iqra_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_number INTEGER NOT NULL,
    lesson_number INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    score INTEGER,
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_number, lesson_number)
);

-- ===========================================
-- NOTIFICATIONS TABLES
-- ===========================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'prayer', 'reading', 'social', 'challenge', 'group'
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- User tables indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Reading tables indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);

-- Audio tables indexes
CREATE INDEX IF NOT EXISTS idx_audio_tracks_reciter_surah ON audio_tracks(reciter_id, surah_number);
CREATE INDEX IF NOT EXISTS idx_downloaded_audio_user_id ON downloaded_audio(user_id);

-- Prayer tables indexes
CREATE INDEX IF NOT EXISTS idx_prayer_times_user_date ON prayer_times(user_id, date);
CREATE INDEX IF NOT EXISTS idx_prayer_settings_user_id ON prayer_settings(user_id);

-- Social tables indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to_user ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_social_stats_user_id ON social_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_social_feed_user_id ON social_feed(user_id);

-- Group tables indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_progress_group_id ON group_progress(group_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_group_id ON group_activities(group_id);

-- Challenge tables indexes
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);

-- Feed tables indexes
CREATE INDEX IF NOT EXISTS idx_shared_progress_user_id ON shared_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_progress_id ON likes(progress_id);
CREATE INDEX IF NOT EXISTS idx_comments_progress_id ON comments(progress_id);

-- AI tables indexes
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_mengaji_sessions_user_id ON mengaji_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_iqra_progress_user_id ON iqra_progress(user_id);

-- Notification tables indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloaded_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mengaji_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE iqra_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view public profiles" ON user_profiles
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Reading progress policies
CREATE POLICY "Users can manage own reading progress" ON reading_progress
    FOR ALL USING (auth.uid() = user_id);

-- Reading sessions policies
CREATE POLICY "Users can manage own reading sessions" ON reading_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Downloaded audio policies
CREATE POLICY "Users can manage own downloads" ON downloaded_audio
    FOR ALL USING (auth.uid() = user_id);

-- Prayer times policies
CREATE POLICY "Users can view public prayer times" ON prayer_times
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own prayer times" ON prayer_times
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Prayer settings policies
CREATE POLICY "Users can manage own prayer settings" ON prayer_settings
    FOR ALL USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view own friendships" ON friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can manage own friendships" ON friendships
    FOR ALL USING (auth.uid() = user_id);

-- Friend requests policies
CREATE POLICY "Users can view own friend requests" ON friend_requests
    FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can manage own friend requests" ON friend_requests
    FOR ALL USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Blocked users policies
CREATE POLICY "Users can manage own blocked users" ON blocked_users
    FOR ALL USING (auth.uid() = user_id);

-- Social stats policies
CREATE POLICY "Users can view own social stats" ON social_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own social stats" ON social_stats
    FOR ALL USING (auth.uid() = user_id);

-- Group members policies
CREATE POLICY "Group members can view group data" ON group_members
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM group_members gm 
            WHERE gm.group_id = group_members.group_id 
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own group memberships" ON group_members
    FOR ALL USING (auth.uid() = user_id);

-- Group progress policies
CREATE POLICY "Group members can view group progress" ON group_progress
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM group_members gm 
            WHERE gm.group_id = group_progress.group_id 
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own group progress" ON group_progress
    FOR ALL USING (auth.uid() = user_id);

-- Group activities policies
CREATE POLICY "Group members can view group activities" ON group_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_members gm 
            WHERE gm.group_id = group_activities.group_id 
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create activities" ON group_activities
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM group_members gm 
            WHERE gm.group_id = group_activities.group_id 
            AND gm.user_id = auth.uid()
        )
    );

-- Challenge participants policies
CREATE POLICY "Challenge participants can view challenge data" ON challenge_participants
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM challenge_participants cp 
            WHERE cp.challenge_id = challenge_participants.challenge_id 
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own challenge participation" ON challenge_participants
    FOR ALL USING (auth.uid() = user_id);

-- Social feed policies
CREATE POLICY "Users can view own feed" ON social_feed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own feed" ON social_feed
    FOR ALL USING (auth.uid() = user_id);

-- Shared progress policies
CREATE POLICY "Users can view public shared progress" ON shared_progress
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own shared progress" ON shared_progress
    FOR ALL USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view all likes" ON likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON likes
    FOR ALL USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view all comments" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own comments" ON comments
    FOR ALL USING (auth.uid() = user_id);

-- AI chat history policies
CREATE POLICY "Users can manage own chat history" ON ai_chat_history
    FOR ALL USING (auth.uid() = user_id);

-- Mengaji sessions policies
CREATE POLICY "Users can manage own mengaji sessions" ON mengaji_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Iqra progress policies
CREATE POLICY "Users can manage own iqra progress" ON iqra_progress
    FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_settings_updated_at BEFORE UPDATE ON prayer_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON friend_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_stats_updated_at BEFORE UPDATE ON social_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_groups_updated_at BEFORE UPDATE ON reading_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_targets_updated_at BEFORE UPDATE ON group_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_progress_updated_at BEFORE UPDATE ON group_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_schedules_updated_at BEFORE UPDATE ON group_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_challenges_updated_at BEFORE UPDATE ON reading_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_participants_updated_at BEFORE UPDATE ON challenge_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_progress_updated_at BEFORE UPDATE ON shared_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iqra_progress_updated_at BEFORE UPDATE ON iqra_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get friend suggestions
CREATE OR REPLACE FUNCTION get_friend_suggestions(user_id UUID, limit_count INTEGER)
RETURNS TABLE (
    id UUID,
    user_metadata JSONB,
    username VARCHAR(50),
    full_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.user_metadata,
        up.username,
        up.full_name
    FROM user_profiles up
    WHERE up.id != user_id
    AND up.is_public = true
    AND up.id NOT IN (
        SELECT f.friend_id FROM friendships f WHERE f.user_id = user_id
        UNION
        SELECT f.user_id FROM friendships f WHERE f.friend_id = user_id
        UNION
        SELECT fr.to_user_id FROM friend_requests fr WHERE fr.from_user_id = user_id
        UNION
        SELECT fr.from_user_id FROM friend_requests fr WHERE fr.to_user_id = user_id
        UNION
        SELECT bu.blocked_user_id FROM blocked_users bu WHERE bu.user_id = user_id
    )
    ORDER BY RANDOM()
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get mutual friends
CREATE OR REPLACE FUNCTION get_mutual_friends(user1_id UUID, user2_id UUID)
RETURNS TABLE (
    id UUID,
    user_metadata JSONB,
    username VARCHAR(50),
    full_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.user_metadata,
        up.username,
        up.full_name
    FROM user_profiles up
    WHERE up.id IN (
        SELECT f1.friend_id 
        FROM friendships f1 
        WHERE f1.user_id = user1_id
        INTERSECT
        SELECT f2.friend_id 
        FROM friendships f2 
        WHERE f2.user_id = user2_id
    );
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- SEED DATA
-- ===========================================

-- Insert default reciters (if needed)
-- This would typically be done through the app, but we can add some defaults

-- Insert default prayer calculation methods
-- This would typically be done through the app

-- ===========================================
-- COMMENTS
-- ===========================================

COMMENT ON DATABASE postgres IS 'QuranPulse - Comprehensive Islamic mobile app database';
COMMENT ON TABLE user_profiles IS 'User profile information and public data';
COMMENT ON TABLE bookmarks IS 'User bookmarks for Quran verses';
COMMENT ON TABLE reading_progress IS 'User reading progress tracking';
COMMENT ON TABLE friendships IS 'User friendship relationships';
COMMENT ON TABLE reading_groups IS 'Reading groups for collaborative learning';
COMMENT ON TABLE reading_challenges IS 'Reading challenges and competitions';
COMMENT ON TABLE social_feed IS 'Social activity feed';
COMMENT ON TABLE shared_progress IS 'Shared reading progress posts';
COMMENT ON TABLE ai_chat_history IS 'AI chat conversation history';
COMMENT ON TABLE mengaji_sessions IS 'AI-powered recitation analysis sessions';
COMMENT ON TABLE iqra_progress IS 'Iqra learning module progress';
COMMENT ON TABLE notifications IS 'User notifications and reminders';