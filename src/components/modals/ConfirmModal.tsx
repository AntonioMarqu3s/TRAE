/**
 * Modal de confirmação reutilizável
 * Substitui o window.confirm com uma interface mais elegante e consistente
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Modal, Button } from '../ui';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

// Configurações para cada variante
const variantConfig = {
  danger: {
    icon: XCircle,
    iconColor: 'text-red-500',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    confirmButtonClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  loading = false,
}) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  // Handler para confirmar
  const handleConfirm = () => {
    onConfirm();
  };

  // Handler para cancelar
  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      size="sm"
      closeOnBackdropClick={!loading}
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Ícone */}
        <motion.div
          className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
        </motion.div>

        {/* Título */}
        <motion.h3
          className="text-lg font-semibold text-gray-900 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h3>

        {/* Mensagem */}
        <motion.p
          className="text-sm text-gray-600 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>

        {/* Botões */}
        <motion.div
          className="flex gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={loading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`min-w-[80px] px-4 py-2 rounded-ios font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmButtonClass}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </motion.div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;