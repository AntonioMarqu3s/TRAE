/**
 * Componente KanbanBoard - Board principal do Kanban
 * Gerencia drag & drop entre colunas e coordena todas as operações
 */

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Plus, Settings, Download, LogOut } from 'lucide-react';
import { useSupabaseKanbanStore } from '../../store/supabaseKanbanStore';
import { useAuth } from '../../contexts/AuthContext';
import { LocalTask, LocalColumn } from '../../store/supabaseKanbanStore';
import { Button } from '../ui';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

export const KanbanBoard: React.FC = () => {
  // Estado para controlar o item ativo durante o drag
  const [activeTask, setActiveTask] = useState<LocalTask | null>(null);
  
  // Contexto de autenticação
  const { signOut } = useAuth();
  
  // Estado global do Kanban com Supabase
  const {
    board,
    isLoading,
    error,
    deleteTask,
    moveTask,
    deleteColumn,
    reorderColumns,
    openModal,
  } = useSupabaseKanbanStore();

  // Sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Reduzido para 8px para ativar mais facilmente
        tolerance: 5, // Tolerância para movimento
        delay: 100, // Pequeno delay para evitar conflitos
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler para início do drag
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    // Verificar se é uma tarefa sendo arrastada
    const task = board ? Object.values(board.tasks).find(task => task.id === activeId) : null;
    
    if (task) {
      setActiveTask(task);
      console.log('Drag started - Task:', task.title);
    } else {
      setActiveTask(null);
      console.log('Drag started - Column:', activeId);
    }
  };

  // Handler para drag over (apenas feedback visual, sem atualizar estado)
  const handleDragOver = (event: DragOverEvent) => {
    // Este handler pode ser usado para feedback visual durante o drag
    // Não devemos atualizar o estado aqui para evitar loops infinitos
    console.log('Dragging over:', event.over?.id);
  };

  // Handler para fim do drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Limpar o estado da tarefa ativa
    setActiveTask(null);
    
    if (!over || !board) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Verificar se é reordenação de colunas
    const activeColumnIndex = board.columns.findIndex(col => col.id === activeId);
    const overColumnIndex = board.columns.findIndex(col => col.id === overId);

    if (activeColumnIndex !== -1 && overColumnIndex !== -1 && activeColumnIndex !== overColumnIndex) {
      const newColumns = arrayMove(board.columns, activeColumnIndex, overColumnIndex);
      reorderColumns(newColumns.map(col => col.id));
      return;
    }

    // Verificar se é uma tarefa sendo movida
    const activeTask = Object.values(board.tasks).find(task => task.id === activeId);

    if (!activeTask) return;

    // Encontrar colunas de origem e destino
    const activeColumn = board.columns.find(col => 
      col.taskIds.includes(activeId)
    );

    // Determinar coluna de destino
    let overColumn = board.columns.find(col => col.id === overId);
    if (!overColumn) {
      // Se overId é uma tarefa, encontrar a coluna que contém essa tarefa
      const overTask = Object.values(board.tasks).find(task => task.id === overId);
      if (overTask) {
        overColumn = board.columns.find(col => col.taskIds.includes(overId));
      }
    }

    if (!activeColumn || !overColumn) return;

    // Se movendo para uma coluna diferente
    if (activeColumn.id !== overColumn.id) {
      // Determinar a posição na coluna de destino
      let newIndex = 0;
      if (overId !== overColumn.id) {
        // Se dropping sobre uma tarefa, inserir após ela
        const overTaskIndex = overColumn.taskIds.findIndex(taskId => taskId === overId);
        newIndex = overTaskIndex !== -1 ? overTaskIndex + 1 : overColumn.taskIds.length;
      }
      
      moveTask(activeId, activeColumn.id, overColumn.id, newIndex);
    } else {
      // Reordenação de tarefas na mesma coluna
      const activeIndex = activeColumn.taskIds.findIndex(taskId => taskId === activeId);
      const overIndex = activeColumn.taskIds.findIndex(taskId => taskId === overId);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        // Usar a função moveTask para reordenar na mesma coluna
        moveTask(activeId, activeColumn.id, activeColumn.id, overIndex);
      }
    }
  };

  // Handlers para ações
  const handleAddTask = (columnId: string) => {
    openModal('task', 'create', { columnId });
  };

  const handleEditTask = (task: LocalTask) => {
    openModal('task', 'edit', { task });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await deleteTask(taskId);
    }
  };

  const handleAddColumn = () => {
    openModal('column', 'create');
  };

  const handleEditColumn = (column: LocalColumn) => {
    openModal('column', 'edit', { column });
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!board) return;
    
    const column = board.columns.find(col => col.id === columnId);
    const taskCount = column?.taskIds.length || 0;
    
    const message = taskCount > 0 
      ? `Esta coluna contém ${taskCount} tarefa(s). Tem certeza que deseja excluí-la?`
      : 'Tem certeza que deseja excluir esta coluna?';
    
    if (window.confirm(message)) {
      await deleteColumn(columnId);
    }
  };

  // Exportar dados do board
  const handleExportBoard = () => {
    const dataStr = JSON.stringify(board, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handler para logout
  const handleSignOut = async () => {
    try {
      const confirmed = window.confirm('Tem certeza que deseja sair?');
      
      if (confirmed) {
        await signOut();
      }
    } catch (error) {
      console.error('❌ Erro no handleSignOut:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    }
  };

  // IDs das colunas para o SortableContext
  const columnIds = board?.columns.map(column => column.id) || [];

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Erro ao carregar dados</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-start"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-primary-start to-primary-end overflow-hidden dnd-context">
      {/* Header */}
      <header className="glass-effect border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {board?.title || 'Kanban Board'}
            </h1>
            <p className="text-gray-600 text-sm">
              {board?.columns.length || 0} colunas • {board ? Object.keys(board.tasks).length : 0} tarefas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              icon={Download}
              onClick={handleExportBoard}
              aria-label="Exportar board"
            >
              Exportar
            </Button>
            
            <Button
              variant="ghost"
              icon={Settings}
              onClick={() => openModal('settings', 'edit')}
              aria-label="Configurações"
            >
              Configurações
            </Button>
            
            <Button
              variant="ghost"
              icon={LogOut}
              onClick={handleSignOut}
              aria-label="Sair"
            >
              Sair
            </Button>
            
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleAddColumn}
            >
              Nova Coluna
            </Button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 p-6 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full overflow-x-auto overflow-y-hidden">
            <div className="flex gap-6 h-full min-w-max pb-6">
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {board?.columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={column.taskIds.map(taskId => board.tasks[taskId]).filter(Boolean)}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onEditColumn={handleEditColumn}
                    onDeleteColumn={handleDeleteColumn}
                  />
                ))}
              </SortableContext>

              {/* Placeholder para adicionar primeira coluna */}
              {board?.columns.length === 0 && (
                <motion.div
                  className="flex items-center justify-center w-80 h-96"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto">
                      <Plus size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Comece criando uma coluna
                    </h3>
                    <p className="text-white/80 mb-4">
                      Organize suas tarefas em colunas personalizadas
                    </p>
                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={handleAddColumn}
                    >
                      Criar primeira coluna
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* DragOverlay para feedback visual durante o drag */}
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 scale-105 opacity-90">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}} // Handlers vazios pois é apenas visual
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
};

export default KanbanBoard;