import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pin } from 'lucide-react';
import { TweetWithAuthor } from '@/api/tweets';
import { Collapsible } from '@/components/ui/collapsible';
import TweetHeader from './TweetHeader';
import TweetBody from './TweetBody';
import TweetActions from './TweetActions';
import TweetReplies from './TweetReplies';
interface TweetProps {
  tweet: TweetWithAuthor;
  isRetweet?: boolean;
  isHighlighted?: boolean;
}
const Tweet = React.forwardRef<HTMLDivElement, TweetProps>(({
  tweet,
  isRetweet,
  isHighlighted
}, ref) => {
  const {
    content,
    created_at,
    profiles: author,
    is_pinned,
    id: tweetId,
    images
  } = tweet;
  const [isRepliesSectionOpen, setIsRepliesSectionOpen] = useState(false);
  if (!author) {
    return <div className="glass-card rounded-xl p-4 mb-4 text-white/60">
        Este tweet pertence a um usuário que foi removido.
      </div>;
  }
  return <Collapsible open={isRepliesSectionOpen} onOpenChange={setIsRepliesSectionOpen} className="w-full">
      <div ref={ref} className={`glass-card rounded-xl mb-4 transition-all duration-300 hover:border-mart-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] relative ${is_pinned ? 'border-mart-primary/70' : ''} ${isHighlighted ? 'ring-2 ring-offset-2 ring-offset-mart-dark ring-mart-primary' : ''}`}>
        {is_pinned && <div className="absolute top-3 right-3 text-mart-primary flex items-center text-xs font-semibold -mt-1">
            <Pin className="w-3 h-3 mr-1" />
            <span>Post fixado</span>
          </div>}
        <div className="flex items-start gap-3 py-4 pl-4 pr-8 md:pr-16">
          <Link to={`/profile/${author.id}`} className="flex-shrink-0">
            {author.avatar_url ? <img src={author.avatar_url} alt={author.full_name || ''} className="w-10 h-10 rounded-full border-2 border-mart-primary" /> : <div className="w-10 h-10 rounded-full bg-mart-secondary flex items-center justify-center text-white font-semibold">
                {(author.full_name || 'U').charAt(0)}
              </div>}
          </Link>
          
          <div className="flex-1">
            <TweetHeader author={author} createdAt={created_at} isRetweet={isRetweet} />
            <TweetBody content={content} images={images} />
            <TweetActions tweetId={tweetId} />
          </div>
        </div>
        <TweetReplies tweetId={tweetId} authorUsername={author.username || ''} />
      </div>
    </Collapsible>;
});
export default Tweet;