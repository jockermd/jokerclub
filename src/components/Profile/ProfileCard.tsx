
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import { EditProfileModal } from './EditProfileModal';
import { EditConsultantProfileModal } from './EditConsultantProfileModal';
import { CheckCircle, Loader2, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CustomBadge from '@/components/common/CustomBadge';
import { BadgeDetails } from '@/lib/badgeOptions';

interface ProfileCardProps {
  profile: Tables<'profiles'>;
  following: number;
  followers: number;
  isFollowing?: boolean;
  isCurrentUser?: boolean;
  onFollowToggle?: () => void;
  isFollowLoading?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  following,
  followers,
  isFollowing = false,
  isCurrentUser = false,
  onFollowToggle,
  isFollowLoading = false
}) => {
  const { isAdmin } = useAuth();
  const badgeDetails = profile.badge_details as unknown as BadgeDetails | null;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Cover photo */}
      <div className="h-36 bg-gradient-to-r from-mart-primary/30 to-mart-accent/30 relative bg-cover bg-center" style={profile.cover_photo_url ? {
        backgroundImage: `url(${profile.cover_photo_url})`
      } : {}}>
        {/* Profile picture */}
        <div className="absolute -bottom-12 left-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-24 h-24 rounded-full border-4 border-mart-dark" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-mart-secondary flex items-center justify-center text-white text-xl font-bold border-4 border-mart-dark">
              {(profile.full_name || 'U').charAt(0)}
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {isCurrentUser ? (
            <>
              {isAdmin && <EditConsultantProfileModal profile={profile} />}
              <EditProfileModal profile={profile}>
                <Button variant="outline" size="sm">Edit Profile</Button>
              </EditProfileModal>
            </>
          ) : (
            <Button 
              size="sm" 
              onClick={onFollowToggle} 
              disabled={isFollowLoading} 
              variant={isFollowing ? 'secondary' : 'default'}
            >
              {isFollowLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-14 px-4 pb-6">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
          <h2 className="text-xl font-bold text-white">{profile.full_name}</h2>
          {profile.is_verified && <CheckCircle className="h-5 w-5 text-mart-primary" />}
          <CustomBadge details={badgeDetails} size="sm" />
          {profile.is_consultant && (
            <span className="bg-mart-primary/20 text-mart-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {(profile as any).consultant_badge_text || 'FUNDADOR'}
            </span>
          )}
        </div>
        
        <p className="text-white/60">@{profile.username}</p>
        
        {profile.bio && <p className="mt-3 text-white/90">{profile.bio}</p>}

        {/* Consultant Info */}
        {profile.is_consultant && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
              {(profile as any).consultant_section_title || 'PERFIL DO FUNDADOR'}
            </h3>
            {(profile as any).consultant_title && (
              <p className="text-lg font-bold text-white mt-1">{(profile as any).consultant_title}</p>
            )}
            {(profile as any).consultant_bio && (
              <p className="mt-2 text-white/90 text-sm">{(profile as any).consultant_bio}</p>
            )}
            {(profile as any).hourly_rate && (
              <div className="mt-3 text-sm">
                <span className="font-bold text-mart-primary text-base">
                  R$ {((profile as any).hourly_rate / 100).toFixed(2).replace('.', ',')}
                </span>
                <span className="text-white/60"> / hora</span>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex space-x-4">
          <Link to={`/profile/${profile.id}/following`} className="text-white hover:text-mart-primary transition-colors">
            <span className="font-bold">{following}</span>
            <span className="text-white/60 ml-1">Following</span>
          </Link>
          <Link to={`/profile/${profile.id}/followers`} className="text-white hover:text-mart-primary transition-colors">
            <span className="font-bold">{followers}</span>
            <span className="text-white/60 ml-1">Followers</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
