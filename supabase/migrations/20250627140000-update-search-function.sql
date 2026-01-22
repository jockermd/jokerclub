
-- Update the search_all function to include codeblocks with proper RLS
CREATE OR REPLACE FUNCTION public.search_all(p_search_term text)
RETURNS TABLE(
    result_id uuid,
    result_type text,
    result_content text,
    result_created_at timestamp with time zone,
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
    codeblock_tags text[],
    codeblock_is_public boolean,
    codeblock_links text[]
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH search_results AS (
        -- Search tweets
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
            NULL::text as profile_bio,
            NULL::text as codeblock_title,
            NULL::text as codeblock_description,
            NULL::text as codeblock_content,
            NULL::text as codeblock_language,
            NULL::text as codeblock_category,
            NULL::text[] as codeblock_tags,
            NULL::boolean as codeblock_is_public,
            NULL::text[] as codeblock_links
        FROM public.tweets t
        JOIN public.profiles p ON t.user_id = p.id
        WHERE t.content ILIKE '%' || p_search_term || '%'
              OR EXISTS (SELECT 1 FROM unnest(t.tags) tag WHERE tag ILIKE '%' || p_search_term || '%')

        UNION ALL

        -- Search profiles
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
            NULL::uuid as tweet_id,
            NULL::text[] as tweet_images,
            p.bio as profile_bio,
            NULL::text as codeblock_title,
            NULL::text as codeblock_description,
            NULL::text as codeblock_content,
            NULL::text as codeblock_language,
            NULL::text as codeblock_category,
            NULL::text[] as codeblock_tags,
            NULL::boolean as codeblock_is_public,
            NULL::text[] as codeblock_links
        FROM public.profiles p
        WHERE p.username ILIKE '%' || p_search_term || '%'
              OR p.full_name ILIKE '%' || p_search_term || '%'
              OR p.bio ILIKE '%' || p_search_term || '%'

        UNION ALL

        -- Search codeblocks (RLS will automatically filter based on policies)
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
            NULL::uuid as tweet_id,
            NULL::text[] as tweet_images,
            NULL::text as profile_bio,
            c.title as codeblock_title,
            c.description as codeblock_description,
            c.content as codeblock_content,
            c.language as codeblock_language,
            c.category as codeblock_category,
            c.tags as codeblock_tags,
            c.is_public as codeblock_is_public,
            c.links as codeblock_links
        FROM public.codeblocks c
        LEFT JOIN public.profiles p ON c.created_by = p.id
        WHERE c.title ILIKE '%' || p_search_term || '%'
              OR c.description ILIKE '%' || p_search_term || '%'
              OR c.content ILIKE '%' || p_search_term || '%'
              OR c.language ILIKE '%' || p_search_term || '%'
              OR c.category ILIKE '%' || p_search_term || '%'
              OR EXISTS (SELECT 1 FROM unnest(c.tags) tag WHERE tag ILIKE '%' || p_search_term || '%')
    )
    SELECT *
    FROM search_results
    ORDER BY result_created_at DESC;
END;
$$;
