
import React from 'react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface TweetComposerHeaderProps {
  profile: Profile;
}

const TweetComposerHeader = ({ profile }: TweetComposerHeaderProps) => (
  <div 
    className="glass-card rounded-t-xl border-b-0 h-24 lg:h-40 bg-gradient-to-r from-mart-primary/30 to-mart-accent/30 bg-cover bg-center" 
    style={profile.cover_photo_url ? { backgroundImage: `url(${profile.cover_photo_url})` } : {}}
  />
);

export default TweetComposerHeader;
