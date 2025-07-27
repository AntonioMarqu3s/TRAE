import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar notificações locais no PWA
 * Fornece funcionalidades para solicitar permissão e enviar notificações
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar se as notificações são suportadas
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  /**
   * Solicita permissão para enviar notificações
   */
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Notificações não são suportadas neste navegador');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return 'denied';
    }
  };

  /**
   * Envia uma notificação local
   */
  const sendNotification = (title: string, options?: NotificationOptions) => {
    console.log(`🔔 Tentando enviar notificação: "${title}"`);
    console.log(`📱 isSupported: ${isSupported}`);
    console.log(`🔐 permission: ${permission}`);
    
    if (!isSupported) {
      console.warn('❌ Notificações não são suportadas');
      return null;
    }

    if (permission !== 'granted') {
      console.warn('❌ Permissão para notificações não foi concedida');
      return null;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    };

    console.log(`📋 Opções da notificação:`, defaultOptions);

    try {
      console.log(`🚀 Criando notificação...`);
      const notification = new Notification(title, defaultOptions);
      console.log(`✅ Notificação criada com sucesso!`, notification);
      
      // Auto-fechar após 5 segundos
      setTimeout(() => {
        console.log(`🔒 Fechando notificação: "${title}"`);
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      return null;
    }
  };

  /**
   * Envia notificação sobre nova tarefa
   */
  const notifyNewTask = (taskTitle: string, columnName: string) => {
    sendNotification('Nova Tarefa Criada! 📝', {
      body: `"${taskTitle}" foi adicionada à coluna "${columnName}"`,
      tag: 'new-task',
      data: { type: 'new-task', taskTitle, columnName }
    });
  };

  /**
   * Envia notificação sobre tarefa movida
   */
  const notifyTaskMoved = (taskTitle: string, fromColumn: string, toColumn: string) => {
    sendNotification('Tarefa Movida! 🔄', {
      body: `"${taskTitle}" foi movida de "${fromColumn}" para "${toColumn}"`,
      tag: 'task-moved',
      data: { type: 'task-moved', taskTitle, fromColumn, toColumn }
    });
  };

  /**
   * Envia notificação sobre tarefa vencendo
   */
  const notifyTaskDueSoon = (taskTitle: string, daysLeft: number) => {
    const emoji = daysLeft === 0 ? '🚨' : daysLeft === 1 ? '⚠️' : '📅';
    const message = daysLeft === 0 
      ? 'vence hoje!' 
      : daysLeft === 1 
        ? 'vence amanhã!' 
        : `vence em ${daysLeft} dias!`;

    sendNotification(`Tarefa Vencendo ${emoji}`, {
      body: `"${taskTitle}" ${message}`,
      tag: 'task-due',
      data: { type: 'task-due', taskTitle, daysLeft }
    });
  };

  /**
   * Envia notificação sobre tarefa concluída
   */
  const notifyTaskCompleted = (taskTitle: string) => {
    sendNotification('Tarefa Concluída! ✅', {
      body: `Parabéns! "${taskTitle}" foi concluída`,
      tag: 'task-completed',
      data: { type: 'task-completed', taskTitle }
    });
  };

  /**
   * Envia notificação sobre tarefa atrasada
   */
  const notifyOverdueTask = (taskTitle: string, daysOverdue: number) => {
    sendNotification('Tarefa Atrasada! 🚨', {
      body: `"${taskTitle}" está atrasada há ${daysOverdue} dia${daysOverdue > 1 ? 's' : ''}`,
      tag: 'task-overdue',
      data: { type: 'task-overdue', taskTitle, daysOverdue }
    });
  };

  /**
   * Envia notificação sobre tarefas do dia
   */
  const notifyTodayTasks = (count: number) => {
    console.log(`📋 notifyTodayTasks chamada com count: ${count}`);
    
    if (count === 0) {
      console.log(`📋 Count é 0, não enviando notificação`);
      return;
    }
    
    const message = count === 1 
      ? 'Você tem 1 tarefa para hoje!' 
      : `Você tem ${count} tarefas para hoje!`;

    console.log(`📋 Enviando notificação de tarefas do dia: "${message}"`);
    
    const result = sendNotification('Tarefas do Dia 📋', {
      body: message,
      tag: 'today-tasks',
      data: { type: 'today-tasks', count }
    });
    
    console.log(`📋 Resultado da notificação de tarefas do dia:`, result);
  };

  /**
   * Envia resumo de tarefas atrasadas
   */
  const notifyOverdueSummary = (count: number) => {
    console.log(`⚠️ notifyOverdueSummary chamada com count: ${count}`);
    
    if (count === 0) {
      console.log(`⚠️ Count é 0, não enviando notificação`);
      return;
    }
    
    const message = count === 1 
      ? 'Você tem 1 tarefa atrasada!' 
      : `Você tem ${count} tarefas atrasadas!`;

    console.log(`⚠️ Enviando notificação de tarefas atrasadas: "${message}"`);
    
    const result = sendNotification('Tarefas Atrasadas ⚠️', {
      body: message,
      tag: 'overdue-summary',
      data: { type: 'overdue-summary', count }
    });
    
    console.log(`⚠️ Resultado da notificação de tarefas atrasadas:`, result);
  };

  /**
   * Verifica e notifica sobre tarefas do dia e atrasadas
   */
  const checkAndNotifyDailyTasks = (tasks: any[]) => {
    if (!isSupported || permission !== 'granted') return;

    console.log('🔍 Iniciando verificação de tarefas diárias...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let todayTasks = 0;
    let overdueTasks = 0;

    tasks.forEach(task => {
      console.log(`📝 Verificando tarefa: "${task.title}" - Status: "${task.status}" - Due Date: ${task.due_date}`);
      
      // Pular tarefas já concluídas
      if (task.status === 'done' || task.status === 'concluído' || task.status === 'feito') {
        console.log(`✅ Tarefa "${task.title}" já está concluída, pulando...`);
        return;
      }

      // Verificar se tem data de vencimento (corrigido: due_date em vez de dueDate)
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        console.log(`📅 Data de vencimento da tarefa "${task.title}": ${dueDate.toDateString()}`);
        console.log(`📅 Data de hoje: ${today.toDateString()}`);

        // Verificar se é tarefa do dia
        if (dueDate.getTime() === today.getTime()) {
          todayTasks++;
          console.log(`🎯 Tarefa "${task.title}" é para hoje!`);
        }
        // Verificar se está atrasada
        else if (dueDate < today) {
          overdueTasks++;
          console.log(`⚠️ Tarefa "${task.title}" está atrasada!`);
        }
      } else {
        console.log(`📝 Tarefa "${task.title}" não tem data de vencimento`);
      }
    });

    console.log(`📊 Resumo: ${todayTasks} tarefas para hoje, ${overdueTasks} tarefas atrasadas`);

    // Notificar sobre tarefas do dia (com delay para não sobrecarregar)
    if (todayTasks > 0) {
      setTimeout(() => {
        console.log(`📋 Enviando notificação para ${todayTasks} tarefas do dia`);
        notifyTodayTasks(todayTasks);
      }, 1000);
    }

    // Notificar sobre tarefas atrasadas (com delay maior)
    if (overdueTasks > 0) {
      setTimeout(() => {
        console.log(`⚠️ Enviando notificação para ${overdueTasks} tarefas atrasadas`);
        notifyOverdueSummary(overdueTasks);
      }, 2000);
    }

    // Se não há tarefas para notificar
    if (todayTasks === 0 && overdueTasks === 0) {
      console.log('✨ Nenhuma tarefa urgente encontrada!');
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    notifyNewTask,
    notifyTaskMoved,
    notifyTaskDueSoon,
    notifyTaskCompleted,
    notifyOverdueTask,
    notifyTodayTasks,
    notifyOverdueSummary,
    checkAndNotifyDailyTasks
  };
};