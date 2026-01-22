
import { supabase } from '@/integrations/supabase/client';

export type GlobalRecentActivity = {
    id: string;
    activity_type: 'like' | 'retweet' | 'reply' | 'follow';
    created_at: string;
    actor_id: string;
    actor_username: string | null;
    actor_full_name: string | null;
    actor_avatar_url: string | null;
    tweet_id: string | null;
};

export const getGlobalRecentActivities = async (): Promise<GlobalRecentActivity[]> => {
    const { data, error } = await supabase.rpc('get_global_recent_activities');

    if (error) {
        console.error('Error fetching global recent activities:', error);
        throw new Error(error.message);
    }

    return (data as GlobalRecentActivity[]) || [];
};
