/**
 * Componente KanbanBoard - Board principal do Kanban
 * Gerencia drag & drop entre colunas e coordena todas as operações
 */

import React, { useState, useEffect } from 'react';
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
import { Plus, Settings, Download, LogOut, Bell, Calendar } from 'lucide-react';
import { useSupabaseKanbanStore } from '../../store/supabaseKanbanStore';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useDailyNotifications } from '../../hooks/useDailyNotifications';
import { LocalTask, LocalColumn } from '../../store/supabaseKanbanStore';
import { Button } from '../ui';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { ConfirmModal } from '../modals';

export const KanbanBoard: React.FC = () => {
  // Estado para controlar o item ativo durante o drag
  const [activeTask, setActiveTask] = useState<LocalTask | null>(null);
  
  // Estado para controlar o modal de confirmação de saída
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Contexto de autenticação
  const { signOut } = useAuth();
  
  // Hook de notificações PWA
  const {
    permission,
    isSupported,
    requestPermission,
    notifyTaskMoved,
    notifyTaskCompleted
  } = useNotifications();
  
  // Hook de notificações diárias
  const { forceCheckDailyTasks } = useDailyNotifications(true);
  
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

  // Detectar se é dispositivo móvel
  const isMobile = window.innerWidth <= 768;

  // Solicitar permissão para notificações ao carregar
  useEffect(() => {
    if (isSupported && permission === 'default') {
      // Aguardar um pouco antes de solicitar permissão
      const timer = setTimeout(() => {
        requestPermission();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, requestPermission]);

  // Sensores para drag & drop otimizados para mobile
  const sensors = useSensors(
    // Sensor de ponteiro para desktop
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 5 : 8, // Menor distância no mobile
        tolerance: isMobile ? 8 : 5, // Maior tolerância no mobile
        delay: isMobile ? 0 : 100, // Sem delay no mobile
      },
    }),
    // Sensor de toque otimizado para mobile
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: isMobile ? 150 : 250, // Delay menor no mobile
        tolerance: isMobile ? 10 : 5, // Maior tolerância no mobile
      },
    }),
    // Sensor de teclado para acessibilidade
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
      
      // Notificar movimento de tarefa
      if (permission === 'granted') {
        notifyTaskMoved(activeTask.title, activeColumn.title, overColumn.title);
      }
      
      // Verificar se a tarefa foi movida para uma coluna de "concluído"
      if (overColumn.title.toLowerCase().includes('concluí') || 
          overColumn.title.toLowerCase().includes('feito') ||
          overColumn.title.toLowerCase().includes('done')) {
        if (permission === 'granted') {
          notifyTaskCompleted(activeTask.title);
        }
      }
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
  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  // Confirmar logout
  const confirmSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      setShowSignOutModal(false);
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      alert('Erro ao fazer logout. Tente novamente.');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Cancelar logout
  const cancelSignOut = () => {
    setShowSignOutModal(false);
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
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
              {board?.title || 'Kanban Board'}
            </h1>
            <p className="text-gray-600 text-xs md:text-sm">
              {board?.columns.length || 0} colunas • {board ? Object.keys(board.tasks).length : 0} tarefas
            </p>
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Botão de notificações */}
            {isSupported && permission !== 'granted' && (
              <Button
                variant="ghost"
                icon={Bell}
                onClick={requestPermission}
                aria-label="Ativar notificações"
                className="text-orange-600 hover:text-orange-700"
              >
                Notificações
              </Button>
            )}
            
            {/* Botão de teste das notificações diárias */}
            {isSupported && permission === 'granted' && (
              <Button
                variant="ghost"
                icon={Calendar}
                onClick={forceCheckDailyTasks}
                aria-label="Verificar tarefas do dia"
                className="text-blue-600 hover:text-blue-700"
              >
                Verificar Tarefas
              </Button>
            )}
            
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

          {/* Mobile buttons - apenas ícones */}
          <div className="flex md:hidden items-center gap-1">
            {/* Botão de notificações mobile */}
            {isSupported && permission !== 'granted' && (
              <Button
                variant="ghost"
                icon={Bell}
                onClick={requestPermission}
                aria-label="Ativar notificações"
                className="p-2 text-orange-600 hover:text-orange-700"
              />
            )}
            
            {/* Botão de teste das notificações diárias mobile */}
            {isSupported && permission === 'granted' && (
              <Button
                variant="ghost"
                icon={Calendar}
                onClick={forceCheckDailyTasks}
                aria-label="Verificar tarefas do dia"
                className="p-2 text-blue-600 hover:text-blue-700"
              />
            )}
            
            <Button
              variant="ghost"
              icon={Plus}
              onClick={handleAddColumn}
              aria-label="Nova Coluna"
              className="p-2"
            />
            
            <Button
              variant="ghost"
              icon={Settings}
              onClick={() => openModal('settings', 'edit')}
              aria-label="Configurações"
              className="p-2"
            />
            
            <Button
              variant="ghost"
              icon={LogOut}
              onClick={handleSignOut}
              aria-label="Sair"
              className="p-2"
            />
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 p-2 md:p-6 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full overflow-x-auto overflow-y-hidden kanban-board">
            {/* Container com padding otimizado para mobile */}
            <div className="flex gap-3 md:gap-6 h-full min-w-max pb-4 md:pb-6 px-1 md:px-0">
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
                  className="flex items-center justify-center w-72 md:w-80 h-80 md:h-96"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-center px-4">
                    <div className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto">
                      <Plus size={isMobile ? 24 : 32} className="text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                      Comece criando uma coluna
                    </h3>
                    <p className="text-white/80 mb-4 text-sm md:text-base">
                      Organize suas tarefas em colunas personalizadas
                    </p>
                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={handleAddColumn}
                      className="text-sm md:text-base"
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

      {/* Modal de confirmação de saída */}
      <ConfirmModal
        isOpen={showSignOutModal}
        onClose={cancelSignOut}
        onConfirm={confirmSignOut}
        title="Confirmar Saída"
        message="Tem certeza que deseja sair da aplicação? Você precisará fazer login novamente."
        confirmText="Sair"
        cancelText="Cancelar"
        variant="warning"
        loading={isSigningOut}
      />
    </div>
  );
};

export default KanbanBoard;