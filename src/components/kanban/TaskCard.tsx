/**
 * Componente TaskCard - Representa uma tarefa individual no Kanban
 * Suporta drag & drop, edição e personalização de cores
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit3, Trash2, Calendar } from 'lucide-react';
import { LocalTask } from '../../store/supabaseKanbanStore';
import { Card, Button } from '../ui';

interface TaskCardProps {
  task: LocalTask;
  onEdit: (task: LocalTask) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
}) => {
  // Hook do dnd-kit para drag & drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  // Estilos de transformação para drag & drop
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Detecta se é mobile
  const isMobile = window.innerWidth < 768;

  // Formatação da data de criação
  const formatDate = (date: Date | string) => {
    // Garantir que temos um objeto Date válido
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: isMobile ? '2-digit' : 'numeric', // Ano abreviado no mobile
    }).format(dateObj);
  };

  // Formatação da data de vencimento
  const formatDueDate = (date: Date | string) => {
    // Garantir que temos um objeto Date válido
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return { text: 'Data inválida', color: 'text-red-500' };
    }
    
    const now = new Date();
    const diffTime = dateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d atrás`, color: 'text-red-500' };
    } else if (diffDays === 0) {
      return { text: 'Hoje', color: 'text-orange-500' };
    } else if (diffDays === 1) {
      return { text: 'Amanhã', color: 'text-yellow-500' };
    } else {
      return { text: `${diffDays}d`, color: 'text-green-500' };
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`draggable transition-opacity duration-200 ${
        isDragging ? 'opacity-30 dragging' : 'opacity-100'
      }`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: isMobile ? 1 : 1.02 }}
      whileDrag={{ scale: 1.05, rotate: 2 }}
    >
      <Card
        variant="task"
        className="group relative"
      >
        {/* Botões de ação - sempre visíveis no mobile, hover no desktop */}
        <div className={`absolute top-1.5 md:top-2 right-1.5 md:right-2 transition-opacity duration-200 flex gap-0.5 md:gap-1 z-10 ${
          isDragging ? 'opacity-0 pointer-events-none' : 
          isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <Button
            variant="icon"
            size="sm"
            icon={Edit3}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-xs bg-white/80 hover:bg-white`}
            aria-label="Editar tarefa"
          />
          <Button
            variant="icon"
            size="sm"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-xs bg-white/80 hover:bg-red-50 text-red-600`}
            aria-label="Excluir tarefa"
          />
        </div>

        {/* Conteúdo da tarefa */}
        <div className="space-y-2 md:space-y-3">
          {/* Indicador de cor da categoria */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <div
              className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: task.category_color }}
            />
            {/* Título */}
            <h3 className="font-semibold text-gray-800 text-xs md:text-sm leading-tight flex-1 pr-12 md:pr-16">
              {task.title}
            </h3>
          </div>

          {/* Descrição */}
          {task.description && (
            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 md:line-clamp-3 pr-2">
              {task.description}
            </p>
          )}

          {/* Informações adicionais */}
          <div className="flex items-center justify-between text-xs text-gray-500 gap-2">
            {/* Data de vencimento */}
            {task.due_date && (
              <div className={`flex items-center gap-1 ${formatDueDate(task.due_date).color} flex-shrink-0`}>
                <Calendar size={isMobile ? 10 : 12} />
                <span className="text-xs">{formatDueDate(task.due_date).text}</span>
              </div>
            )}

            {/* Prioridade */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`px-1.5 md:px-2 py-0.5 md:py-1 text-xs rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {isMobile ? 
                  (task.priority === 'high' ? 'A' : task.priority === 'medium' ? 'M' : 'B') :
                  (task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa')
                }
              </span>
            </div>

            {/* Data de criação */}
            <div className="flex items-center gap-1 ml-auto flex-shrink-0">
              <span className="text-xs">{formatDate(task.created_at)}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TaskCard;