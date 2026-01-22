
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRepliesByTweetId } from '@/api/replies';
import { useAuth } from '@/contexts/AuthContext';
import Reply from './Reply';
import ReplyForm from './ReplyForm';
import { Loader2 } from 'lucide-react';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface TweetRepliesProps {
  tweetId: string;
  authorUsername: string;
}

const TweetReplies: React.FC<TweetRepliesProps> = ({ tweetId, authorUsername }) => {
  const { user } = useAuth();
  
  const { data: repliesData, isLoading: isLoadingReplies } = useQuery({
    queryKey: ['replies', tweetId],
    queryFn: () => getRepliesByTweetId(tweetId),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <CollapsibleContent className="animate-accordion-down">
      <div className="border-t border-white/10 mx-4" />
      <div className="px-4 pb-2">
          <div className="divide-y divide-white/10">
              {isLoadingReplies && <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-white/60" /></div>}
              {!isLoadingReplies && repliesData && repliesData.length > 0 && (
                  repliesData.map(reply => <Reply key={reply.id} reply={reply} />)
              )}
          </div>
          {!isLoadingReplies && (!repliesData || repliesData.length === 0) && (
              <div className={cn(!user && "pt-4")}>
                  <p className="text-center text-white/40 text-sm py-4">
                      {user ? 'Seja o primeiro a responder!' : 'Faça login para responder.'}
                  </p>
              </div>
          )}
          {user && <ReplyForm tweetId={tweetId} authorUsername={authorUsername} onReplySuccess={() => {}} />}
      </div>
    </CollapsibleContent>
  );
};

export default TweetReplies;
