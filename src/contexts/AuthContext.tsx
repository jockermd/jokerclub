
import { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { getUserRoles } from '@/api/roles';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Refs para evitar múltiplas chamadas simultâneas
  const isCheckingRoles = useRef(false);
  const lastRoleCheckUserId = useRef<string | null>(null);
  const lastRoleCheckTime = useRef<number>(0);
  const roleCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Função para verificar roles com debounce, lock e cache
  const checkUserRoles = async (userId: string) => {
    const now = Date.now();
    const CACHE_DURATION = 60000; // 1 minuto de cache
    
    // Se já verificou recentemente (menos de 1 minuto atrás), não verifica novamente
    if (lastRoleCheckUserId.current === userId && (now - lastRoleCheckTime.current) < CACHE_DURATION) {
      console.log("Roles já verificadas recentemente, usando cache");
      return;
    }

    // Se já está verificando para o mesmo usuário, não faz nada
    if (isCheckingRoles.current && lastRoleCheckUserId.current === userId) {
      console.log("Verificação de roles já em andamento, ignorando...");
      return;
    }

    // Cancela timeout anterior se existir
    if (roleCheckTimeout.current) {
      clearTimeout(roleCheckTimeout.current);
    }

    // Debounce de 1 segundo (aumentado para evitar rate limit)
    roleCheckTimeout.current = setTimeout(async () => {
      isCheckingRoles.current = true;
      lastRoleCheckUserId.current = userId;
      
      try {
        console.log("Verificando roles para usuário:", userId);
        const roles = await getUserRoles(userId);
        setIsAdmin(roles.some(r => r.role === 'admin'));
        lastRoleCheckTime.current = Date.now();
        console.log("Roles carregadas com sucesso");
      } catch (error) {
        console.error("Erro ao carregar roles:", error);
        setIsAdmin(false);
      } finally {
        isCheckingRoles.current = false;
      }
    }, 1000);
  };

  useEffect(() => {
    // Previne múltiplas inicializações
    if (isInitialized.current) {
      console.log("AuthContext já inicializado, ignorando...");
      return;
    }
    
    isInitialized.current = true;
    let mounted = true;
    let authListener: { data: { subscription: any } } | null = null;

    const initializeAuth = async () => {
      try {
        console.log("Iniciando autenticação...");
        
        // Configura o listener ANTES de buscar a sessão
        authListener = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;

          console.log("Auth state change:", event);

          setSession(session);
          setUser(session?.user ?? null);

          // APENAS verifica roles no login inicial (SIGNED_IN)
          // Não verificar em TOKEN_REFRESHED ou USER_UPDATED para evitar rate limit
          if (event === 'SIGNED_IN' && session?.user) {
            checkUserRoles(session.user.id);
          }

          if (event === 'SIGNED_OUT') {
            setIsAdmin(false);
            lastRoleCheckUserId.current = null;
            lastRoleCheckTime.current = 0;
          }
        });

        // Busca a sessão atual UMA ÚNICA VEZ
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        console.log("Sessão atual obtida:", currentSession ? "Autenticado" : "Não autenticado");

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await checkUserRoles(currentSession.user.id);
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (roleCheckTimeout.current) {
        clearTimeout(roleCheckTimeout.current);
      }
      authListener?.data?.subscription?.unsubscribe();
    };
  }, []); // Dependência vazia - executa apenas uma vez

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Erro ao sair');
      } else {
        setIsAdmin(false);
        lastRoleCheckUserId.current = null;
        toast.success('Desconectado com sucesso');
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      toast.error('Erro ao sair');
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      <Toaster />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
