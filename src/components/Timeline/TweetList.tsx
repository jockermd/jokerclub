
import React, { useState, useRef, useEffect } from 'react';
import Tweet from './Tweet';
import { useQueries, useQuery, keepPreviousData } from '@tanstack/react-query';
import { getTweets, getTweetsByUserId, getRetweetedTweetsByUserId, TweetWithAuthor, RetweetedTweet } from '@/api/tweets';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface TweetListProps {
  userId?: string;
  highlightTweetId?: string | null;
}

const TweetList: React.FC<TweetListProps> = ({ userId, highlightTweetId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const tweetRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: tweetsData, isLoading, error, isFetching } = useQuery({ 
    queryKey: ['tweets', currentPage], 
    queryFn: () => getTweets({ page: currentPage, limit: postsPerPage }),
    enabled: !userId,
    placeholderData: keepPreviousData,
  });
  
  const tweets = tweetsData?.tweets;
  const totalTweets = tweetsData?.count ?? 0;
  const totalPages = Math.ceil(totalTweets / postsPerPage);

  const userTimelineQueries = useQueries({
    queries: [
      {
        queryKey: ['tweets', userId],
        queryFn: () => getTweetsByUserId(userId!),
        enabled: !!userId,
      },
      {
        queryKey: ['retweets', userId],
        queryFn: () => getRetweetedTweetsByUserId(userId!),
        enabled: !!userId,
      },
    ],
  });

  const userTweets: TweetWithAuthor[] = userTimelineQueries[0].data ?? [];
  const retweetedTweets: RetweetedTweet[] = userTimelineQueries[1].data ?? [];

  const combined = [
    ...userTweets.map(tweet => ({
      ...tweet,
      type: 'tweet' as const,
      sort_date: tweet.created_at,
    })),
    ...retweetedTweets.map(tweet => ({
      ...tweet,
      type: 'retweet' as const,
      sort_date: tweet.retweeted_at,
    })),
  ];
  
  const allData = userId ? (userTimelineQueries[0].data && userTimelineQueries[1].data ? combined : undefined) : tweets;

  useEffect(() => {
    if (highlightTweetId && allData) {
        const highlightedTweet = tweetRefs.current[highlightTweetId];
        if (highlightedTweet) {
            // Delay to allow DOM to update
            setTimeout(() => {
                highlightedTweet.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }
  }, [highlightTweetId, allData]);

  useEffect(() => {
    if (!userId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, userId]);

  if (!userId) {
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
      return <div className="text-red-500 text-center glass-card p-4 rounded-xl">Erro ao carregar tweets: {error.message}</div>;
    }
    if (!tweets || tweets.length === 0) {
      return (
        <div className="h-48 glass-card rounded-xl flex items-center justify-center text-white/60">
          Nenhum tweet para mostrar
        </div>
      );
    }
    return (
      <div>
        <div className={`space-y-4 transition-opacity duration-300 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
          {tweets.map((tweet) => (
            <Tweet 
              key={tweet.id} 
              ref={(el) => (tweetRefs.current[tweet.id] = el)}
              tweet={tweet} 
              isHighlighted={tweet.id === highlightTweetId}
              />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((prev) => prev - 1);
                    }}
                    className={cn('cursor-pointer', currentPage === 1 && 'pointer-events-none opacity-50')}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-white/60 p-2 font-mono">
                    Página {currentPage} de {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
                    }}
                    className={cn('cursor-pointer', currentPage === totalPages && 'pointer-events-none opacity-50')}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    );
  }

  const isUserTimelineLoading = userTimelineQueries.some(q => q.isLoading);
  const userTimelineError = userTimelineQueries.find(q => q.error)?.error;
  
  if (isUserTimelineLoading) {
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

  if (userTimelineError) {
    return <div className="text-red-500 text-center glass-card p-4 rounded-xl">Erro ao carregar tweets: {userTimelineError.message}</div>;
  }
  
  combined.sort((a, b) => new Date(b.sort_date).getTime() - new Date(a.sort_date).getTime());
  
  if (combined.length === 0) {
    return (
      <div className="h-48 glass-card rounded-xl flex items-center justify-center text-white/60">
        Nenhum tweet para mostrar
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {combined.map((item) => {
        const tweetData = item; // FIX: The item itself is the tweet data for both original and retweeted tweets.
        if (!tweetData) return null;

        return (
            <Tweet 
                key={`${item.id}-${item.sort_date}`} 
                ref={(el: HTMLDivElement | null) => (tweetRefs.current[tweetData.id] = el)}
                tweet={tweetData as TweetWithAuthor}
                isRetweet={item.type === 'retweet'} 
                isHighlighted={tweetData.id === highlightTweetId}
            />
        );
      })}
    </div>
  );
};

export default TweetList;
