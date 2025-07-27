/**
 * Wrapper para o ConfirmModal que se conecta ao store
 * Gerencia o estado global do modal de confirmação
 */

import React from 'react';
import { ConfirmModal } from './ConfirmModal';
import { useSupabaseKanbanStore } from '../../store/supabaseKanbanStore';

export const ConfirmModalWrapper: React.FC = () => {
  const { modalState, closeModal } = useSupabaseKanbanStore();

  // Verificar se é o modal de confirmação
  const isConfirmModal = modalState.type === 'confirm';
  
  if (!isConfirmModal || !modalState.data) {
    return null;
  }

  const {
    title,
    message,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    loading = false
  } = modalState.data;

  // Handler para confirmar
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    closeModal();
  };

  // Handler para cancelar
  const handleCancel = () => {
    closeModal();
  };

  return (
    <ConfirmModal
      isOpen={modalState.isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      variant={variant}
      loading={loading}
    />
  );
};

export default ConfirmModalWrapper;