import React, { useEffect, useState, useCallback } from 'react';

/**
 * Interface para definir uma notificação popup
 */
export interface PopupNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  duration?: number; // em milissegundos, padrão 5000
}

/**
 * Props do componente NotificationPopup
 */
interface NotificationPopupProps {
  notifications: PopupNotification[];
  onRemove: (id: string) => void;
}

/**
 * Componente individual de notificação
 */
const NotificationItem: React.FC<{
  notification: PopupNotification;
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Função para remover notificação com animação
  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Tempo da animação de saída
  }, [onRemove, notification.id]);

  // Auto-remover após duração especificada
  useEffect(() => {
    const duration = notification.duration || 5000;
    const timer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.duration, handleRemove]);

  // Estilos baseados no tipo de notificação
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500 border-green-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      case 'error':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  // Ícone baseado no tipo
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-3
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'scale-95' : 'scale-100'}
      `}
    >
      <div
        className={`
          ${getTypeStyles()}
          text-white p-4 rounded-lg shadow-lg border-l-4 min-w-80 max-w-96
          cursor-pointer hover:shadow-xl transition-shadow duration-200
        `}
        onClick={handleRemove}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-xl flex-shrink-0 mt-0.5">
              {getIcon()}
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-sm opacity-90 leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="text-white hover:text-gray-200 transition-colors duration-150 ml-2 flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Container principal das notificações popup
 * Exibe notificações no canto superior direito da tela
 */
const NotificationPopup: React.FC<NotificationPopupProps> = ({
  notifications,
  onRemove,
}) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default NotificationPopup;