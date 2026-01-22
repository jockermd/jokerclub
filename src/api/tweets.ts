
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type TweetWithAuthor = Tables<'tweets'> & {
  profiles: Pick<Tables<'profiles'>, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified'> | null;
};

const handleAuthError = async (error: any, retryCallback?: () => Promise<any>) => {
  if (error?.message?.includes('JWT expired') || error?.code === 'PGRST301') {
    console.log('JWT expired, attempting to refresh token...');
    
    try {
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !session) {
        console.error('Failed to refresh token:', refreshError);
        toast.error('Sessão expirada. Faça login novamente.');
        await supabase.auth.signOut();
        throw new Error('Authentication failed');
      }
      
      console.log('Token refreshed successfully');
      
      // Retry the original request if callback provided
      if (retryCallback) {
        return await retryCallback();
      }
      
      return session;
    } catch (refreshError) {
      console.error('Error during token refresh:', refreshError);
      toast.error('Erro ao renovar sessão. Faça login novamente.');
      await supabase.auth.signOut();
      throw new Error('Authentication failed');
    }
  }
  
  throw error;
};

export const addTweet = async ({ content, userId, images }: { content: string; userId: string; images?: string[] }) => {
  const executeTweet = async () => {
    const { data, error } = await supabase
      .from('tweets')
      .insert([{ content: content, user_id: userId, images: images && images.length > 0 ? images : null }])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  try {
    return await executeTweet();
  } catch (error) {
    return await handleAuthError(error, executeTweet);
  }
};

export const getTweets = async ({ page, limit }: { page?: number; limit?: number }): Promise<{ tweets: TweetWithAuthor[], count: number | null }> => {
  const executeFetch = async () => {
    let query = supabase
      .from('tweets')
      .select(`
        *,
        profiles (id, username, full_name, avatar_url, is_verified)
      `, { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (page && limit) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }
    
    return { tweets: data as TweetWithAuthor[], count };
  };

  try {
    return await executeFetch();
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return await handleAuthError(error, executeFetch);
  }
};

export type RetweetedTweet = TweetWithAuthor & { retweeted_at: string };

export type LikedTweet = TweetWithAuthor & { liked_at: string };

export const getLikedTweetsByUserId = async (userId: string): Promise<LikedTweet[]> => {
  const executeFetch = async () => {
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('tweet_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (likesError) {
      throw likesError;
    }

    if (!likes || likes.length === 0) {
      return [];
    }

    const tweetIds = likes.map(l => l.tweet_id);

    const { data: tweets, error: tweetsError } = await supabase
      .from('tweets')
      .select(`
        *,
        profiles (id, username, full_name, avatar_url, is_verified)
      `)
      .in('id', tweetIds);

    if (tweetsError) {
      throw tweetsError;
    }

    if (!tweets) {
      return [];
    }
    
    const tweetsById = new Map((tweets as TweetWithAuthor[]).map(t => [t.id, t]));

    const result: LikedTweet[] = likes
      .map(like => {
        const tweetData = tweetsById.get(like.tweet_id);
        if (!tweetData) return null;
        return {
          ...tweetData,
          liked_at: like.created_at,
        };
      })
      .filter((t): t is LikedTweet => t !== null);
      
    return result;
  };

  try {
    return await executeFetch();
  } catch (error) {
    console.error('Error fetching liked tweets:', error);
    return await handleAuthError(error, executeFetch);
  }
};

export const getRetweetedTweetsByUserId = async (userId: string): Promise<RetweetedTweet[]> => {
  const executeFetch = async () => {
    const { data: retweets, error: retweetsError } = await supabase
      .from('retweets')
      .select('tweet_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (retweetsError) {
      throw retweetsError;
    }

    if (!retweets || retweets.length === 0) {
      return [];
    }

    const tweetIds = retweets.map(r => r.tweet_id);

    const { data: tweets, error: tweetsError } = await supabase
      .from('tweets')
      .select(`
        *,
        profiles (id, username, full_name, avatar_url, is_verified)
      `)
      .in('id', tweetIds);

    if (tweetsError) {
      throw tweetsError;
    }

    if (!tweets) {
      return [];
    }
    
    const tweetsById = new Map((tweets as TweetWithAuthor[]).map(t => [t.id, t]));

    const result: RetweetedTweet[] = retweets
      .map(retweet => {
        const tweetData = tweetsById.get(retweet.tweet_id);
        if (!tweetData) return null;
        return {
          ...tweetData,
          retweeted_at: retweet.created_at,
        };
      })
      .filter((t): t is RetweetedTweet => t !== null);

    return result;
  };

  try {
    return await executeFetch();
  } catch (error) {
    console.error('Error fetching retweeted tweets:', error);
    return await handleAuthError(error, executeFetch);
  }
};

export const getTweetsByUserId = async (userId: string): Promise<TweetWithAuthor[]> => {
  const executeFetch = async () => {
    const { data, error } = await supabase
      .from('tweets')
      .select(`
        *,
        profiles (id, username, full_name, avatar_url, is_verified)
      `)
      .eq('user_id', userId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    
    return data as TweetWithAuthor[];
  };

  try {
    return await executeFetch();
  } catch (error) {
    console.error('Error fetching tweets by user:', error);
    return await handleAuthError(error, executeFetch);
  }
};

export const updateTweet = async (tweetId: string, updates: { is_pinned?: boolean; content?: string }) => {
  const executeUpdate = async () => {
    const { data, error } = await supabase
      .from('tweets')
      .update(updates)
      .eq('id', tweetId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  };

  try {
    return await executeUpdate();
  } catch (error) {
    console.error('Error updating tweet:', error);
    return await handleAuthError(error, executeUpdate);
  }
};

export const deleteTweet = async (tweetId: string) => {
  const executeDelete = async () => {
    const { error } = await supabase
      .from('tweets')
      .delete()
      .eq('id', tweetId);
    
    if (error) {
      throw error;
    }
    
    return true;
  };

  try {
    return await executeDelete();
  } catch (error) {
    console.error('Error deleting tweet:', error);
    return await handleAuthError(error, executeDelete);
  }
};
