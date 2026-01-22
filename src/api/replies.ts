
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type ReplyWithAuthor = Tables<'replies'> & {
  profiles: Pick<Tables<'profiles'>, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified'> | null;
};

export const addReply = async ({ content, tweetId, userId }: { content: string; tweetId: string; userId: string }) => {
  const { data, error } = await supabase
    .from('replies')
    .insert([{ content, tweet_id: tweetId, user_id: userId }])
    .select(`
      *,
      profiles (id, username, full_name, avatar_url, is_verified)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ReplyWithAuthor;
};

export const getRepliesByTweetId = async (tweetId: string): Promise<ReplyWithAuthor[]> => {
  const { data, error } = await supabase
    .from('replies')
    .select(`
      *,
      profiles (id, username, full_name, avatar_url, is_verified)
    `)
    .eq('tweet_id', tweetId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching replies:', error);
    throw new Error(error.message);
  }

  return data as ReplyWithAuthor[];
};
