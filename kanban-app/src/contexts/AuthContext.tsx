/**
 * Contexto de Autenticação Otimizado
 * Gerencia o estado de autenticação do usuário usando Supabase Auth
 * com proteção contra rate limiting e cache de sessão
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

// Cache de sessão para evitar chamadas desnecessárias
interface SessionCache {
  session: Session | null;
  timestamp: number;
  expiresAt: number;
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Propriedades do provider
interface AuthProviderProps {
  children: React.ReactNode;
}

// Provider de autenticação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Refs para controle de estado
  const sessionCacheRef = useRef<SessionCache | null>(null);
  const isGettingSessionRef = useRef(false);
  const lastAuthEventRef = useRef<string>('');

  // Função para verificar se o cache de sessão é válido
  const isSessionCacheValid = useCallback(() => {
    if (!sessionCacheRef.current) return false;
    const now = Date.now();
    return now < sessionCacheRef.current.expiresAt;
  }, []);

  // Função para atualizar o cache de sessão
  const updateSessionCache = useCallback((newSession: Session | null) => {
    const now = Date.now();
    sessionCacheRef.current = {
      session: newSession,
      timestamp: now,
      // Cache válido por 5 minutos ou até 5 minutos antes da expiração do token
      expiresAt: newSession?.expires_at 
        ? (newSession.expires_at * 1000) - (5 * 60 * 1000) 
        : now + (5 * 60 * 1000)
    };
  }, []);

  // Função para atualizar o estado de autenticação
  const updateAuthState = useCallback((newSession: Session | null) => {
    console.log('🔄 updateAuthState called:', { 
      hasSession: !!newSession, 
      userEmail: newSession?.user?.email,
      currentLoading: loading 
    });
    
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);
    updateSessionCache(newSession);
    
    console.log('✅ Auth state updated - loading set to false');
  }, [updateSessionCache, loading]);

  // Função para retry com backoff exponencial
  const retryWithBackoff = useCallback(async (fn: () => Promise<any>, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (i === maxRetries - 1) throw error;
        
        // Se for rate limit, usar backoff exponencial
        if (error?.message?.includes('rate limit') || error?.message?.includes('429')) {
          const delay = Math.min(1000 * Math.pow(2, i), 10000); // Max 10 segundos
          console.log(`⏳ Rate limit detectado, aguardando ${delay}ms antes da tentativa ${i + 2}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Obter sessão inicial com proteção contra múltiplas chamadas
    const getInitialSession = async () => {
      if (initialized || isGettingSessionRef.current) return;
      
      // Verificar cache primeiro
      if (isSessionCacheValid() && sessionCacheRef.current) {
        console.log('✅ Usando sessão do cache');
        if (mounted) {
          updateAuthState(sessionCacheRef.current.session);
          setInitialized(true);
        }
        return;
      }

      isGettingSessionRef.current = true;

      try {
        console.log('🔄 Obtendo sessão inicial...');
        
        await retryWithBackoff(async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('❌ Erro ao obter sessão:', error.message);
            throw error;
          }
          
          if (mounted) {
            updateAuthState(session);
            setInitialized(true);
            if (session) {
              console.log('✅ Sessão restaurada para:', session.user.email);
            }
          }
          console.log('✅ Sessão inicial obtida');
        });
        
      } catch (error: any) {
        console.error('❌ Erro inesperado ao obter sessão:', error);
        if (mounted) {
          updateAuthState(null);
          setInitialized(true);
        }
      } finally {
        isGettingSessionRef.current = false;
      }
    };

    getInitialSession();

    // Escutar mudanças na autenticação com debounce
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Evitar processar o mesmo evento múltiplas vezes
        const eventKey = `${event}_${session?.user?.id || 'null'}_${Date.now()}`;
        if (lastAuthEventRef.current === eventKey) return;
        lastAuthEventRef.current = eventKey;

        // Reduzir logs para evitar spam
        if (event === 'SIGNED_IN' && session?.user?.email) {
          console.log('✅ Usuário logado:', session.user.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Usuário deslogado');
          // Limpar cache ao fazer logout
          sessionCacheRef.current = null;
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token atualizado');
        }
        
        updateAuthState(session);
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
      isGettingSessionRef.current = false;
    };
  }, [initialized, updateAuthState, isSessionCacheValid, retryWithBackoff]);

  // Função para fazer login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      await retryWithBackoff(async () => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('❌ Erro no login:', error.message);
          throw error;
        }
      });
      
      // O estado será atualizado automaticamente pelo onAuthStateChange
      return { error: null };
    } catch (error: any) {
      console.error('❌ Erro inesperado no login:', error);
      setLoading(false);
      return { error: error as AuthError };
    }
  };

  // Função para fazer cadastro
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      await retryWithBackoff(async () => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          console.error('❌ Erro no cadastro:', error.message);
          throw error;
        }
      });
      
      console.log('✅ Cadastro realizado. Verifique seu email para confirmar a conta.');
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      console.error('❌ Erro inesperado no cadastro:', error);
      setLoading(false);
      return { error: error as AuthError };
    }
  };

  // Função para fazer logout
  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🚪 Iniciando logout...');
      
      // Limpar cache antes do logout
      sessionCacheRef.current = null;
      
      await retryWithBackoff(async () => {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('❌ Erro no logout:', error.message);
          throw error;
        }
        
        console.log('✅ Logout realizado com sucesso');
      });
      
      // Resetar loading após logout bem-sucedido
      setLoading(false);
      
      // O estado será atualizado automaticamente pelo onAuthStateChange
      return { error: null };
    } catch (error: any) {
      console.error('❌ Erro inesperado no logout:', error);
      setLoading(false);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};