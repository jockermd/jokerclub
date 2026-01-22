
import React from 'react';
import PopularPosts from '@/components/Sidebar/PopularPosts';
import RecentActivities from '@/components/Sidebar/RecentActivities';
import Consulting from '@/components/Sidebar/Consulting';
import TopJokers from '@/components/Sidebar/TopJokers';
import { useLocation } from 'react-router-dom';

const RightSidebar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const visibilityClasses = isHomePage ? 'block' : 'hidden lg:block';

  return (
    <aside className={`space-y-6 ${visibilityClasses}`}>
      <TopJokers />
      <PopularPosts />
      <RecentActivities />
      <Consulting />
    </aside>
  );
};

export default RightSidebar;
