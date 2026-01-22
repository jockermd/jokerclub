
import { supabase } from '@/integrations/supabase/client';

export interface TopUser {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  total_score: number;
}

export const getTopJokers = async (): Promise<TopUser[]> => {
  const { data, error } = await supabase.rpc('get_top_users');

  if (error) {
    console.error('Error fetching top jokers:', error);
    throw new Error(error.message);
  }

  return data as TopUser[];
};

export interface PopularPost {
  id: string;
  title: string;
  tag: string;
  popularity_score: number;
}

export const getPopularPosts = async (): Promise<PopularPost[]> => {
  const { data, error } = await supabase.rpc('get_popular_posts');

  if (error) {
    console.error('Error fetching popular posts:', error);
    throw new Error(error.message);
  }

  return data as PopularPost[];
};
