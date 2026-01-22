
CREATE OR REPLACE FUNCTION public.search_all(p_search_term text)
RETURNS TABLE(
    result_id uuid,
    result_type text,
    result_content text,
    result_created_at timestamptz,
    author_id uuid,
    author_username text,
    author_full_name text,
    author_avatar_url text,
    author_is_verified boolean,
    tweet_id uuid,
    tweet_images text[],
    profile_bio text,
    codeblock_title text,
    codeblock_description text,
    codeblock_content text,
    codeblock_language text,
    codeblock_category text,
    codeblock_tags text[]
)
AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        SELECT
            t.id as result_id,
            'tweet' as result_type,
            t.content as result_content,
            t.created_at as result_created_at,
            p.id as author_id,
            p.username as author_username,
            p.full_name as author_full_name,
            p.avatar_url as author_avatar_url,
            p.is_verified as author_is_verified,
            t.id as tweet_id,
            t.images as tweet_images,
            NULL as profile_bio,
            NULL as codeblock_title,
            NULL as codeblock_description,
            NULL as codeblock_content,
            NULL as codeblock_language,
            NULL as codeblock_category,
            NULL as codeblock_tags
        FROM public.tweets t
        JOIN public.profiles p ON t.user_id = p.id
        WHERE t.content ILIKE '%' || p_search_term || '%'
              OR EXISTS (SELECT 1 FROM unnest(t.tags) tag WHERE tag ILIKE '%' || p_search_term || '%')

        UNION ALL

        SELECT
            p.id as result_id,
            'profile' as result_type,
            p.bio as result_content,
            p.created_at as result_created_at,
            p.id as author_id,
            p.username as author_username,
            p.full_name as author_full_name,
            p.avatar_url as author_avatar_url,
            p.is_verified as author_is_verified,
            NULL as tweet_id,
            NULL as tweet_images,
            p.bio as profile_bio,
            NULL as codeblock_title,
            NULL as codeblock_description,
            NULL as codeblock_content,
            NULL as codeblock_language,
            NULL as codeblock_category,
            NULL as codeblock_tags
        FROM public.profiles p
        WHERE p.username ILIKE '%' || p_search_term || '%'
              OR p.full_name ILIKE '%' || p_search_term || '%'
              OR p.bio ILIKE '%' || p_search_term || '%'
        
        UNION ALL

        SELECT
            c.id as result_id,
            'codeblock' as result_type,
            c.description as result_content,
            c.created_at as result_created_at,
            p.id as author_id,
            p.username as author_username,
            p.full_name as author_full_name,
            p.avatar_url as author_avatar_url,
            p.is_verified as author_is_verified,
            NULL as tweet_id,
            NULL as tweet_images,
            NULL as profile_bio,
            c.title as codeblock_title,
            c.description as codeblock_description,
            c.content as codeblock_content,
            c.language as codeblock_language,
            c.category as codeblock_category,
            c.tags as codeblock_tags
        FROM public.codeblocks c
        LEFT JOIN public.profiles p ON c.created_by = p.id
        WHERE c.is_public = true AND (
               c.title ILIKE '%' || p_search_term || '%'
            OR c.description ILIKE '%' || p_search_term || '%'
            OR c.content ILIKE '%' || p_search_term || '%'
            OR c.language ILIKE '%' || p_search_term || '%'
            OR c.category ILIKE '%' || p_search_term || '%'
            OR EXISTS (SELECT 1 FROM unnest(c.tags) tag WHERE tag ILIKE '%' || p_search_term || '%')
        )
    )
    SELECT *
    FROM search_results
    ORDER BY result_created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
