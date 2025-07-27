import { useState, useCallback } from 'react';
import { PopupNotification } from '../components/ui/NotificationPopup';

/**
 * Hook para gerenciar notificações popup dentro da aplicação
 * Complementa as notificações nativas do sistema
 */
export const usePopupNotifications = () => {
  const [notifications, setNotifications] = useState<PopupNotification[]>([]);

  /**
   * Adiciona uma nova notificação popup
   */
  const addNotification = useCallback((
    title: string,
    message: string,
    type: PopupNotification['type'] = 'info',
    duration?: number
  ) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    const newNotification: PopupNotification = {
      id,
      title,
      message,
      type,
      duration
    };

    console.log(`🔔 Adicionando notificação popup: "${title}" - "${message}"`);
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  /**
   * Remove uma notificação específica
   */
  const removeNotification = useCallback((id: string) => {
    console.log(`🗑️ Removendo notificação popup: ${id}`);
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  /**
   * Remove todas as notificações
   */
  const clearAllNotifications = useCallback(() => {
    console.log(`🧹 Limpando todas as notificações popup`);
    setNotifications([]);
  }, []);

  /**
   * Adiciona notificação de sucesso
   */
  const addSuccessNotification = useCallback((title: string, message: string, duration?: number) => {
    return addNotification(title, message, 'success', duration);
  }, [addNotification]);

  /**
   * Adiciona notificação de aviso
   */
  const addWarningNotification = useCallback((title: string, message: string, duration?: number) => {
    return addNotification(title, message, 'warning', duration);
  }, [addNotification]);

  /**
   * Adiciona notificação de erro
   */
  const addErrorNotification = useCallback((title: string, message: string, duration?: number) => {
    return addNotification(title, message, 'error', duration);
  }, [addNotification]);

  /**
   * Adiciona notificação de informação
   */
  const addInfoNotification = useCallback((title: string, message: string, duration?: number) => {
    return addNotification(title, message, 'info', duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    addSuccessNotification,
    addWarningNotification,
    addErrorNotification,
    addInfoNotification
  };
};