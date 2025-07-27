import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useSupabaseKanbanStore, LocalColumn, LocalTask } from '../store/supabaseKanbanStore';

/**
 * Hook para gerenciar notificações diárias automáticas
 * Verifica tarefas do dia e atrasadas quando o usuário faz login
 */
export const useDailyNotifications = (isAuthenticated: boolean) => {
  const { checkAndNotifyDailyTasks, permission, isSupported } = useNotifications();
  const { board } = useSupabaseKanbanStore();
  const hasNotifiedTodayRef = useRef(false);
  const lastNotificationDateRef = useRef<string>('');

  // Função para verificar se já notificou hoje
  const shouldNotifyToday = () => {
    const today = new Date().toDateString();
    const hasNotifiedToday = lastNotificationDateRef.current === today;
    return !hasNotifiedToday;
  };

  // Função para marcar que já notificou hoje
  const markAsNotifiedToday = () => {
    const today = new Date().toDateString();
    lastNotificationDateRef.current = today;
    hasNotifiedTodayRef.current = true;
    
    // Salvar no localStorage para persistir entre sessões
    localStorage.setItem('lastDailyNotification', today);
  };

  // Função para carregar última data de notificação do localStorage
  const loadLastNotificationDate = () => {
    const saved = localStorage.getItem('lastDailyNotification');
    if (saved) {
      lastNotificationDateRef.current = saved;
      const today = new Date().toDateString();
      hasNotifiedTodayRef.current = saved === today;
    }
  };

  // Função para processar notificações diárias (memoizada)
  const processDailyNotifications = useCallback(async () => {
    if (!isAuthenticated || !isSupported || permission !== 'granted') {
      return;
    }

    if (!shouldNotifyToday()) {
      console.log('📅 Notificações diárias já foram enviadas hoje');
      return;
    }

    try {
      // Verificar se o board está carregado
      if (!board) {
        console.log('📋 Board não carregado ainda, aguardando...');
        return;
      }

      // Coletar todas as tarefas do board atual
      const allTasks: Array<LocalTask & { status: string; boardTitle: string; columnTitle: string }> = [];
      
      board.columns.forEach((column: LocalColumn) => {
        column.taskIds.forEach((taskId: string) => {
          const task: LocalTask = board.tasks[taskId];
          if (task) {
            allTasks.push({
              ...task,
              status: column.title.toLowerCase(),
              boardTitle: board.title,
              columnTitle: column.title
            });
          }
        });
      });

      console.log(`📊 Verificando ${allTasks.length} tarefas para notificações diárias`);

      // Verificar e notificar
      if (allTasks.length > 0) {
        checkAndNotifyDailyTasks(allTasks);
        markAsNotifiedToday();
      }

    } catch (error) {
      console.error('❌ Erro ao processar notificações diárias:', error);
    }
  }, [isAuthenticated, isSupported, permission, board, checkAndNotifyDailyTasks]);

  // Carregar última data de notificação ao inicializar
  useEffect(() => {
    loadLastNotificationDate();
  }, []);

  // Processar notificações quando o usuário fizer login e o board estiver carregado
  useEffect(() => {
    if (isAuthenticated && isSupported && permission === 'granted' && board) {
      // Aguardar um pouco para garantir que os dados foram carregados
      const timer = setTimeout(() => {
        processDailyNotifications();
      }, 3000); // 3 segundos de delay

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, permission, isSupported, board, processDailyNotifications]);

  // Função para forçar verificação manual (útil para testes)
  const forceCheckDailyTasks = () => {
    hasNotifiedTodayRef.current = false;
    lastNotificationDateRef.current = '';
    localStorage.removeItem('lastDailyNotification');
    processDailyNotifications();
  };

  return {
    forceCheckDailyTasks,
    hasNotifiedToday: hasNotifiedTodayRef.current,
    lastNotificationDate: lastNotificationDateRef.current
  };
};