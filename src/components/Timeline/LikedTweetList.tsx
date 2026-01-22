
import React from 'react';
import Tweet from './Tweet';
import { useQuery } from '@tanstack/react-query';
import { getLikedTweetsByUserId, LikedTweet } from '@/api/tweets';
import { Skeleton } from '@/components/ui/skeleton';

interface LikedTweetListProps {
  userId: string;
}

const LikedTweetList: React.FC<LikedTweetListProps> = ({ userId }) => {
  const { data: likedTweets, isLoading, error } = useQuery({ 
    queryKey: ['likedTweets', userId], 
    queryFn: () => getLikedTweetsByUserId(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 glass-card p-4 rounded-xl">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-between mt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center glass-card p-4 rounded-xl">Error loading liked tweets: {error.message}</div>;
  }
  
  if (!likedTweets || likedTweets.length === 0) {
    return (
      <div className="h-48 glass-card rounded-xl flex items-center justify-center text-white/60">
        No liked tweets to show
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {likedTweets.map((tweet: LikedTweet) => (
        <Tweet key={`${tweet.id}-${tweet.liked_at}`} tweet={tweet} />
      ))}
    </div>
  );
};

export default LikedTweetList;
