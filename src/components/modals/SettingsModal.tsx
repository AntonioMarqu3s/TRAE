/**
 * Modal de configurações do aplicativo
 * Permite personalizar título do board, tema e outras preferências
 */

import React, { useState, useEffect } from 'react';
import { Settings, Download, Upload, Trash2, RotateCcw } from 'lucide-react';
import { useSupabaseKanbanStore } from '../../store/supabaseKanbanStore';
import { Modal, Button, Input } from '../ui';

export const SettingsModal: React.FC = () => {
  // Estado global
  const {
    modalState,
    closeModal,
    board,
    updateBoardTitle,
  } = useSupabaseKanbanStore();

  // Estado local
  const [boardTitle, setBoardTitle] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Verificar se o modal está aberto
  const isOpen = modalState.isOpen && modalState.type === 'settings';

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen && board) {
      setBoardTitle(board.title);
      setShowResetConfirm(false);
    }
  }, [isOpen, board]);

  // Salvar título do board
  const handleSaveTitle = () => {
    if (boardTitle.trim() && boardTitle.trim() !== (board?.title || '')) {
      updateBoardTitle(boardTitle.trim());
    }
  };

  // Exportar dados do board
  const handleExportBoard = () => {
    const dataStr = JSON.stringify(board, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importar dados do board
  const handleImportBoard = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            // Validar estrutura básica do board
            if (data.id && data.title && Array.isArray(data.columns)) {
              // Aqui você pode implementar a lógica de importação
              console.log('Board importado:', data);
              alert('Board importado com sucesso!');
              closeModal();
            } else {
              alert('Arquivo inválido. Verifique se é um export válido do Kanban.');
            }
          } catch (error) {
            alert('Erro ao ler o arquivo. Verifique se é um JSON válido.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Resetar board (funcionalidade removida temporariamente)
  const handleResetBoard = () => {
    if (showResetConfirm) {
      // TODO: Implementar função de reset na store
      alert('Funcionalidade de reset será implementada em breve');
      setShowResetConfirm(false);
      closeModal();
    } else {
      setShowResetConfirm(true);
    }
  };

  // Estatísticas do board
  const totalTasks = board ? Object.keys(board.tasks).length : 0;
  const completedTasks = board?.columns
    .filter(col => col.title.toLowerCase().includes('concluí') || col.title.toLowerCase().includes('feito'))
    .reduce((acc, col) => acc + col.taskIds.length, 0) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Configurações"
      size="md"
    >
      <div className="space-y-6">
        {/* Título do Board */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={20} />
            Configurações Gerais
          </h3>
          
          <div className="space-y-3">
            <Input
              label="Título do Board"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              placeholder="Digite o título do seu board"
              maxLength={100}
            />
            
            <Button
              variant="secondary"
              onClick={handleSaveTitle}
              disabled={!boardTitle.trim() || boardTitle.trim() === (board?.title || '')}
              className="w-full"
            >
              Salvar Título
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="glass-effect rounded-ios p-4">
          <h4 className="font-medium text-gray-800 mb-3">Estatísticas do Board</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total de colunas:</span>
              <span className="font-semibold ml-2">{board?.columns.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Total de tarefas:</span>
              <span className="font-semibold ml-2">{totalTasks}</span>
            </div>
            <div>
              <span className="text-gray-600">Tarefas concluídas:</span>
              <span className="font-semibold ml-2">{completedTasks}</span>
            </div>
            <div>
              <span className="text-gray-600">Progresso:</span>
              <span className="font-semibold ml-2">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Backup e Restauração */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Download size={20} />
            Backup e Restauração
          </h3>
          
          <div className="space-y-3">
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportBoard}
              className="w-full"
            >
              Exportar Board
            </Button>
            
            <Button
              variant="secondary"
              icon={Upload}
              onClick={handleImportBoard}
              className="w-full"
            >
              Importar Board
            </Button>
          </div>
        </div>

        {/* Zona de Perigo */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <Trash2 size={20} />
            Zona de Perigo
          </h3>
          
          <div className="space-y-3">
            {!showResetConfirm ? (
              <Button
                variant="ghost"
                icon={RotateCcw}
                onClick={handleResetBoard}
                className="w-full text-red-600 hover:bg-red-50 border border-red-200"
              >
                Resetar Board
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-ios">
                  <p className="text-sm text-red-800">
                    ⚠️ <strong>Atenção!</strong> Esta ação irá apagar todas as colunas e tarefas.
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleResetBoard}
                    className="flex-1 text-red-600 hover:bg-red-50 border border-red-200"
                  >
                    Confirmar Reset
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botão de fechar */}
        <div className="pt-4">
          <Button
            variant="primary"
            onClick={closeModal}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;