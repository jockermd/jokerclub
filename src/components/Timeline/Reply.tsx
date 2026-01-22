
import React from 'react';
import { Link } from 'react-router-dom';
import { ReplyWithAuthor } from '@/api/replies';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';
import { useTextExpansion } from '@/hooks/useTextExpansion';
import { cn } from '@/lib/utils';

interface ReplyProps {
  reply: ReplyWithAuthor;
}

const Reply: React.FC<ReplyProps> = ({ reply }) => {
  const { content, created_at, profiles: author } = reply;
  const { contentRef, isExpanded, canBeTruncated, toggleExpansion } = useTextExpansion();

  if (!author) {
    return null;
  }

  const timestamp = formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: ptBR });

  return (
    <div className="flex items-start gap-4 py-4">
      <Link to={`/profile/${author.id}`} className="flex-shrink-0">
        {author.avatar_url ? (
          <img 
            src={author.avatar_url} 
            alt={author.full_name || ''} 
            className="w-10 h-10 rounded-full border border-mart-primary"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-mart-secondary flex items-center justify-center text-white font-semibold text-base">
            {(author.full_name || 'U').charAt(0)}
          </div>
        )}
      </Link>
      
      <div className="flex-1">
        <div className="flex items-center flex-wrap gap-x-2">
          <Link to={`/profile/${author.id}`} className="font-semibold text-white hover:text-mart-primary transition-colors flex items-center gap-1 text-sm">
            <span>{author.full_name}</span>
            {author.is_verified && <CheckCircle className="h-3 w-3 text-mart-primary" />}
          </Link>
          <Link to={`/profile/${author.id}`} className="text-white/40 hover:text-mart-primary transition-colors text-sm">
            @{author.username}
          </Link>
          <span className="text-white/40">•</span>
          <span className="text-white/40 text-xs">{timestamp}</span>
        </div>
        
        <div className="text-white/90 break-words text-base mt-1">
          <div
            ref={contentRef}
            className={cn("whitespace-pre-wrap text-left", !isExpanded && "line-clamp-5")}
          >
            {content}
          </div>
          {canBeTruncated && (
            <button
              onClick={toggleExpansion}
              className="text-mart-primary font-semibold text-sm mt-1 hover:underline"
            >
              {isExpanded ? 'Ver Menos' : 'Ver Mais'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reply;
