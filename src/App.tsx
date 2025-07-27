/**
 * Componente principal da aplicação Kanban
 * Gerencia autenticação e renderiza o board principal
 */

import React, { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { KanbanBoard } from './components/kanban';
import { TaskModal } from './components/modals/TaskModal';
import { ColumnModal } from './components/modals/ColumnModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ConfirmModalWrapper } from './components/modals/ConfirmModalWrapper';
import NotificationPopup from './components/ui/NotificationPopup';
import { PWAInstallBanner } from './components/ui/PWAInstallBanner';
import LoginForm from './components/auth/LoginForm';
import { useSupabaseKanbanStore } from './store/supabaseKanbanStore';
import { useDailyNotifications } from './hooks/useDailyNotifications';
import { useNotifications } from './hooks/useNotifications';
import { usePWA } from './hooks/usePWA';

// Componente principal que verifica autenticação
const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { loadBoard, isLoading, error, board } = useSupabaseKanbanStore();
  const loadBoardCalledRef = useRef<string | null>(null);

  // Hook para notificações (sistema + popup)
  const { popupNotifications, removePopupNotification } = useNotifications();

  // Hook para PWA
  const { 
    dismissInstallPrompt,
    isMobile,
    canInstall
  } = usePWA();
  
  // Função de instalação (renomeada para evitar conflito)
  const installPWA = usePWA().showInstallPrompt;

  // Hook para notificações diárias automáticas
  useDailyNotifications(!!user);

  // Carregar dados do usuário quando autenticado (apenas uma vez por usuário)
  useEffect(() => {
    if (user && !isLoading && loadBoardCalledRef.current !== user.id) {
      console.log('🔄 Iniciando carregamento do board para usuário autenticado');
      loadBoardCalledRef.current = user.id;
      
      loadBoard(user.id).catch((error) => {
        console.error('❌ Erro ao carregar board no App:', error);
        // Reset da flag em caso de erro para permitir nova tentativa
        loadBoardCalledRef.current = null;
      });
    }
  }, [user, loadBoard, isLoading]);

  // Reset da flag quando usuário muda ou faz logout
  useEffect(() => {
    if (!user) {
      loadBoardCalledRef.current = null;
    }
  }, [user]);

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  // Mostrar login se não autenticado
  if (!user) {
    return <LoginForm />;
  }

  // Mostrar erro se houver problema no carregamento
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              // Reset da flag para permitir nova tentativa
              loadBoardCalledRef.current = null;
              window.location.reload();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Mostrar loading dos dados (apenas se não há board carregado)
  if (isLoading && !board) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-gray-600">Carregando seus dados...</span>
        </div>
      </div>
    );
  }

  // Renderizar aplicação principal
  return (
    <div className="App h-screen overflow-hidden flex flex-col">
      {/* Board principal */}
      <KanbanBoard />
      
      {/* Modais */}
      <TaskModal />
      <ColumnModal />
      <SettingsModal />
      <ConfirmModalWrapper />
      
      {/* Notificações Popup */}
      <NotificationPopup 
        notifications={popupNotifications}
        onRemove={removePopupNotification}
      />
      
      {/* Banner de instalação PWA */}
      <PWAInstallBanner
        isVisible={canInstall && isMobile}
        onInstall={installPWA}
        onDismiss={dismissInstallPrompt}
      />
    </div>
  );
};

// Componente App com provider de autenticação
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
