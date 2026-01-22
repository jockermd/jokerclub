
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/api/profiles';
import { Skeleton } from '@/components/ui/skeleton';
import { useTweetComposer } from '@/hooks/useTweetComposer';
import TweetComposerHeader from './TweetComposerHeader';
import TweetComposerForm from './TweetComposerForm';

const TweetComposer = () => {
  const { user } = useAuth();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("No user to fetch profile for.");
      return getProfile(user.id);
    },
    enabled: !!user?.id,
  });

  const tweetComposerProps = useTweetComposer(user);

  if (isProfileLoading) {
    return (
      <div className="glass-card rounded-xl overflow-hidden mb-6">
        <Skeleton className="h-24 w-full" />
        <div className="pb-4">
          <Skeleton className="h-24 w-full" />
          <div className="flex justify-between items-center px-4 mt-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="mb-6">
      <TweetComposerHeader profile={profile} />
      <div className="bg-opacity-20 backdrop-filter backdrop-blur-lg bg-card rounded-b-xl">
        <TweetComposerForm {...tweetComposerProps} />
      </div>
    </div>
  );
};

export default TweetComposer;
