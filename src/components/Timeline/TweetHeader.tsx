
import React from 'react';
import { Link } from 'react-router-dom';
import { TweetWithAuthor } from '@/api/tweets';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Repeat2 } from 'lucide-react';

interface TweetHeaderProps {
  author: NonNullable<TweetWithAuthor['profiles']>;
  createdAt: string;
  isRetweet?: boolean;
}

const TweetHeader: React.FC<TweetHeaderProps> = ({ author, createdAt, isRetweet }) => {
  const timestamp = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ptBR });

  return (
    <>
      {isRetweet && (
        <div className="flex items-center text-xs text-white/60 mb-1">
          <Repeat2 className="w-3 h-3 mr-2" />
          Retweetado
        </div>
      )}
      <div className="flex items-center flex-wrap">
        <Link to={`/profile/${author.id}`} className="font-semibold text-white hover:text-mart-primary transition-colors flex items-center gap-1">
          <span>{author.full_name}</span>
          {author.is_verified && <CheckCircle className="h-4 w-4 text-mart-primary" />}
        </Link>
        <span className="mx-2 text-white/40">•</span>
        <Link to={`/profile/${author.id}`} className="text-white/40 hover:text-mart-primary transition-colors">
          @{author.username}
        </Link>
        <span className="mx-2 text-white/40">•</span>
        <span className="text-white/40 text-sm">{timestamp}</span>
      </div>
    </>
  );
};

export default TweetHeader;
