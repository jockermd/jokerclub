
-- Remove as funções antigas para permitir a recriação com novos tipos de retorno
DROP FUNCTION IF EXISTS public.get_top_users();
DROP FUNCTION IF EXISTS public.get_popular_posts();
DROP FUNCTION IF EXISTS public.get_global_recent_activities();

-- Recria a função para buscar os usuários com maior pontuação (Top Jokers)
CREATE FUNCTION public.get_top_users()
RETURNS TABLE(
    id uuid,
    username text,
    full_name text,
    avatar_url text,
    is_verified boolean,
    total_score numeric
)
LANGUAGE sql
STABLE
AS $$
WITH user_scores AS (
    SELECT
        p.id,
        (COALESCE(tweet_counts.count, 0) * 1.0) +
        (COALESCE(like_counts.count, 0) * 0.5) +
        (COALESCE(retweet_counts.count, 0) * 0.7) +
        (COALESCE(reply_counts.count, 0) * 0.8) AS score
    FROM
        public.profiles p
    LEFT JOIN (
        SELECT user_id, COUNT(*) AS count FROM public.tweets GROUP BY user_id
    ) AS tweet_counts ON p.id = tweet_counts.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) AS count FROM public.likes GROUP BY user_id
    ) AS like_counts ON p.id = like_counts.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) AS count FROM public.retweets GROUP BY user_id
    ) AS retweet_counts ON p.id = retweet_counts.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) AS count FROM public.replies GROUP BY user_id
    ) AS reply_counts ON p.id = reply_counts.user_id
)
SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.is_verified,
    us.score AS total_score
FROM
    public.profiles p
JOIN
    user_scores us ON p.id = us.id
ORDER BY
    total_score DESC
LIMIT 3;
$$;

-- Recria a função para buscar os posts mais populares
CREATE FUNCTION public.get_popular_posts()
RETURNS TABLE(
    id uuid,
    title text,
    tag text,
    popularity_score numeric
)
LANGUAGE sql
STABLE
AS $$
WITH post_scores AS (
    SELECT
        t.id,
        (COALESCE(like_counts.count, 0) * 1.0) +
        (COALESCE(retweet_counts.count, 0) * 1.5) +
        (COALESCE(reply_counts.count, 0) * 2.0) AS score
    FROM
        public.tweets t
    LEFT JOIN (
        SELECT tweet_id, COUNT(*) AS count FROM public.likes GROUP BY tweet_id
    ) AS like_counts ON t.id = like_counts.tweet_id
    LEFT JOIN (
        SELECT tweet_id, COUNT(*) AS count FROM public.retweets GROUP BY tweet_id
    ) AS retweet_counts ON t.id = retweet_counts.tweet_id
    LEFT JOIN (
        SELECT tweet_id, COUNT(*) AS count FROM public.replies GROUP BY tweet_id
    ) AS reply_counts ON t.id = reply_counts.tweet_id
)
SELECT
    t.id,
    t.content as title,
    (CASE WHEN t.tags IS NOT NULL AND array_length(t.tags, 1) > 0 THEN t.tags[1] ELSE 'Geral' END) as tag,
    ps.score AS popularity_score
FROM
    public.tweets t
JOIN
    post_scores ps ON t.id = ps.id
WHERE ps.score > 0
ORDER BY
    popularity_score DESC
LIMIT 3;
$$;

-- Recria a função para buscar as atividades globais recentes
CREATE FUNCTION public.get_global_recent_activities()
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
        UNION ALL
        SELECT id, 'follow' as activity_type, created_at, follower_id as actor_id, NULL::uuid as tweet_id
        FROM public.followers
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
