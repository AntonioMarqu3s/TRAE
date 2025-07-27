/**
 * Modal para criação e edição de tarefas
 * Inclui formulário completo com validação
 */

import React, { useState, useEffect } from 'react';
import { Calendar, User, Tag, Palette, AlertTriangle } from 'lucide-react';
import { useSupabaseKanbanStore } from '../../store/supabaseKanbanStore';
import { LocalTask } from '../../store/supabaseKanbanStore';
import { useNotifications } from '../../hooks/useNotifications';
import { Modal, Button, Input, Textarea } from '../ui';

// Cores pastel disponíveis para tarefas
const TASK_COLORS: { name: string; value: string; hex: string }[] = [
  { name: 'Rosa', value: '#FFD6E0', hex: '#FFD6E0' },
  { name: 'Azul', value: '#D6E8FF', hex: '#D6E8FF' },
  { name: 'Verde', value: '#C1FBA4', hex: '#C1FBA4' },
  { name: 'Amarelo', value: '#FFF4B7', hex: '#FFF4B7' },
  { name: 'Roxo', value: '#E8D6FF', hex: '#E8D6FF' },
  { name: 'Laranja', value: '#FFE4B7', hex: '#FFE4B7' },
  { name: 'Cinza', value: '#E8E8E8', hex: '#E8E8E8' },
];

export const TaskModal: React.FC = () => {
  // Estado global
  const {
    modalState,
    closeModal,
    addTask,
    updateTask,
    board,
  } = useSupabaseKanbanStore();

  // Hook de notificações
  const { permission, notifyNewTask } = useNotifications();

  // Estado local do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_color: '#D6E8FF',
    tags: [] as string[],
    assignee: '',
    due_date: undefined as Date | undefined,
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  // Verificar se o modal está aberto
  const isOpen = modalState.isOpen && modalState.type === 'task';
  const isEditing = modalState.mode === 'edit';
  const task = modalState.data?.task as LocalTask | undefined;

  // Resetar formulário quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (isEditing && task) {
        setFormData({
          title: task.title,
          description: task.description || '',
          category_color: task.category_color || '#D6E8FF',
          tags: task.tags || [],
          assignee: task.assignee || '',
          due_date: task.due_date ? new Date(task.due_date) : undefined,
          priority: task.priority || 'medium',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          category_color: '#D6E8FF',
          tags: [],
          assignee: '',
          due_date: undefined,
          priority: 'medium',
        });
      }
      setTagInput('');
      setErrors({});
    }
  }, [isOpen, isEditing, task]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Título deve ter no máximo 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar campo do formulário
  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Adicionar tag
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      updateField('tags', [...formData.tags, tag]);
      setTagInput('');
    }
  };

  // Remover tag
  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Submeter formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      category_color: formData.category_color,
      tags: formData.tags.length > 0 ? formData.tags : [],
      assignee: formData.assignee?.trim() || '',
      due_date: formData.due_date || null,
      priority: formData.priority,
    };

    if (isEditing && task) {
      updateTask(task.id, taskData);
    } else {
      const columnId = modalState.data?.columnId || '';
      addTask(columnId, taskData);
      
      // Notificar criação de nova tarefa
      if (permission === 'granted' && board) {
        const column = board.columns.find(col => col.id === columnId);
        if (column) {
          notifyNewTask(taskData.title, column.title);
        }
      }
    }

    closeModal();
  };

  // Formatação de data para input
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Título */}
        <Input
          label="Título *"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Digite o título da tarefa"
          error={errors.title}
          maxLength={100}
        />

        {/* Descrição */}
        <Textarea
          label="Descrição"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Descreva a tarefa (opcional)"
          error={errors.description}
          rows={2}
          maxLength={500}
        />

        {/* Cor */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
            <Palette className="inline w-3 h-3 md:w-4 md:h-4 mr-1" />
            Cor da tarefa
          </label>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {TASK_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-all ${
                  formData.category_color === color.value
                    ? 'border-gray-400 scale-110'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color.hex }}
                onClick={() => updateField('category_color', color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            <Tag className="inline w-3 h-3 md:w-4 md:h-4 mr-1" />
            Tags (máximo 5)
          </label>
          
          {/* Tags existentes */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 md:px-3 py-1 text-xs md:text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 md:ml-2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input para nova tag */}
          {formData.tags.length < 5 && (
            <div className="flex gap-1 md:gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Digite uma tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="text-xs md:text-sm px-2 md:px-4"
              >
                Adicionar
              </Button>
            </div>
          )}
        </div>

        {/* Responsável */}
        <Input
          label="Responsável"
          icon={User}
          value={formData.assignee}
          onChange={(e) => updateField('assignee', e.target.value)}
          placeholder="Nome do responsável (opcional)"
        />

        {/* Data de vencimento */}
        <Input
          label="Data de vencimento"
          icon={Calendar}
          type="date"
          value={formatDateForInput(formData.due_date)}
          onChange={(e) => updateField('due_date', e.target.value ? new Date(e.target.value) : undefined)}
        />

        {/* Prioridade */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 md:mb-3">
            <AlertTriangle className="inline w-3 h-3 md:w-4 md:h-4 mr-1" />
            Prioridade
          </label>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { value: 'low', label: 'Baixa', color: 'bg-green-100 text-green-800 border-green-200' },
              { value: 'medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
              { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800 border-red-200' },
            ].map((priority) => (
              <button
                key={priority.value}
                type="button"
                className={`px-2 md:px-4 py-1 md:py-2 rounded-lg border-2 transition-all text-xs md:text-sm font-medium ${
                  formData.priority === priority.value
                    ? `${priority.color} scale-105 shadow-md`
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateField('priority', priority.value)}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={closeModal}
            className="flex-1 text-xs md:text-sm"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1 text-xs md:text-sm"
          >
            {isEditing ? 'Salvar' : 'Criar Tarefa'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;