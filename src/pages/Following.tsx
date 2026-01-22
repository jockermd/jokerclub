
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFollowing, getProfile } from '@/api/profiles';
import ParticleBackground from '@/components/Layout/ParticleBackground';
import Navbar from '@/components/Layout/Navbar';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import UserFollowCard from '@/components/Profile/UserFollowCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

const Following = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Invalid URL. User ID is missing.
      </div>
    );
  }
  
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id),
  });

  const { data: following, isLoading: isLoadingFollowing, error } = useQuery({
    queryKey: ['following', id],
    queryFn: () => getFollowing(id),
    enabled: !!id,
  });

  const isLoading = isLoadingFollowing || isLoadingProfile;

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
           <div className="mb-4">
            <Link to={`/profile/${id}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              {isLoadingProfile ? <Skeleton className="h-6 w-32" /> : <span className="font-bold text-lg">{profile?.full_name}</span>}
            </Link>
            <h1 className="text-2xl font-bold text-white mt-1">Following</h1>
          </div>
          
          <div className="space-y-4">
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 glass-card rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
            
            {!isLoading && error && (
              <div className="h-48 glass-card rounded-xl flex items-center justify-center text-white/60 text-xl">
                Error loading users: {error.message}
              </div>
            )}
            
            {!isLoading && !error && following?.length === 0 && (
              <div className="h-48 glass-card rounded-xl flex items-center justify-center text-white/60 text-xl">
                This user is not following anyone.
              </div>
            )}
            
            {!isLoading && !error && following?.map(followedUser => (
              <UserFollowCard key={followedUser.id} profile={followedUser} />
            ))}
          </div>
        </div>
      </main>
      
      <MobileNavbar />
    </div>
  );
};

export default Following;
