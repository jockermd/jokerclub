
CREATE OR REPLACE FUNCTION public.get_global_recent_activities()
RETURNS TABLE(
    id uuid,
    activity_type text,
    created_at timestamptz,
    actor_id uuid,
    actor_username text,
    actor_full_name text,
    actor_avatar_url text,
    tweet_id uuid
)
LANGUAGE sql
STABLE
AS $$
    WITH activities AS (
        SELECT id, 'like' as activity_type, created_at, user_id as actor_id, tweet_id
        FROM public.likes
        UNION ALL
        SELECT id, 'retweet' as activity_type, created_at, user_id as actor_id, tweet_id
        FROM public.retweets
        UNION ALL
        SELECT id, 'reply' as activity_type, created_at, user_id as actor_id, tweet_id
        FROM public.replies
    )
    SELECT
        a.id,
        a.activity_type,
        a.created_at,
        a.actor_id,
        p.username as actor_username,
        p.full_name as actor_full_name,
        p.avatar_url as actor_avatar_url,
        a.tweet_id
    FROM activities a
    JOIN public.profiles p ON a.actor_id = p.id
    ORDER BY a.created_at DESC
    LIMIT 5;
$$;
