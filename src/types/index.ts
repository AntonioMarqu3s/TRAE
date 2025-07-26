/**
 * Tipos fundamentais para o aplicativo Kanban
 * Define as interfaces principais para tarefas, colunas e board
 */

// Interface para uma tarefa individual
export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryColor: string;
  columnId: string;
  assignee?: string;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface para uma coluna do Kanban
export interface Column {
  id: string;
  title: string;
  color: string;
  taskIds: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para o board completo
export interface Board {
  id: string;
  title: string;
  columns: Column[];
  tasks: Record<string, Task>;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para cores predefinidas
export type PastelColor = 
  | '#FFD6E0' // Rosa
  | '#D6E8FF' // Azul
  | '#C1FBA4' // Verde
  | '#FFF4B7' // Amarelo
  | '#E8D6FF' // Roxo
  | '#FFE4B7' // Laranja
  | '#B7F4E8' // Teal
  | '#E8E8E8'; // Cinza

// Interface para modal state
export interface ModalState {
  isOpen: boolean;
  type: 'task' | 'column' | 'settings' | null;
  mode?: 'create' | 'edit';
  data?: any;
}

// Tipos para drag and drop
export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current: {
        type: 'task' | 'column';
        task?: Task;
        column?: Column;
      };
    };
  };
  over: {
    id: string;
    data: {
      current: {
        type: 'task' | 'column' | 'droppable';
        accepts?: string[];
      };
    };
  } | null;
}

// Interface para formulário de tarefa
export interface TaskFormData {
  title: string;
  description: string;
  categoryColor: PastelColor;
  assignee: string;
  dueDate?: Date;
  tags: string[];
}

// Interface para formulário de coluna
export interface ColumnFormData {
  title: string;
  color: PastelColor;
}

// Tipos para ações do store
export type StoreAction = 
  | { type: 'ADD_TASK'; payload: { columnId: string; task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> } }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { taskId: string } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; sourceColumnId: string; destinationColumnId: string; newIndex: number } }
  | { type: 'ADD_COLUMN'; payload: { column: Omit<Column, 'id' | 'createdAt' | 'updatedAt'> } }
  | { type: 'UPDATE_COLUMN'; payload: { columnId: string; updates: Partial<Column> } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: string } }
  | { type: 'REORDER_COLUMNS'; payload: { columnIds: string[] } }
  | { type: 'LOAD_BOARD'; payload: { board: Board } }
  | { type: 'RESET_BOARD' };

// Interface para configurações do app
export interface AppSettings {
  theme: 'light' | 'dark';
  defaultColors: PastelColor[];
  autoSave: boolean;
}