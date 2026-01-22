
import React from 'react';
import { SearchResult } from '@/api/search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';

const UserSearchResultCard: React.FC<{ user: SearchResult }> = ({ user }) => {
  return (
    <Link to={`/profile/${user.author_id}`} className="block">
      <div className="p-4 glass-card-hover rounded-lg flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.author_avatar_url || undefined} alt={user.author_username || 'avatar'} />
          <AvatarFallback>{user.author_username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex items-center gap-1">
            <p className="font-bold text-white">{user.author_full_name}</p>
            {user.author_is_verified && <BadgeCheck className="h-5 w-5 text-mart-primary" />}
          </div>
          <p className="text-sm text-white/70">@{user.author_username}</p>
          <p className="text-sm text-white/90 mt-2 line-clamp-2">{user.profile_bio}</p>
        </div>
      </div>
    </Link>
  );
};

export default UserSearchResultCard;
