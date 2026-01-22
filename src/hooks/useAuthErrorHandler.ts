
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthErrorHandler = () => {
  const handleAuthError = useCallback(async (error: any, retryCallback?: () => Promise<any>) => {
    if (error?.message?.includes('JWT expired') || error?.code === 'PGRST301') {
      console.log('JWT expired, attempting to refresh token...');
      
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          console.error('Failed to refresh token:', refreshError);
          toast.error('Sessão expirada. Faça login novamente.');
          await supabase.auth.signOut();
          return null;
        }
        
        console.log('Token refreshed successfully');
        
        // Retry the original request if callback provided
        if (retryCallback) {
          return await retryCallback();
        }
        
        return session;
      } catch (refreshError) {
        console.error('Error during token refresh:', refreshError);
        toast.error('Erro ao renovar sessão. Faça login novamente.');
        await supabase.auth.signOut();
        return null;
      }
    }
    
    // Handle other auth errors
    console.error('Auth error:', error);
    toast.error('Erro de autenticação');
    return null;
  }, []);

  return { handleAuthError };
};
