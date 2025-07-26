/**
 * Configuração do cliente Supabase
 * Este arquivo configura a conexão com o banco de dados Supabase
 * As credenciais são carregadas das variáveis de ambiente para maior segurança
 */

import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase (carregada do arquivo .env)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

// Chave pública (anon key) do Supabase (carregada do arquivo .env)
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Verificação de segurança para garantir que as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não encontradas. ' +
    'Verifique se REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY estão definidas no arquivo .env'
  );
}

// Criar e exportar o cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configurar persistência da sessão
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'kanban-auth-token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  // Configurações globais para melhor performance
  global: {
    headers: {
      'x-my-custom-header': 'kanban-app',
    },
  },
});

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string;
          title: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      columns: {
        Row: {
          id: string;
          title: string;
          board_id: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          board_id: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          board_id?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          column_id: string;
          position: number;
          priority: 'low' | 'medium' | 'high';
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          column_id: string;
          position?: number;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          column_id?: string;
          position?: number;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}