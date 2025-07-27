/**
 * Hook para gerenciar funcionalidades PWA
 * Inclui detecção de instalação, prompt de instalação e verificação de dispositivo móvel
 */

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isMobile: boolean;
  showInstallPrompt: boolean;
  isStandalone: boolean;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isMobile: false,
    showInstallPrompt: false,
    isStandalone: false,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Verificar se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;

    // Verificar se está em modo standalone (já instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Verificar se já está instalado
    const isInstalled = isStandalone || 
      document.referrer.includes('android-app://') ||
      window.location.search.includes('utm_source=homescreen');

    setPwaState(prev => ({
      ...prev,
      isMobile,
      isStandalone,
      isInstalled,
    }));

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      
      // Mostrar prompt apenas em dispositivos móveis e se não estiver instalado
      if (isMobile && !isInstalled) {
        setPwaState(prev => ({
          ...prev,
          isInstallable: true,
          showInstallPrompt: true,
        }));
      }
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      console.log('PWA foi instalado');
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        showInstallPrompt: false,
        isInstallable: false,
      }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Função para mostrar o prompt de instalação
  const showInstallPrompt = async () => {
    if (!deferredPrompt) {
      console.log('Prompt de instalação não disponível');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`Usuário ${outcome} a instalação`);
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({
          ...prev,
          showInstallPrompt: false,
        }));
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
      return false;
    }
  };

  // Função para dispensar o prompt
  const dismissInstallPrompt = () => {
    setPwaState(prev => ({
      ...prev,
      showInstallPrompt: false,
    }));
    
    // Salvar no localStorage para não mostrar novamente por um tempo
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Verificar se o prompt foi dispensado recentemente (últimas 24 horas)
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const timeDiff = Date.now() - parseInt(dismissedTime);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      if (timeDiff < oneDayInMs) {
        setPwaState(prev => ({
          ...prev,
          showInstallPrompt: false,
        }));
      }
    }
  }, []);

  return {
    ...pwaState,
    showInstallPrompt: showInstallPrompt,
    dismissInstallPrompt,
    canInstall: pwaState.isInstallable && !pwaState.isInstalled,
  };
};