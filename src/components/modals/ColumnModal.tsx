/**
 * Modal para criação e edição de colunas
 * Permite personalizar título, cor e limite de tarefas
 */

import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { useSupabaseKanbanStore } from '../../store/supabaseKanbanStore';
import { LocalColumn } from '../../store/supabaseKanbanStore';
import { Modal, Button, Input } from '../ui';

// Cores disponíveis para colunas
const COLUMN_COLORS: { name: string; value: string; hex: string }[] = [
  { name: 'Azul', value: '#D6E8FF', hex: '#D6E8FF' },
  { name: 'Verde', value: '#C1FBA4', hex: '#C1FBA4' },
  { name: 'Roxo', value: '#E8D6FF', hex: '#E8D6FF' },
  { name: 'Rosa', value: '#FFD6E0', hex: '#FFD6E0' },
  { name: 'Laranja', value: '#FFE4B7', hex: '#FFE4B7' },
  { name: 'Amarelo', value: '#FFF4B7', hex: '#FFF4B7' },
  { name: 'Teal', value: '#B7F4E8', hex: '#B7F4E8' },
  { name: 'Cinza', value: '#E8E8E8', hex: '#E8E8E8' },
];

export const ColumnModal: React.FC = () => {
  // Estado global
  const {
    modalState,
    closeModal,
    addColumn,
    updateColumn,
  } = useSupabaseKanbanStore();

  // Estado local do formulário
  const [formData, setFormData] = useState({
    title: '',
    color: '#D6E8FF',
  });

  const [errors, setErrors] = useState<{
    title?: string;
  }>({});

  // Verificar se o modal está aberto
  const isOpen = modalState.isOpen && modalState.type === 'column';
  const isEditing = modalState.mode === 'edit';
  const column = modalState.data?.column as LocalColumn | undefined;

  // Resetar formulário quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (isEditing && column) {
        setFormData({
          title: column.title,
          color: column.color || '#D6E8FF',
        });
      } else {
        setFormData({
          title: '',
          color: '#D6E8FF',
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, column]);

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: { title?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (formData.title.length > 50) {
      newErrors.title = 'Título deve ter no máximo 50 caracteres';
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

  // Submeter formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isEditing && column) {
      const columnData = {
        title: formData.title.trim(),
        color: formData.color,
      };
      updateColumn(column.id, columnData);
    } else {
      // Para criar nova coluna, passar título e cor
      addColumn(formData.title.trim(), formData.color);
    }

    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEditing ? 'Editar Coluna' : 'Nova Coluna'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <Input
          label="Título *"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Ex: A Fazer, Em Progresso, Concluído"
          error={errors.title}
          maxLength={50}
        />

        {/* Cor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Palette className="inline w-4 h-4 mr-1" />
            Cor da coluna
          </label>
          <div className="grid grid-cols-5 gap-3">
            {COLUMN_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${
                  formData.color === color.hex
                    ? 'border-gray-400 scale-110 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                onClick={() => updateField('color', color.hex)}
                title={color.name}
              >
                {formData.color === color.hex && (
                  <span className="text-white text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview da coluna */}
        <div className="p-4 glass-effect rounded-ios">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <span className="font-medium text-gray-800">
              {formData.title || 'Título da coluna'}
            </span>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={closeModal}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            {isEditing ? 'Salvar' : 'Criar Coluna'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ColumnModal;