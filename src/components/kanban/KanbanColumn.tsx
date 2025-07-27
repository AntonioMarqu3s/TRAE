/**
 * Componente KanbanColumn - Representa uma coluna do board Kanban
 * Suporta drag & drop de tarefas, edição e personalização
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { LocalColumn, LocalTask } from '../../store/supabaseKanbanStore';
import { Card, Button } from '../ui';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: LocalColumn;
  tasks: LocalTask[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: LocalTask) => void;
  onDeleteTask: (taskId: string) => void;
  onEditColumn: (column: LocalColumn) => void;
  onDeleteColumn: (columnId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
}) => {
  // Hook do dnd-kit para drop zone
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // IDs das tarefas para o SortableContext
  const taskIds = tasks.map(task => task.id);

  // Detecta se é mobile
  const isMobile = window.innerWidth < 768;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-shrink-0 w-72 md:w-80 pt-2 md:pt-4"
    >
      <Card
        variant="column"
        className={`h-full flex flex-col transition-all duration-200 ${
          isOver ? 'ring-2 ring-primary-start/50 bg-primary-start/5' : ''
        } ${isMobile ? 'kanban-column-mobile' : ''}`}
      >
        {/* Header da coluna */}
        <div className="p-3 md:p-4 border-b border-white/20 flex-shrink-0">
          {/* Título perfeitamente centralizado */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
            {/* Indicador de cor da coluna */}
            <div
              className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: column.color }}
            />
            
            {/* Título e contador centralizados */}
            <div className="text-center flex-1">
              <h2 className="font-semibold text-gray-800 text-base md:text-lg">
                {column.title}
              </h2>
              <span className="text-xs md:text-sm text-gray-500">
                {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
              </span>
            </div>

            {/* Espaçador invisível para balancear o indicador de cor */}
            <div className="w-2.5 md:w-3 h-2.5 md:h-3 flex-shrink-0 opacity-0"></div>
          </div>

          {/* Botões de ação centralizados */}
          <div className="flex items-center justify-center gap-1 md:gap-2">
            <Button
              variant="icon"
              icon={Plus}
              onClick={() => onAddTask(column.id)}
              className="text-gray-600 hover:text-primary-start p-1.5 md:p-2"
              aria-label="Adicionar tarefa"
            />
            
            <Button
              variant="icon"
              icon={Edit3}
              onClick={() => onEditColumn(column)}
              className="text-gray-600 hover:text-primary-start p-1.5 md:p-2"
              aria-label="Editar coluna"
            />
            
            <Button
              variant="icon"
              icon={Trash2}
              onClick={() => onDeleteColumn(column.id)}
              className="text-gray-600 hover:text-red-500 p-1.5 md:p-2"
              aria-label="Excluir coluna"
            />
          </div>
        </div>

        {/* Área de drop das tarefas com scroll otimizado para mobile */}
        <div
          ref={setNodeRef}
          className={`flex-1 p-2 md:p-4 overflow-y-auto space-y-2 md:space-y-3 ${
            isMobile 
              ? 'kanban-tasks-area' 
              : 'min-h-[200px]'
          }`}
          style={{
            // Garantir scroll suave no mobile
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </SortableContext>

          {/* Placeholder quando não há tarefas */}
          {tasks.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-8 md:py-12 text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 md:w-16 h-12 md:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2 md:mb-3">
                <Plus size={isMobile ? 20 : 24} />
              </div>
              <p className="text-xs md:text-sm text-center px-2">
                Nenhuma tarefa ainda.
                <br />
                Clique no + para adicionar.
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer com botão de adicionar tarefa */}
        <div className="p-2 md:p-4 border-t border-white/20 flex-shrink-0">
          <Button
            variant="ghost"
            icon={Plus}
            onClick={() => onAddTask(column.id)}
            className="w-full justify-center text-gray-600 hover:text-primary-start hover:bg-primary-start/10 text-xs md:text-sm py-2"
          >
            Adicionar tarefa
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default KanbanColumn;