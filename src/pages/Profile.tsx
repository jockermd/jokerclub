import React from 'react';
import ParticleBackground from '@/components/Layout/ParticleBackground';
import Navbar from '@/components/Layout/Navbar';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import ProfileCard from '@/components/Profile/ProfileCard';
import TweetList from '@/components/Timeline/TweetList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { getProfile, getFollowStats, checkIsFollowing, toggleFollow } from '@/api/profiles';
import { Skeleton } from '@/components/ui/skeleton';
import LikedTweetList from '@/components/Timeline/LikedTweetList';
import SimpleTweetComposer from '@/components/Timeline/SimpleTweetComposer';
import RightSidebar from '@/components/Layout/RightSidebar';
import { toast } from 'sonner';

const Profile = () => {
  const { user: currentUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const highlightTweetId = searchParams.get('highlight_tweet');
  const queryClient = useQueryClient();

  // If no id in URL, view current user's profile.
  const profileId = id || currentUser?.id;

  const { data: profile, isLoading: isLoadingProfile, error } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => {
      if (!profileId) throw new Error("No profile to fetch.");
      return getProfile(profileId);
    },
    enabled: !!profileId,
  });

  const { data: followStats, isLoading: isLoadingFollowStats } = useQuery({
    queryKey: ['followStats', profileId],
    queryFn: () => {
        if (!profileId) throw new Error("No profile to fetch stats for.");
        return getFollowStats(profileId);
    },
    enabled: !!profileId,
  });

  const isCurrentUser = profileId === currentUser?.id;

  const { data: isFollowing, isLoading: isLoadingIsFollowing } = useQuery({
      queryKey: ['isFollowing', currentUser?.id, profileId],
      queryFn: () => {
          if (!currentUser || !profileId || isCurrentUser) return false;
          return checkIsFollowing(currentUser.id, profileId);
      },
      enabled: !!currentUser && !!profileId && !isCurrentUser,
  });

  const followMutation = useMutation({
    mutationFn: () => {
        if (!profileId) throw new Error("No profile to follow/unfollow");
        if (isCurrentUser) throw new Error("Cannot follow yourself");
        return toggleFollow(profileId, !!isFollowing);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['followStats', profileId] });
        queryClient.invalidateQueries({ queryKey: ['isFollowing', currentUser?.id, profileId] });
        queryClient.invalidateQueries({ queryKey: ['topUsers'] });
        toast.success(isFollowing ? `Unfollowed @${profile?.username}` : `Followed @${profile?.username}`);
    },
    onError: (err: Error) => {
        toast.error(`Failed to perform action: ${err.message}`);
    }
  });

  const isLoading = isLoadingProfile || isLoadingFollowStats || (!isCurrentUser && isLoadingIsFollowing);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <ParticleBackground />
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="glass-card rounded-xl overflow-hidden">
                <Skeleton className="h-36 w-full" />
                <div className="relative pt-14 px-4 pb-6">
                  <Skeleton className="absolute -bottom-12 left-4 w-24 h-24 rounded-full border-4 border-mart-dark" />
                  <Skeleton className="h-7 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-12 w-full mt-3" />
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen">
        <ParticleBackground />
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="h-48 glass-card rounded-xl flex items-center justify-center text-white/60 text-xl">
                {error ? `Error: ${error.message}` : "Profile not found."}
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <ProfileCard 
              profile={profile}
              following={followStats?.following ?? 0}
              followers={followStats?.followers ?? 0}
              isCurrentUser={isCurrentUser}
              isFollowing={isFollowing}
              onFollowToggle={() => followMutation.mutate()}
              isFollowLoading={followMutation.isPending}
            />
            
            {isCurrentUser && (
              <div className="mt-6">
                <SimpleTweetComposer />
              </div>
            )}
            
            <div className="mt-6">
              <Tabs defaultValue="tweets" className="w-full">
                <TabsList className="w-full grid grid-cols-3 glass-card">
                  <TabsTrigger value="tweets">Tweets</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="likes">Likes</TabsTrigger>
                </TabsList>
                <TabsContent value="tweets" className="mt-4">
                  <TweetList userId={profile.id} highlightTweetId={highlightTweetId} />
                </TabsContent>
                <TabsContent value="media" className="mt-4">
                  <div className="h-48 glass-card rounded-xl flex items-center justify-center text-white/60">
                    No media tweets to show
                  </div>
                </TabsContent>
                <TabsContent value="likes" className="mt-4">
                  <LikedTweetList userId={profile.id} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="lg:col-span-4">
            <RightSidebar />
          </div>
        </div>
      </main>
      
      <MobileNavbar />
    </div>
  );
};

export default Profile;
