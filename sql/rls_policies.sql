-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Polls policies
CREATE POLICY "Users can view polls based on role" ON polls
    FOR SELECT USING (
        status = 'active' OR
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can create polls" ON polls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Poll creators can update their polls" ON polls
    FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Poll creators and admins can delete polls" ON polls
    FOR DELETE USING (
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Poll options policies
CREATE POLICY "Anyone can view poll options for active polls" ON poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM polls
            WHERE polls.id = poll_options.poll_id
            AND (polls.status = 'active' OR polls.creator_id = auth.uid())
        )
    );

CREATE POLICY "Poll creators can manage poll options" ON poll_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM polls
            WHERE polls.id = poll_options.poll_id
            AND polls.creator_id = auth.uid()
        )
    );

-- Votes policies
CREATE POLICY "Users can view all votes for polls" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM polls
            WHERE polls.id = votes.poll_id
            AND polls.status IN ('active', 'closed')
        )
    );

CREATE POLICY "Users can insert their own votes" ON votes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM polls
            WHERE polls.id = votes.poll_id
            AND polls.status = 'active'
            AND (polls.end_time IS NULL OR polls.end_time > NOW())
        )
    );

CREATE POLICY "Users cannot update votes" ON votes
    FOR UPDATE USING (false);

CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM polls
            WHERE polls.id = votes.poll_id
            AND polls.status = 'active'
            AND (polls.end_time IS NULL OR polls.end_time > NOW())
        )
    );

-- Additional security functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can vote on poll
CREATE OR REPLACE FUNCTION can_vote_on_poll(poll_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM polls
        WHERE id = poll_uuid
        AND status = 'active'
        AND (end_time IS NULL OR end_time > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;