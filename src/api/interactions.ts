
import { supabase } from '@/integrations/supabase/client';

export const getTweetInteractions = async (tweetId: string, userId?: string) => {
  const { count: likesCount, error: likesCountError } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('tweet_id', tweetId);

  if (likesCountError) throw likesCountError;

  const { count: retweetsCount, error: retweetsCountError } = await supabase
    .from('retweets')
    .select('*', { count: 'exact', head: true })
    .eq('tweet_id', tweetId);
  
  if (retweetsCountError) throw retweetsCountError;

  const { count: repliesCount, error: repliesCountError } = await supabase
    .from('replies')
    .select('*', { count: 'exact', head: true })
    .eq('tweet_id', tweetId);

  if (repliesCountError) throw repliesCountError;

  let hasLiked = false;
  if (userId) {
    const { data: likeData, error: likeError } = await supabase
      .from('likes')
      .select('id')
      .eq('tweet_id', tweetId)
      .eq('user_id', userId)
      .maybeSingle();
    if (likeError) throw likeError;
    hasLiked = !!likeData;
  }

  let hasRetweeted = false;
  if (userId) {
    const { data: retweetData, error: retweetError } = await supabase
      .from('retweets')
      .select('id')
      .eq('tweet_id', tweetId)
      .eq('user_id', userId)
      .maybeSingle();
    if (retweetError) throw retweetError;
    hasRetweeted = !!retweetData;
  }
  
  return {
    likes: likesCount ?? 0,
    retweets: retweetsCount ?? 0,
    replies: repliesCount ?? 0,
    hasLiked,
    hasRetweeted
  };
};

export const toggleLike = async ({ tweetId, userId }: { tweetId: string, userId: string }) => {
  const { data: existingLike, error: selectError } = await supabase
    .from('likes')
    .select('id')
    .eq('tweet_id', tweetId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (selectError) throw selectError;

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);
    if (error) throw error;
    return 'unliked';
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert({ tweet_id: tweetId, user_id: userId });
    if (error) throw error;
    return 'liked';
  }
};

export const toggleRetweet = async ({ tweetId, userId }: { tweetId: string, userId: string }) => {
  const { data: existingRetweet, error: selectError } = await supabase
    .from('retweets')
    .select('id')
    .eq('tweet_id', tweetId)
    .eq('user_id', userId)
    .maybeSingle();
    
  if (selectError) throw selectError;

  if (existingRetweet) {
    // Unretweet
    const { error } = await supabase
      .from('retweets')
      .delete()
      .eq('id', existingRetweet.id);
    if (error) throw error;
    return 'unretweeted';
  } else {
    // Retweet
    const { error } = await supabase
      .from('retweets')
      .insert({ tweet_id: tweetId, user_id: userId });
    if (error) throw error;
    return 'retweeted';
  }
};
