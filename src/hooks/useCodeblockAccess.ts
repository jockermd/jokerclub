
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { checkUserCodeblockAccess } from '@/api/codeblockPermissions';
import { supabase } from '@/integrations/supabase/client';

export const useCodeblockAccess = (codeblockId: string, codeblockCreatedBy?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['codeblock-access', codeblockId, user?.id],
    queryFn: async () => {
      console.log('Checking access for codeblock:', codeblockId, 'user:', user?.id);
      
      if (!user) {
        console.log('No user logged in');
        return { hasAccess: false, isOwner: false, isAdmin: false, shouldFilter: true };
      }

      // Verificar se é o dono do codeblock
      const isOwner = codeblockCreatedBy === user.id;
      console.log('Is owner?', isOwner);

      // Verificar se é admin
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      const isAdmin = !!userRoles;
      console.log('Is admin?', isAdmin);

      // Se é admin ou dono, sempre tem acesso
      if (isAdmin || isOwner) {
        console.log('Has admin/owner access');
        return { hasAccess: true, isOwner, isAdmin, shouldFilter: false };
      }

      // Verificar permissão específica
      try {
        const hasSpecificAccess = await checkUserCodeblockAccess(codeblockId, user.id);
        console.log('Has specific access?', hasSpecificAccess);

        return { 
          hasAccess: hasSpecificAccess, 
          isOwner: false, 
          isAdmin: false,
          shouldFilter: !hasSpecificAccess
        };
      } catch (error) {
        console.error('Error checking codeblock access:', error);
        return { hasAccess: false, isOwner: false, isAdmin: false, shouldFilter: true };
      }
    },
    enabled: !!user && !!codeblockId,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1
  });
};
