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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-shrink-0 w-80 pt-4"
    >
      <Card
        variant="column"
        className={`h-full flex flex-col transition-all duration-200 ${
          isOver ? 'ring-2 ring-primary-start/50 bg-primary-start/5' : ''
        }`}
      >
        {/* Header da coluna */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            {/* Indicador de cor da coluna */}
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            
            {/* Título e contador */}
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">
                {column.title}
              </h2>
              <span className="text-sm text-gray-500">
                {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
              </span>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-1">
            <Button
              variant="icon"
              icon={Plus}
              onClick={() => onAddTask(column.id)}
              className="text-gray-600 hover:text-primary-start"
              aria-label="Adicionar tarefa"
            />
            
            <Button
              variant="icon"
              icon={Edit3}
              onClick={() => onEditColumn(column)}
              className="text-gray-600 hover:text-primary-start"
              aria-label="Editar coluna"
            />
            
            <Button
              variant="icon"
              icon={Trash2}
              onClick={() => onDeleteColumn(column.id)}
              className="text-gray-600 hover:text-red-500"
              aria-label="Excluir coluna"
            />
          </div>
        </div>

        {/* Área de drop das tarefas */}
        <div
          ref={setNodeRef}
          className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[200px]"
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
              className="flex flex-col items-center justify-center py-12 text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Plus size={24} />
              </div>
              <p className="text-sm text-center">
                Nenhuma tarefa ainda.
                <br />
                Clique no + para adicionar.
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer com botão de adicionar tarefa */}
        <div className="p-4 border-t border-white/20">
          <Button
            variant="ghost"
            icon={Plus}
            onClick={() => onAddTask(column.id)}
            className="w-full justify-center text-gray-600 hover:text-primary-start hover:bg-primary-start/10"
          >
            Adicionar tarefa
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default KanbanColumn;