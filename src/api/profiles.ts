import { supabase } from '@/integrations/supabase/client';
import { TablesUpdate, Tables } from '@/integrations/supabase/types';
// import DOMPurify from 'dompurify';

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = 'exact one row not found'
    console.error('Error fetching profile:', error);
    throw new Error(error.message);
  }

  return data;
};

export const getAllProfiles = async (): Promise<Tables<'profiles'>[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all profiles:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateProfile = async (userId: string, profileData: TablesUpdate<'profiles'>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error(error.message);
  }

  return data;
};

export const uploadProfileImage = async ({
  userId,
  file,
  type,
  oldPath
}: {
  userId: string;
  file: File;
  type: 'avatar' | 'cover';
  oldPath?: string | null;
}) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Apenas JPG, PNG, e GIF são aceitos.');
  }

  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. O tamanho máximo é de 5MB.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${type}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  if (oldPath) {
    const oldFileNameMatch = oldPath.match(/profile-media\/(.*)/);
    if (oldFileNameMatch && oldFileNameMatch[1]) {
      const { error: removeError } = await supabase.storage
        .from('profile-media')
        .remove([oldFileNameMatch[1]]);
      if (removeError) {
        console.error(`Error removing old ${type} image:`, removeError);
        // We log the error but don't throw, as we can continue with the upload.
      }
    }
  }

  const { error: uploadError } = await supabase.storage
    .from('profile-media')
    .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
    });

  if (uploadError) {
    console.error(`Error uploading ${type} image:`, uploadError);
    throw new Error(uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('profile-media')
    .getPublicUrl(filePath);

  return publicUrl;
};

export const getFollowStats = async (userId: string) => {
  const { count: followers, error: followersError } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('followed_id', userId);

  if (followersError) {
    console.error('Error fetching followers count:', followersError);
    throw new Error(followersError.message);
  }

  const { count: following, error: followingError } = await supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  if (followingError) {
    console.error('Error fetching following count:', followingError);
    throw new Error(followingError.message);
  }

  return { followers: followers ?? 0, following: following ?? 0 };
};

export type ProfileWithFollowInfo = Tables<'profiles'>;

export const getFollowers = async (userId: string): Promise<ProfileWithFollowInfo[]> => {
  const { data, error } = await supabase
    .from('followers')
    .select('profiles!follower_id!inner(*)')
    .eq('followed_id', userId);

  if (error) {
    console.error('Error fetching followers:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  return data.map(item => item.profiles).filter((p): p is Tables<'profiles'> => p !== null);
};

export const getFollowing = async (userId: string): Promise<ProfileWithFollowInfo[]> => {
  const { data, error } = await supabase
    .from('followers')
    .select('profiles!followed_id!inner(*)')
    .eq('follower_id', userId);

  if (error) {
    console.error('Error fetching following:', error);
    throw new Error(error.message);
  }
  
  if (!data) {
    return [];
  }

  return data.map(item => item.profiles).filter((p): p is Tables<'profiles'> => p !== null);
};

export const checkIsFollowing = async (followerId: string, followedId: string) => {
  if (followerId === followedId) return false;
  
  const { data, error } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', followerId)
    .eq('followed_id', followedId)
    .maybeSingle();

  if (error) {
    console.error('Error checking follow status:', error);
    throw new Error(error.message);
  }

  return !!data;
};

export const toggleFollow = async (followedId: string, isCurrentlyFollowing: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const followerId = user.id;

    if (followerId === followedId) {
        throw new Error("You cannot follow yourself.");
    }

    if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
            .from('followers')
            .delete()
            .eq('follower_id', followerId)
            .eq('followed_id', followedId);

        if (error) {
            console.error("Error unfollowing user:", error);
            throw new Error(error.message);
        }
    } else {
        // Follow
        const { error } = await supabase
            .from('followers')
            .insert({ follower_id: followerId, followed_id: followedId });
        
        if (error) {
            console.error("Error following user:", error);
            throw new Error(error.message);
        }
    }
};
