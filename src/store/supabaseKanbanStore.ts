/**
 * Store do Kanban integrado com Supabase
 * Gerencia o estado e sincronização com o banco de dados
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Tipos para o banco de dados
export interface DbBoard {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DbColumn {
  id: string;
  title: string;
  board_id: string;
  position: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface DbTask {
  id: string;
  title: string;
  description: string | null;
  column_id: string;
  position: number;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  category_color: string;
  tags: string[];
  assignee: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos para o estado local
export interface LocalBoard {
  id: string;
  title: string;
  columns: LocalColumn[];
  tasks: { [key: string]: LocalTask };
  created_at: Date;
  updated_at: Date;
}

export interface LocalColumn {
  id: string;
  title: string;
  board_id: string;
  position: number;
  color: string;
  taskIds: string[];
  created_at: Date;
  updated_at: Date;
}

export interface LocalTask {
  id: string;
  title: string;
  description: string | null;
  column_id: string;
  position: number;
  priority: 'low' | 'medium' | 'high';
  due_date: Date | null;
  category_color: string;
  tags: string[];
  assignee: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ModalState {
  isOpen: boolean;
  type: 'task' | 'column' | 'settings' | null;
  mode?: 'create' | 'edit';
  data?: any;
}

// Interface do store
interface SupabaseKanbanStore {
  // Estado
  board: LocalBoard | null;
  modalState: ModalState;
  isLoading: boolean;
  error: string | null;
  
  // Ações para carregar dados
  loadBoard: (userId: string) => Promise<void>;
  
  // Ações para tarefas
  addTask: (columnId: string, taskData: Omit<LocalTask, 'id' | 'created_at' | 'updated_at' | 'column_id' | 'position'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<LocalTask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string, newPosition: number) => Promise<void>;
  
  // Ações para colunas
  addColumn: (title: string, color?: string) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<LocalColumn>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (columnIds: string[]) => Promise<void>;
  
  // Ações para modal
  openModal: (type: ModalState['type'], mode?: ModalState['mode'], data?: any) => void;
  closeModal: () => void;
  
  // Ações gerais
  updateBoardTitle: (title: string) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Cache e controle de chamadas simultâneas
let loadBoardPromise: Promise<void> | null = null;
let boardCache: { board: LocalBoard; timestamp: number; userId: string } | null = null;
const CACHE_DURATION = 30000; // 30 segundos

// Função para retry com backoff exponencial
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error = new Error('Operação falhou após múltiplas tentativas');
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Se for rate limit, aguardar mais tempo
      if (lastError.message.includes('rate limit') || lastError.message.includes('429')) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`⏳ Rate limit detectado. Aguardando ${Math.round(delay)}ms antes da tentativa ${attempt + 1}/${maxRetries + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Para outros erros, não fazer retry
      throw lastError;
    }
  }
  
  throw lastError;
};

// Funções utilitárias para conversão de dados
const dbToLocalBoard = (dbBoard: DbBoard, dbColumns: DbColumn[], dbTasks: DbTask[]): LocalBoard => {
  // Organizar tarefas por coluna
  const tasksByColumn: { [columnId: string]: string[] } = {};
  const tasksMap: { [taskId: string]: LocalTask } = {};
  
  dbTasks.forEach(task => {
    if (!tasksByColumn[task.column_id]) {
      tasksByColumn[task.column_id] = [];
    }
    tasksByColumn[task.column_id].push(task.id);
    
    tasksMap[task.id] = {
      ...task,
      due_date: task.due_date ? new Date(task.due_date) : null,
      created_at: new Date(task.created_at),
      updated_at: new Date(task.updated_at),
    };
  });
  
  // Ordenar tarefas por posição
  Object.keys(tasksByColumn).forEach(columnId => {
    tasksByColumn[columnId].sort((a, b) => {
      const taskA = tasksMap[a];
      const taskB = tasksMap[b];
      return taskA.position - taskB.position;
    });
  });
  
  const columns: LocalColumn[] = dbColumns
    .sort((a, b) => a.position - b.position)
    .map(col => ({
      ...col,
      taskIds: tasksByColumn[col.id] || [],
      created_at: new Date(col.created_at),
      updated_at: new Date(col.updated_at),
    }));
  
  return {
    ...dbBoard,
    columns,
    tasks: tasksMap,
    created_at: new Date(dbBoard.created_at),
    updated_at: new Date(dbBoard.updated_at),
  };
};

// Store principal
export const useSupabaseKanbanStore = create<SupabaseKanbanStore>((set, get) => ({
  // Estado inicial
  board: null,
  modalState: {
    isOpen: false,
    type: null,
    data: null,
  },
  isLoading: false,
  error: null,

  // Carregar board do usuário com cache e prevenção de chamadas múltiplas
  loadBoard: async (userId: string) => {
    // Verificar cache válido
    if (boardCache && 
        boardCache.userId === userId && 
        Date.now() - boardCache.timestamp < CACHE_DURATION) {
      console.log('📦 Usando board do cache');
      set({ board: boardCache.board, isLoading: false, error: null });
      return;
    }

    // Se já há uma chamada em andamento para o mesmo usuário, aguardar ela
    if (loadBoardPromise) {
      console.log('⏳ Aguardando carregamento em andamento...');
      try {
        await loadBoardPromise;
        return;
      } catch (error) {
        // Se a chamada anterior falhou, continuar com uma nova
        loadBoardPromise = null;
      }
    }

    // Criar nova promise de carregamento
    loadBoardPromise = (async () => {
      set({ isLoading: true, error: null });
      
      try {
        console.log('🔄 Carregando board para usuário:', userId);
        
        const loadBoardData = async () => {
          // Verificar se há sessão ativa antes de fazer qualquer operação
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('Sessão expirada. Faça login novamente.');
          }
          
          // Buscar boards existentes do usuário
          let { data: boards, error: boardError } = await supabase
            .from('boards')
            .select('*')
            .eq('user_id', userId)
            .limit(1);
          
          if (boardError) {
            console.error('❌ Erro ao buscar boards:', boardError.message);
            if (boardError.message.includes('rate limit') || boardError.message.includes('429')) {
              throw new Error('Muitas tentativas. Aguarde um momento e tente novamente.');
            }
            if (boardError.message.includes('JWT')) {
              throw new Error('Sessão inválida. Faça login novamente.');
            }
            throw new Error(`Erro ao acessar seus dados: ${boardError.message}`);
          }
          
          let board: DbBoard;
          
          if (!boards || boards.length === 0) {
            console.log('📝 Criando novo board...');
            
            // Criar board inicial
            const { data: newBoard, error: createError } = await supabase
              .from('boards')
              .insert([{ title: 'Meu Kanban', user_id: userId }])
              .select()
              .single();
            
            if (createError) {
              console.error('❌ Erro ao criar board:', createError.message);
              if (createError.message.includes('rate limit') || createError.message.includes('429')) {
                throw new Error('Muitas tentativas. Aguarde um momento e tente novamente.');
              }
              throw new Error(`Erro ao criar seu workspace: ${createError.message}`);
            }
            
            console.log('✅ Board criado:', newBoard.id);
            board = newBoard;
            
            // Criar colunas iniciais
            const initialColumns = [
              { title: 'A Fazer', board_id: board.id, position: 0 },
              { title: 'Fazendo', board_id: board.id, position: 1 },
              { title: 'Feito', board_id: board.id, position: 2 },
            ];
            
            const { error: columnsError } = await supabase
              .from('columns')
              .insert(initialColumns);
            
            if (columnsError) {
              console.error('❌ Erro ao criar colunas:', columnsError.message);
              throw new Error(`Erro ao configurar seu workspace: ${columnsError.message}`);
            }
            
            console.log('✅ Colunas criadas');
          } else {
            console.log('✅ Board encontrado:', boards[0].id);
            board = boards[0];
          }
          
          // Carregar colunas
          const { data: columns, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('board_id', board.id)
            .order('position');
          
          if (columnsError) {
            console.error('❌ Erro ao carregar colunas:', columnsError.message);
            throw new Error(`Erro ao carregar colunas: ${columnsError.message}`);
          }
          
          // Carregar tarefas
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .in('column_id', columns?.map(col => col.id) || [])
            .order('position');
          
          if (tasksError) {
            console.error('❌ Erro ao carregar tarefas:', tasksError.message);
            throw new Error(`Erro ao carregar tarefas: ${tasksError.message}`);
          }
          
          return { board, columns: columns || [], tasks: tasks || [] };
        };

        // Executar com retry
        const { board, columns, tasks } = await retryWithBackoff(loadBoardData);
        
        // Converter e definir no estado
        const localBoard = dbToLocalBoard(board, columns, tasks);
        
        // Atualizar cache
        boardCache = {
          board: localBoard,
          timestamp: Date.now(),
          userId
        };
        
        set({ board: localBoard, isLoading: false, error: null });
        
        console.log('🎉 Board carregado com sucesso!');
        
      } catch (error) {
        console.error('💥 Erro ao carregar board:', error);
        let errorMessage = 'Erro inesperado ao carregar dados';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        set({ error: errorMessage, isLoading: false });
        // Não re-throw para evitar loops de erro
      } finally {
        loadBoardPromise = null;
      }
    })();

    await loadBoardPromise;
  },

  // Adicionar tarefa
  addTask: async (columnId, taskData) => {
    const { board } = get();
    if (!board) return;
    
    set({ isLoading: true });
    
    try {
      // Calcular posição
      const column = board.columns.find(col => col.id === columnId);
      const position = column ? column.taskIds.length : 0;
      
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          column_id: columnId,
          position,
          due_date: taskData.due_date?.toISOString() || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar estado local
      const localTask: LocalTask = {
        ...newTask,
        due_date: newTask.due_date ? new Date(newTask.due_date) : null,
        created_at: new Date(newTask.created_at),
        updated_at: new Date(newTask.updated_at),
      };
      
      const updatedColumns = board.columns.map(col =>
        col.id === columnId
          ? { ...col, taskIds: [...col.taskIds, newTask.id] }
          : col
      );
      
      set({
        board: {
          ...board,
          columns: updatedColumns,
          tasks: { ...board.tasks, [newTask.id]: localTask },
        },
        isLoading: false,
      });
      
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      set({ error: 'Erro ao adicionar tarefa', isLoading: false });
    }
  },

  // Atualizar tarefa
  updateTask: async (taskId, updates) => {
    const { board } = get();
    if (!board || !board.tasks[taskId]) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          due_date: updates.due_date?.toISOString() || null,
        })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Atualizar estado local
      const updatedTask = {
        ...board.tasks[taskId],
        ...updates,
        updated_at: new Date(),
      };
      
      set({
        board: {
          ...board,
          tasks: { ...board.tasks, [taskId]: updatedTask },
        },
      });
      
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      set({ error: 'Erro ao atualizar tarefa' });
    }
  },

  // Deletar tarefa
  deleteTask: async (taskId) => {
    const { board } = get();
    if (!board || !board.tasks[taskId]) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Atualizar estado local
      const task = board.tasks[taskId];
      const { [taskId]: deletedTask, ...remainingTasks } = board.tasks;
      
      const updatedColumns = board.columns.map(col =>
        col.id === task.column_id
          ? { ...col, taskIds: col.taskIds.filter(id => id !== taskId) }
          : col
      );
      
      set({
        board: {
          ...board,
          columns: updatedColumns,
          tasks: remainingTasks,
        },
      });
      
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      set({ error: 'Erro ao deletar tarefa' });
    }
  },

  // Mover tarefa
  moveTask: async (taskId, sourceColumnId, destinationColumnId, newPosition) => {
    const { board } = get();
    if (!board || !board.tasks[taskId]) return;
    
    try {
      // Atualizar no banco
      const { error } = await supabase
        .from('tasks')
        .update({
          column_id: destinationColumnId,
          position: newPosition,
        })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Atualizar estado local
      const updatedTask = {
        ...board.tasks[taskId],
        column_id: destinationColumnId,
        position: newPosition,
        updated_at: new Date(),
      };
      
      const updatedColumns = board.columns.map(col => {
        if (col.id === sourceColumnId) {
          return { ...col, taskIds: col.taskIds.filter(id => id !== taskId) };
        } else if (col.id === destinationColumnId) {
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(newPosition, 0, taskId);
          return { ...col, taskIds: newTaskIds };
        }
        return col;
      });
      
      set({
        board: {
          ...board,
          columns: updatedColumns,
          tasks: { ...board.tasks, [taskId]: updatedTask },
        },
      });
      
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      set({ error: 'Erro ao mover tarefa' });
    }
  },

  // Adicionar coluna
  addColumn: async (title, color = '#D6E8FF') => {
    const { board } = get();
    if (!board) return;
    
    try {
      const position = board.columns.length;
      
      const { data: newColumn, error } = await supabase
        .from('columns')
        .insert([{
          title,
          color,
          board_id: board.id,
          position,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar estado local
      const localColumn: LocalColumn = {
        ...newColumn,
        taskIds: [],
        created_at: new Date(newColumn.created_at),
        updated_at: new Date(newColumn.updated_at),
      };
      
      set({
        board: {
          ...board,
          columns: [...board.columns, localColumn],
        },
      });
      
    } catch (error) {
      console.error('Erro ao adicionar coluna:', error);
      set({ error: 'Erro ao adicionar coluna' });
    }
  },

  // Atualizar coluna
  updateColumn: async (columnId, updates) => {
    const { board } = get();
    if (!board) return;
    
    try {
      const { error } = await supabase
        .from('columns')
        .update(updates)
        .eq('id', columnId);
      
      if (error) throw error;
      
      // Atualizar estado local
      const updatedColumns = board.columns.map(col =>
        col.id === columnId
          ? { ...col, ...updates, updated_at: new Date() }
          : col
      );
      
      set({
        board: {
          ...board,
          columns: updatedColumns,
        },
      });
      
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
      set({ error: 'Erro ao atualizar coluna' });
    }
  },

  // Deletar coluna
  deleteColumn: async (columnId) => {
    const { board } = get();
    if (!board) return;
    
    try {
      // Deletar todas as tarefas da coluna primeiro
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('column_id', columnId);
      
      if (tasksError) throw tasksError;
      
      // Deletar a coluna
      const { error: columnError } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);
      
      if (columnError) throw columnError;
      
      // Atualizar estado local
      const columnToDelete = board.columns.find(col => col.id === columnId);
      if (!columnToDelete) return;
      
      const tasksToDelete = columnToDelete.taskIds;
      const remainingTasks = Object.fromEntries(
        Object.entries(board.tasks).filter(([taskId]) => !tasksToDelete.includes(taskId))
      );
      
      const updatedColumns = board.columns
        .filter(col => col.id !== columnId)
        .map((col, index) => ({ ...col, position: index }));
      
      set({
        board: {
          ...board,
          columns: updatedColumns,
          tasks: remainingTasks,
        },
      });
      
    } catch (error) {
      console.error('Erro ao deletar coluna:', error);
      set({ error: 'Erro ao deletar coluna' });
    }
  },

  // Reordenar colunas
  reorderColumns: async (columnIds) => {
    const { board } = get();
    if (!board) return;
    
    try {
      // Atualizar posições no banco
      const updates = columnIds.map((id, index) => ({
        id,
        position: index,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('columns')
          .update({ position: update.position })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      // Atualizar estado local
      const reorderedColumns = columnIds.map((id, index) => {
        const column = board.columns.find(col => col.id === id);
        return column ? { ...column, position: index } : null;
      }).filter(Boolean) as LocalColumn[];
      
      set({
        board: {
          ...board,
          columns: reorderedColumns,
        },
      });
      
    } catch (error) {
      console.error('Erro ao reordenar colunas:', error);
      set({ error: 'Erro ao reordenar colunas' });
    }
  },

  // Atualizar título do board
  updateBoardTitle: async (title) => {
    const { board } = get();
    if (!board) return;
    
    try {
      const { error } = await supabase
        .from('boards')
        .update({ title })
        .eq('id', board.id);
      
      if (error) throw error;
      
      set({
        board: {
          ...board,
          title,
          updated_at: new Date(),
        },
      });
      
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      set({ error: 'Erro ao atualizar título' });
    }
  },

  // Ações para modal
  openModal: (type, mode = 'create', data = null) => {
    set({
      modalState: {
        isOpen: true,
        type,
        mode,
        data,
      }
    });
  },

  closeModal: () => {
    set({
      modalState: {
        isOpen: false,
        type: null,
        data: null,
      }
    });
  },

  // Utilitários
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));