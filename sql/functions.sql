-- Function to get poll results with vote counts
CREATE OR REPLACE FUNCTION get_poll_results(poll_uuid UUID)
RETURNS TABLE (
    option_id UUID,
    option_text TEXT,
    vote_count BIGINT,
    percentage NUMERIC
) AS $$
DECLARE
    total_votes BIGINT;
BEGIN
    -- Get total votes for the poll
    SELECT COUNT(*) INTO total_votes
    FROM votes
    WHERE poll_id = poll_uuid;

    -- Return results with vote counts and percentages
    RETURN QUERY
    SELECT
        po.id as option_id,
        po.text as option_text,
        COALESCE(v.vote_count, 0) as vote_count,
        CASE
            WHEN total_votes > 0 THEN
                ROUND((COALESCE(v.vote_count, 0)::NUMERIC / total_votes::NUMERIC) * 100, 2)
            ELSE 0
        END as percentage
    FROM poll_options po
    LEFT JOIN (
        SELECT
            option_id,
            COUNT(*) as vote_count
        FROM votes
        WHERE poll_id = poll_uuid
        GROUP BY option_id
    ) v ON po.id = v.option_id
    WHERE po.poll_id = poll_uuid
    ORDER BY po.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has already voted on a poll
CREATE OR REPLACE FUNCTION has_user_voted(poll_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM votes
        WHERE poll_id = poll_uuid AND user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's vote on a poll
CREATE OR REPLACE FUNCTION get_user_vote(poll_uuid UUID, user_uuid UUID)
RETURNS TABLE (
    option_id UUID,
    option_text TEXT,
    voted_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        po.id as option_id,
        po.text as option_text,
        v.created_at as voted_at
    FROM votes v
    JOIN poll_options po ON v.option_id = po.id
    WHERE v.poll_id = poll_uuid AND v.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cast a vote (with validation)
CREATE OR REPLACE FUNCTION cast_vote(poll_uuid UUID, option_uuid UUID, user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    poll_record polls%ROWTYPE;
    existing_vote_count INTEGER;
    result JSON;
BEGIN
    -- Get poll information
    SELECT * INTO poll_record FROM polls WHERE id = poll_uuid;

    -- Check if poll exists and is active
    IF poll_record.id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Poll not found');
    END IF;

    IF poll_record.status != 'active' THEN
        RETURN json_build_object('success', false, 'error', 'Poll is not active');
    END IF;

    -- Check if poll has ended
    IF poll_record.end_time IS NOT NULL AND poll_record.end_time < NOW() THEN
        RETURN json_build_object('success', false, 'error', 'Poll has ended');
    END IF;

    -- Check if user has already voted (if multiple votes not allowed)
    SELECT COUNT(*) INTO existing_vote_count
    FROM votes
    WHERE poll_id = poll_uuid AND user_id = user_uuid;

    IF NOT poll_record.allow_multiple_votes AND existing_vote_count > 0 THEN
        RETURN json_build_object('success', false, 'error', 'You have already voted on this poll');
    END IF;

    -- Check if option belongs to this poll
    IF NOT EXISTS (SELECT 1 FROM poll_options WHERE id = option_uuid AND poll_id = poll_uuid) THEN
        RETURN json_build_object('success', false, 'error', 'Invalid poll option');
    END IF;

    -- Cast the vote
    INSERT INTO votes (poll_id, option_id, user_id)
    VALUES (poll_uuid, option_uuid, user_uuid);

    RETURN json_build_object('success', true, 'message', 'Vote cast successfully');

EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'error', 'You have already voted for this option');
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', 'An error occurred while casting your vote');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get poll statistics for admin
CREATE OR REPLACE FUNCTION get_poll_statistics(poll_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_votes INTEGER;
    unique_voters INTEGER;
    poll_record polls%ROWTYPE;
BEGIN
    SELECT * INTO poll_record FROM polls WHERE id = poll_uuid;

    IF poll_record.id IS NULL THEN
        RETURN json_build_object('error', 'Poll not found');
    END IF;

    -- Get vote statistics
    SELECT COUNT(*) INTO total_votes FROM votes WHERE poll_id = poll_uuid;
    SELECT COUNT(DISTINCT user_id) INTO unique_voters FROM votes WHERE poll_id = poll_uuid;

    result := json_build_object(
        'poll_id', poll_record.id,
        'title', poll_record.title,
        'status', poll_record.status,
        'total_votes', total_votes,
        'unique_voters', unique_voters,
        'created_at', poll_record.created_at,
        'start_time', poll_record.start_time,
        'end_time', poll_record.end_time
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all polls with vote counts (for admin dashboard)
CREATE OR REPLACE FUNCTION get_all_polls_with_stats()
RETURNS TABLE (
    poll_id UUID,
    title TEXT,
    description TEXT,
    status poll_status,
    creator_name TEXT,
    total_votes BIGINT,
    unique_voters BIGINT,
    created_at TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as poll_id,
        p.title,
        p.description,
        p.status,
        pr.full_name as creator_name,
        COALESCE(vote_stats.total_votes, 0) as total_votes,
        COALESCE(vote_stats.unique_voters, 0) as unique_voters,
        p.created_at,
        p.start_time,
        p.end_time
    FROM polls p
    JOIN profiles pr ON p.creator_id = pr.id
    LEFT JOIN (
        SELECT
            poll_id,
            COUNT(*) as total_votes,
            COUNT(DISTINCT user_id) as unique_voters
        FROM votes
        GROUP BY poll_id
    ) vote_stats ON p.id = vote_stats.poll_id
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;