
CREATE OR REPLACE FUNCTION public.get_top_users()
RETURNS TABLE(
    id uuid, 
    username text, 
    full_name text, 
    avatar_url text, 
    is_verified boolean, 
    total_score numeric
)
LANGUAGE sql
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
