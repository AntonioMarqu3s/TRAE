/**
 * Store principal do aplicativo usando Zustand
 * Gerencia o estado global do board, tarefas e colunas
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Board, Task, Column, ModalState } from '../types';

// Interface do store
interface KanbanStore {
  // Estado
  board: Board | null;
  modalState: ModalState;
  isLoading: boolean;
  
  // Ações para tarefas
  addTask: (columnId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'columnId'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string, newIndex?: number) => void;
  
  // Ações para colunas
  addColumn: (columnData: Omit<Column, 'id' | 'createdAt' | 'updatedAt' | 'taskIds' | 'position'>) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (columnId: string) => void;
  reorderColumns: (columnIds: string[]) => void;
  
  // Ações para modal
  openModal: (type: ModalState['type'], mode?: ModalState['mode'], data?: any) => void;
  closeModal: () => void;
  
  // Ações gerais
  initializeBoard: () => void;
  resetBoard: () => void;
  loadBoard: (board: Board) => void;
  updateBoardTitle: (title: string) => void;
}

// Função para gerar ID único
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Função para criar board inicial
const createInitialBoard = (): Board => {
  const now = new Date();
  
  const columns: Column[] = [
    {
      id: generateId(),
      title: 'A Fazer',
      color: '#FFD6E0', // Rosa pastel
      taskIds: [],
      position: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Fazendo',
      color: '#FFF4B7', // Amarelo pastel
      taskIds: [],
      position: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Feito',
      color: '#C1FBA4', // Verde pastel
      taskIds: [],
      position: 2,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    id: generateId(),
    title: 'Meu Kanban',
    columns,
    tasks: {},
    createdAt: now,
    updatedAt: now,
  };
};

// Store principal
export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      board: null,
      modalState: {
        isOpen: false,
        type: null,
        data: null,
      },
      isLoading: false,

      // Ações para tarefas
      addTask: (columnId, taskData) => {
        const { board } = get();
        if (!board) return;

        const taskId = generateId();
        const now = new Date();
        
        const newTask: Task = {
          ...taskData,
          id: taskId,
          columnId,
          createdAt: now,
          updatedAt: now,
        };

        const updatedColumns = board.columns.map(column => 
          column.id === columnId 
            ? { ...column, taskIds: [...column.taskIds, taskId], updatedAt: now }
            : column
        );

        set({
          board: {
            ...board,
            columns: updatedColumns,
            tasks: { ...board.tasks, [taskId]: newTask },
            updatedAt: now,
          }
        });
      },

      updateTask: (taskId, updates) => {
        const { board } = get();
        if (!board || !board.tasks[taskId]) return;

        const now = new Date();
        const updatedTask = { 
          ...board.tasks[taskId], 
          ...updates, 
          updatedAt: now 
        };

        set({
          board: {
            ...board,
            tasks: { ...board.tasks, [taskId]: updatedTask },
            updatedAt: now,
          }
        });
      },

      deleteTask: (taskId) => {
        const { board } = get();
        if (!board || !board.tasks[taskId]) return;

        const task = board.tasks[taskId];
        const now = new Date();
        
        // Remove task from tasks object
        const { [taskId]: deletedTask, ...remainingTasks } = board.tasks;
        
        // Remove task ID from column
        const updatedColumns = board.columns.map(column => 
          column.id === task.columnId
            ? { 
                ...column, 
                taskIds: column.taskIds.filter(id => id !== taskId),
                updatedAt: now 
              }
            : column
        );

        set({
          board: {
            ...board,
            columns: updatedColumns,
            tasks: remainingTasks,
            updatedAt: now,
          }
        });
      },

      moveTask: (taskId, sourceColumnId, destinationColumnId, newIndex = 0) => {
        const { board } = get();
        if (!board || !board.tasks[taskId]) return;

        const now = new Date();
        
        // Update task's columnId
        const updatedTask = { 
          ...board.tasks[taskId], 
          columnId: destinationColumnId,
          updatedAt: now 
        };

        // Update columns
        const updatedColumns = board.columns.map(column => {
          if (column.id === sourceColumnId) {
            // Remove from source column
            return {
              ...column,
              taskIds: column.taskIds.filter(id => id !== taskId),
              updatedAt: now,
            };
          } else if (column.id === destinationColumnId) {
            // Add to destination column
            const newTaskIds = [...column.taskIds];
            newTaskIds.splice(newIndex, 0, taskId);
            return {
              ...column,
              taskIds: newTaskIds,
              updatedAt: now,
            };
          }
          return column;
        });

        set({
          board: {
            ...board,
            columns: updatedColumns,
            tasks: { ...board.tasks, [taskId]: updatedTask },
            updatedAt: now,
          }
        });
      },

      // Ações para colunas
      addColumn: (columnData) => {
        const { board } = get();
        if (!board) return;

        const columnId = generateId();
        const now = new Date();
        
        const newColumn: Column = {
          ...columnData,
          id: columnId,
          taskIds: [],
          position: board.columns.length,
          createdAt: now,
          updatedAt: now,
        };

        set({
          board: {
            ...board,
            columns: [...board.columns, newColumn],
            updatedAt: now,
          }
        });
      },

      updateColumn: (columnId, updates) => {
        const { board } = get();
        if (!board) return;

        const now = new Date();
        const updatedColumns = board.columns.map(column =>
          column.id === columnId 
            ? { ...column, ...updates, updatedAt: now }
            : column
        );

        set({
          board: {
            ...board,
            columns: updatedColumns,
            updatedAt: now,
          }
        });
      },

      deleteColumn: (columnId) => {
        const { board } = get();
        if (!board) return;

        const columnToDelete = board.columns.find(col => col.id === columnId);
        if (!columnToDelete) return;

        const now = new Date();
        
        // Remove all tasks from this column
        const tasksToDelete = columnToDelete.taskIds;
        const remainingTasks = Object.fromEntries(
          Object.entries(board.tasks).filter(([taskId]) => !tasksToDelete.includes(taskId))
        );

        // Remove column
        const updatedColumns = board.columns
          .filter(column => column.id !== columnId)
          .map((column, index) => ({ ...column, position: index, updatedAt: now }));

        set({
          board: {
            ...board,
            columns: updatedColumns,
            tasks: remainingTasks,
            updatedAt: now,
          }
        });
      },

      reorderColumns: (columnIds) => {
        const { board } = get();
        if (!board) return;

        const now = new Date();
        const reorderedColumns = columnIds.map((id, index) => {
          const column = board.columns.find(col => col.id === id);
          return column ? { ...column, position: index, updatedAt: now } : null;
        }).filter(Boolean) as Column[];

        set({
          board: {
            ...board,
            columns: reorderedColumns,
            updatedAt: now,
          }
        });
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

      // Ações gerais
      initializeBoard: () => {
        const { board } = get();
        if (!board) {
          set({ board: createInitialBoard() });
        }
      },

      resetBoard: () => {
        set({ board: createInitialBoard() });
      },

      loadBoard: (board) => {
        set({ board });
      },

      updateBoardTitle: (title) => {
        const { board } = get();
        if (!board) return;

        const now = new Date();
        set({
          board: {
            ...board,
            title,
            updatedAt: now,
          }
        });
      },
    }),
    {
      name: 'kanban-storage', // Nome da chave no localStorage
      partialize: (state) => ({ board: state.board }), // Apenas persiste o board
      // Storage customizado para lidar com serialização de datas
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          try {
            const parsed = JSON.parse(str);
            
            // Converter strings de data de volta para objetos Date
            if (parsed.state?.board) {
              const board = parsed.state.board;
              
              // Converter datas do board
              if (board.createdAt) {
                board.createdAt = new Date(board.createdAt);
              }
              if (board.updatedAt) {
                board.updatedAt = new Date(board.updatedAt);
              }
              
              // Converter datas das colunas
              if (board.columns) {
                board.columns = board.columns.map((column: any) => ({
                  ...column,
                  createdAt: column.createdAt ? new Date(column.createdAt) : new Date(),
                  updatedAt: column.updatedAt ? new Date(column.updatedAt) : new Date(),
                }));
              }
              
              // Converter datas das tarefas
              if (board.tasks) {
                const convertedTasks: Record<string, Task> = {};
                Object.entries(board.tasks).forEach(([taskId, task]: [string, any]) => {
                  convertedTasks[taskId] = {
                    ...task,
                    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
                    updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
                    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                  };
                });
                board.tasks = convertedTasks;
              }
            }
            
            return parsed;
          } catch (error) {
            console.error('Erro ao deserializar dados do localStorage:', error);
            return null;
          }
        },
        setItem: (name: string, value: any) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Erro ao serializar dados para o localStorage:', error);
          }
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);