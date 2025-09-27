-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'student');
CREATE TYPE poll_status AS ENUM ('draft', 'active', 'closed');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    student_id TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls table
CREATE TABLE polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status poll_status NOT NULL DEFAULT 'draft',
    allow_multiple_votes BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll options table
CREATE TABLE poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, order_index)
);

-- Votes table
CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id, option_id)
);

-- Create indexes for better performance
CREATE INDEX idx_polls_creator_id ON polls(creator_id);
CREATE INDEX idx_polls_status ON polls(status);
CREATE INDEX idx_polls_start_time ON polls(start_time);
CREATE INDEX idx_polls_end_time ON polls(end_time);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_option_id ON votes(option_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at BEFORE UPDATE ON polls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();