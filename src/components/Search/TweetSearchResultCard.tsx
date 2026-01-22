
import React from 'react';
import { SearchResult } from '@/api/search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BadgeCheck } from 'lucide-react';

const TweetSearchResultCard: React.FC<{ tweet: SearchResult }> = ({ tweet }) => {
  const timeAgo = formatDistanceToNow(new Date(tweet.result_created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className="p-4 glass-card-hover rounded-lg flex items-start gap-4">
      <Link to={`/profile/${tweet.author_id}`}>
        <Avatar className="h-12 w-12">
          <AvatarImage src={tweet.author_avatar_url || undefined} alt={tweet.author_username || 'avatar'} />
          <AvatarFallback>{tweet.author_username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-grow">
        <div className="flex items-center gap-2 flex-wrap">
           <Link to={`/profile/${tweet.author_id}`} className="flex items-center gap-1">
              <p className="font-bold text-white hover:underline">{tweet.author_full_name}</p>
              {tweet.author_is_verified && <BadgeCheck className="h-5 w-5 text-mart-primary" />}
            </Link>
          <p className="text-sm text-white/50">@{tweet.author_username}</p>
          <span className="text-white/50 hidden sm:inline">·</span>
          <p className="text-sm text-white/50">{timeAgo}</p>
        </div>
        <p className="text-white/90 mt-1 whitespace-pre-wrap">{tweet.result_content}</p>
      </div>
    </div>
  );
};

export default TweetSearchResultCard;
