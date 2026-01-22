
import React from 'react';
import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkIsFollowing, toggleFollow } from '@/api/profiles';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserFollowCardProps {
  profile: Tables<'profiles'>;
}

const UserFollowCard: React.FC<UserFollowCardProps> = ({ profile }) => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const isCurrentUserProfile = currentUser?.id === profile.id;

  const { data: isFollowing, isLoading: isLoadingIsFollowing } = useQuery({
    queryKey: ['isFollowing', currentUser?.id, profile.id],
    queryFn: () => {
      if (!currentUser || isCurrentUserProfile) return false;
      return checkIsFollowing(currentUser.id, profile.id);
    },
    enabled: !!currentUser && !isCurrentUserProfile,
  });

  const followMutation = useMutation({
    mutationFn: () => {
      if (isCurrentUserProfile) throw new Error("Cannot follow yourself");
      return toggleFollow(profile.id, !!isFollowing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', currentUser?.id, profile.id] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
      queryClient.invalidateQueries({ queryKey: ['topUsers'] });
      toast.success(isFollowing ? `Unfollowed @${profile.username}` : `Followed @${profile.username}`);
    },
    onError: (err: Error) => {
      toast.error(`Failed to perform action: ${err.message}`);
    },
  });

  return (
    <div className="flex items-start justify-between p-4 glass-card rounded-lg">
      <div className="flex items-start gap-4">
        <Link to={`/profile/${profile.id}`}>
          <Avatar>
            <AvatarImage src={profile.avatar_url ?? ''} alt={profile.full_name ?? ''} />
            <AvatarFallback>{(profile.full_name || 'U').charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link to={`/profile/${profile.id}`} className="hover:underline">
            <p className="font-bold text-white">{profile.full_name}</p>
            <p className="text-sm text-white/60">@{profile.username}</p>
          </Link>
          {profile.bio && <p className="mt-1 text-sm text-white/90 max-w-md">{profile.bio}</p>}
        </div>
      </div>
      {!isCurrentUserProfile && currentUser && (
        <Button
          size="sm"
          onClick={() => followMutation.mutate()}
          disabled={isLoadingIsFollowing || followMutation.isPending}
          variant={isFollowing ? 'secondary' : 'default'}
        >
          {(isLoadingIsFollowing || followMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
};

export default UserFollowCard;
