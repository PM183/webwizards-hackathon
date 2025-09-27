-- Insert sample admin profile (you'll need to create this user in Supabase Auth first)
-- Replace 'admin-user-uuid' with actual UUID from Supabase Auth
INSERT INTO profiles (id, email, full_name, role, student_id) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'System Administrator', 'admin', 'ADM001');

-- Insert sample student profiles
INSERT INTO profiles (id, email, full_name, role, student_id) VALUES
    ('00000000-0000-0000-0000-000000000002', 'student1@example.com', 'John Doe', 'student', 'STU001'),
    ('00000000-0000-0000-0000-000000000003', 'student2@example.com', 'Jane Smith', 'student', 'STU002'),
    ('00000000-0000-0000-0000-000000000004', 'student3@example.com', 'Alice Johnson', 'student', 'STU003'),
    ('00000000-0000-0000-0000-000000000005', 'student4@example.com', 'Bob Wilson', 'student', 'STU004');

-- Insert sample polls
INSERT INTO polls (id, title, description, creator_id, status, start_time, end_time) VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Favorite Programming Language',
        'Which programming language do you prefer for web development?',
        '00000000-0000-0000-0000-000000000001',
        'active',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '7 days'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Best Time for Study Sessions',
        'What time of day do you find most productive for studying?',
        '00000000-0000-0000-0000-000000000001',
        'active',
        NOW() - INTERVAL '2 hours',
        NOW() + INTERVAL '3 days'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Campus Cafeteria Food Rating',
        'How would you rate the quality of food in the campus cafeteria?',
        '00000000-0000-0000-0000-000000000001',
        'draft',
        NULL,
        NULL
    );

-- Insert poll options for "Favorite Programming Language"
INSERT INTO poll_options (poll_id, text, order_index) VALUES
    ('10000000-0000-0000-0000-000000000001', 'JavaScript/TypeScript', 1),
    ('10000000-0000-0000-0000-000000000001', 'Python', 2),
    ('10000000-0000-0000-0000-000000000001', 'Java', 3),
    ('10000000-0000-0000-0000-000000000001', 'C#', 4),
    ('10000000-0000-0000-0000-000000000001', 'Go', 5),
    ('10000000-0000-0000-0000-000000000001', 'Rust', 6);

-- Insert poll options for "Best Time for Study Sessions"
INSERT INTO poll_options (poll_id, text, order_index) VALUES
    ('10000000-0000-0000-0000-000000000002', 'Early Morning (6-9 AM)', 1),
    ('10000000-0000-0000-0000-000000000002', 'Morning (9-12 PM)', 2),
    ('10000000-0000-0000-0000-000000000002', 'Afternoon (12-3 PM)', 3),
    ('10000000-0000-0000-0000-000000000002', 'Evening (3-6 PM)', 4),
    ('10000000-0000-0000-0000-000000000002', 'Night (6-9 PM)', 5),
    ('10000000-0000-0000-0000-000000000002', 'Late Night (9 PM+)', 6);

-- Insert poll options for "Campus Cafeteria Food Rating"
INSERT INTO poll_options (poll_id, text, order_index) VALUES
    ('10000000-0000-0000-0000-000000000003', 'Excellent', 1),
    ('10000000-0000-0000-0000-000000000003', 'Good', 2),
    ('10000000-0000-0000-0000-000000000003', 'Average', 3),
    ('10000000-0000-0000-0000-000000000003', 'Poor', 4),
    ('10000000-0000-0000-0000-000000000003', 'Terrible', 5);

-- Insert sample votes
INSERT INTO votes (poll_id, option_id, user_id) VALUES
    -- Votes for "Favorite Programming Language"
    ('10000000-0000-0000-0000-000000000001',
     (SELECT id FROM poll_options WHERE poll_id = '10000000-0000-0000-0000-000000000001' AND text = 'JavaScript/TypeScript'),
     '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000001',
     (SELECT id FROM poll_options WHERE poll_id = '10000000-0000-0000-0000-000000000001' AND text = 'Python'),
     '00000000-0000-0000-0000-000000000003'),
    ('10000000-0000-0000-0000-000000000001',
     (SELECT id FROM poll_options WHERE poll_id = '10000000-0000-0000-0000-000000000001' AND text = 'JavaScript/TypeScript'),
     '00000000-0000-0000-0000-000000000004'),
    ('10000000-0000-0000-0000-000000000001',
     (SELECT id FROM poll_options WHERE poll_id = '10000000-0000-0000-0000-000000000001' AND text = 'Rust'),
     '00000000-0000-0000-0000-000000000005'),

    -- Votes for "Best Time for Study Sessions"
    ('10000000-0000-0000-0000-000000000002',
     (SELECT id FROM poll_options WHERE poll_id = '10000000-0000-0000-0000-000000000002' AND text = 'Morning (9-12 PM)'),
     '00000000-0000-0000-0000-000000000002'),
    ('10000000-0000-0000-0000-000000000002',
     (SELECT id FROM poll_options WHERE poll_id = '10000000-0000-0000-0000-000000000002' AND text = 'Evening (3-6 PM)'),
     '00000000-0000-0000-0000-000000000003'),
    ('10000000-0000-0000-0000-000000000002',
     (SELECT id FROM poll_options WHERE poll_id = '10000000-0000-0000-0000-000000000002' AND text = 'Night (6-9 PM)'),
     '00000000-0000-0000-0000-000000000004');

-- Create a helpful view for poll results
CREATE VIEW poll_results_view AS
SELECT
    p.id as poll_id,
    p.title as poll_title,
    po.id as option_id,
    po.text as option_text,
    po.order_index,
    COUNT(v.id) as vote_count,
    ROUND(
        CASE
            WHEN (SELECT COUNT(*) FROM votes WHERE poll_id = p.id) > 0
            THEN (COUNT(v.id)::NUMERIC / (SELECT COUNT(*) FROM votes WHERE poll_id = p.id)::NUMERIC) * 100
            ELSE 0
        END, 2
    ) as percentage
FROM polls p
JOIN poll_options po ON p.id = po.poll_id
LEFT JOIN votes v ON po.id = v.option_id
GROUP BY p.id, p.title, po.id, po.text, po.order_index
ORDER BY p.id, po.order_index;