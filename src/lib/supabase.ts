/**
 * Configuração do cliente Supabase
 * Este arquivo configura a conexão com o banco de dados Supabase
 */

import { createClient } from '@supabase/supabase-js';

// URL do projeto Supabase
const supabaseUrl = 'https://pneceuljvsgduyowhlse.supabase.co';

// Chave pública (anon key) do Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZWNldWxqdnNnZHV5b3dobHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTIzODUsImV4cCI6MjA2OTEyODM4NX0.gWQGBDZWGxiKu1iF1kn_2RnpXDvhQV4XSVfwWUmhQcA';

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