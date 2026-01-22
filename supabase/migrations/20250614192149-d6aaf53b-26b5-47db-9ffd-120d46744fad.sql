
-- Adiciona a coluna de tags na tabela de tweets
ALTER TABLE public.tweets ADD COLUMN tags text[];

-- Cria a função para buscar os posts mais populares
CREATE OR REPLACE FUNCTION public.get_popular_posts()
RETURNS TABLE(
    id uuid,
    title text,
    tag text,
    popularity_score numeric
)
LANGUAGE sql
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
