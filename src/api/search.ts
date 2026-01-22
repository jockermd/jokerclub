
import { supabase } from '@/integrations/supabase/client';

// Updated SearchResult type to include codeblock fields
export type SearchResult = {
    result_id: string;
    result_type: string;
    result_content: string | null;
    result_created_at: string;
    author_id: string | null;
    author_username: string | null;
    author_full_name: string | null;
    author_avatar_url: string | null;
    author_is_verified: boolean | null;
    tweet_id: string | null;
    tweet_images: string[] | null;
    profile_bio: string | null;
    codeblock_title: string | null;
    codeblock_description: string | null;
    codeblock_content: string | null;
    codeblock_language: string | null;
    codeblock_category: string | null;
    codeblock_tags: string[] | null;
    codeblock_is_public: boolean | null;
    codeblock_is_blurred: boolean | null;
    codeblock_links: string[] | null;
};

export const searchAll = async (searchTerm: string): Promise<SearchResult[]> => {
  if (!searchTerm.trim()) {
    return [];
  }

  // Buscar usando a função RPC existente
  const { data: rpcData, error: rpcError } = await supabase.rpc('search_all', {
    p_search_term: searchTerm,
  });

  let results: SearchResult[] = [];

  if (!rpcError && rpcData) {
    results = rpcData as SearchResult[];
  }

  // Buscar codeblocks adicionalmente
  const { data: codeblocks, error: codeblockError } = await supabase
    .from('codeblocks')
    .select(`
      id,
      title,
      description,
      content,
      language,
      category,
      tags,
      is_public,
      is_blurred,
      links,
      created_at,
      created_by,
      profiles (
        username,
        full_name,
        avatar_url,
        is_verified
      )
    `)
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (!codeblockError && codeblocks) {
    const codeblockResults: SearchResult[] = codeblocks.map(codeblock => ({
      result_id: codeblock.id,
      result_type: 'codeblock',
      result_content: codeblock.content,
      result_created_at: codeblock.created_at,
      author_id: codeblock.created_by,
      author_username: codeblock.profiles?.username || null,
      author_full_name: codeblock.profiles?.full_name || null,
      author_avatar_url: codeblock.profiles?.avatar_url || null,
      author_is_verified: codeblock.profiles?.is_verified || null,
      tweet_id: null,
      tweet_images: null,
      profile_bio: null,
      codeblock_title: codeblock.title,
      codeblock_description: codeblock.description,
      codeblock_content: codeblock.content,
      codeblock_language: codeblock.language,
      codeblock_category: codeblock.category,
      codeblock_tags: codeblock.tags,
      codeblock_is_public: codeblock.is_public,
      codeblock_is_blurred: codeblock.is_blurred,
      codeblock_links: codeblock.links,
    }));

    // Filtrar duplicatas baseado no result_id
    const existingIds = new Set(results.map(r => r.result_id));
    const uniqueCodeblocks = codeblockResults.filter(cb => !existingIds.has(cb.result_id));
    
    results = [...results, ...uniqueCodeblocks];
  }

  return results;
};
