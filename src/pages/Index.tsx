
import React from 'react';
import ParticleBackground from '@/components/Layout/ParticleBackground';
import Navbar from '@/components/Layout/Navbar';
import TweetList from '@/components/Timeline/TweetList';
import RightSidebar from '@/components/Layout/RightSidebar';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import TweetComposer from '@/components/Timeline/TweetComposer';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            { user && (
              <TweetComposer />
            )}
            
            <div className="mt-6">
              <h2 className="text-xl font-orbitron font-bold text-white mb-4">Timeline</h2>
              <TweetList />
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

export default Index;
