import React from 'react';
import { Heart, MessageSquare, Repeat2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTweetInteractions, toggleLike, toggleRetweet } from '@/api/interactions';
import { useToast } from '@/components/ui/use-toast';
import { CollapsibleTrigger } from '@/components/ui/collapsible';

interface TweetActionsProps {
  tweetId: string;
}

const TweetActions: React.FC<TweetActionsProps> = ({ tweetId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interactions, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ['tweetInteractions', tweetId, user?.id],
    queryFn: () => getTweetInteractions(tweetId, user?.id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike({ tweetId, userId: user!.id }),
    onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ['tweetInteractions', tweetId, user?.id] });
        const previousInteractions = queryClient.getQueryData(['tweetInteractions', tweetId, user?.id]);

        queryClient.setQueryData(['tweetInteractions', tweetId, user?.id], (old: any) => ({
            ...old,
            likes: old.hasLiked ? old.likes - 1 : old.likes + 1,
            hasLiked: !old.hasLiked,
        }));
        
        return { previousInteractions };
    },
    onError: (err, variables, context: any) => {
        if (context?.previousInteractions) {
            queryClient.setQueryData(['tweetInteractions', tweetId, user?.id], context.previousInteractions);
        }
        toast({ title: "Error", description: "Could not update like.", variant: "destructive" });
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['tweetInteractions', tweetId, user?.id] });
    }
  });

  const retweetMutation = useMutation({
    mutationFn: () => toggleRetweet({ tweetId, userId: user!.id }),
     onMutate: async () => {
        await queryClient.cancelQueries({ queryKey: ['tweetInteractions', tweetId, user?.id] });
        const previousInteractions = queryClient.getQueryData(['tweetInteractions', tweetId, user?.id]);

        queryClient.setQueryData(['tweetInteractions', tweetId, user?.id], (old: any) => ({
            ...old,
            retweets: old.hasRetweeted ? old.retweets - 1 : old.retweets + 1,
            hasRetweeted: !old.hasRetweeted,
        }));
        
        return { previousInteractions };
    },
    onError: (err, variables, context: any) => {
        if (context?.previousInteractions) {
            queryClient.setQueryData(['tweetInteractions', tweetId, user?.id], context.previousInteractions);
        }
        toast({ title: "Error", description: "Could not update retweet.", variant: "destructive" });
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['tweetInteractions', tweetId, user?.id] });
        if (user) {
          queryClient.invalidateQueries({ queryKey: ['likedTweets', user.id] });
        }
    }
  });
  
  const handleLike = () => {
    if (!user) {
        toast({ title: "Authentication required", description: "You must be logged in to like a tweet.", variant: "destructive" });
        return;
    }
    likeMutation.mutate();
  };

  const handleRetweet = () => {
    if (!user) {
        toast({ title: "Authentication required", description: "You must be logged in to retweet.", variant: "destructive" });
        return;
    }
    retweetMutation.mutate();
  };

  const likes = interactions?.likes ?? 0;
  const retweets = interactions?.retweets ?? 0;
  const replies = interactions?.replies ?? 0;
  const hasLiked = interactions?.hasLiked ?? false;
  const hasRetweeted = interactions?.hasRetweeted ?? false;
  
  return (
    <div className="mt-4 flex items-center gap-x-12">
      <CollapsibleTrigger asChild>
        <button 
          className="flex items-center text-white/60 hover:text-mart-primary transition-colors">
          <MessageSquare className="w-4 h-4 mr-1" />
          {isLoadingInteractions ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="text-xs">{replies}</span>}
        </button>
      </CollapsibleTrigger>
      
      <button 
        onClick={handleRetweet}
        disabled={retweetMutation.isPending || isLoadingInteractions}
        className={`flex items-center transition-colors ${
          hasRetweeted ? 'text-green-400' : 'text-white/60 hover:text-green-400'
        }`}
      >
        <Repeat2 className="w-4 h-4 mr-1" />
        {isLoadingInteractions ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="text-xs">{retweets}</span>}
      </button>
      
      <button 
        onClick={handleLike}
        disabled={likeMutation.isPending || isLoadingInteractions}
        className={`flex items-center transition-colors ${
          hasLiked ? 'text-red-400' : 'text-white/60 hover:text-red-400'
        }`}
      >
        <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
        {isLoadingInteractions ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="text-xs">{likes}</span>}
      </button>
    </div>
  );
};

export default TweetActions;
