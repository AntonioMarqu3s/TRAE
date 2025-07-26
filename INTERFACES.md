Documento de Planejamento de Interface (UI)
Aplicativo de Tarefas Kanban (Sem Login)
---


1. Visão Geral da Interface
Objetivo: Criar uma interface intuitiva, fluída e visualmente atraente, seguindo o estilo iOS 26 com elementos de liquid glass, cantos arredondados e personalização de cores.
Princípios de Design:

- Minimalismo e clareza.

- Feedback visual e tátil para interações.

- Consistência entre plataformas (iOS e Android).

---


2. Lista de Telas e Componentes

2.1. Tela Inicial (Board Kanban)
Descrição: Exibe todas as colunas e tarefas organizadas no estilo Kanban.
Componentes:

- Barra Superior (Header):

- Título do board ("Meu Kanban").

- Botão de adicionar coluna (+) no canto direito.

- Ícone de configurações (opções de personalização).

- Área de Colunas (Horizontal Scroll):

- Container para cada coluna (ex: "A Fazer", "Fazendo", "Feito").

- Efeito liquid glass (blur + transparência).

- Cabeçalho da coluna:

- Título da coluna (editável com toque longo).

- Contador de tarefas (ex: "3 tarefas").

- Botão de adicionar tarefa (+) no canto direito.

- Lista de cards de tarefas:

- Card de tarefa:

- Título da tarefa.

- Categoria (tag com cor personalizável).

- Ícone de arrastar (handle) no canto superior.

- Toque longo abre menu de edição/exclusão.

- Interações:

- Arrastar e soltar cards entre colunas (com feedback visual de "elevação" durante o drag).

- Toque longo no cabeçalho da coluna para editar ou excluir.

- Toque no botão "+" para adicionar nova tarefa.

---


2.2. Modal de Adicionar/Editar Tarefa
Descrição: Overlay para criação ou edição de tarefas.
Componentes:

- Container:

- Fundo com efeito liquid glass (blur).

- Cantos arredondados (24px).

- Campos de Input:

- Campo de texto para título da tarefa.

- Dropdown para seleção de categoria (com cores pré-definidas).

- Campo opcional para descrição (textarea).

- Botões:

- "Salvar" (primário, com cor acentuada).

- "Cancelar" (secundário, texto simples).

- Interações:

- Animação de aparecimento suave (fade-in).

- Fechar ao tocar fora do modal.

---


2.3. Modal de Adicionar/Editar Coluna
Descrição: Overlay para criar ou renomear colunas.
Componentes:

- Container:

- Mesmo estilo do modal de tarefas (liquid glass).

- Campos de Input:

- Campo de texto para nome da coluna.

- Seletor de cor (paleta pastel com 8 opções).

- Botões:

- "Confirmar" (primário).

- "Excluir" (vermelho, se em modo de edição).

---


2.4. Menu de Personalização
Descrição: Acessado via ícone de configurações no header.
Componentes:

- Lista de Opções:

- "Tema" (submenu para claro/escuro).

- "Cores das Categorias" (editar paleta padrão).

- "Resetar Board" (com confirmação).

- Interações:

- Toque em cada opção abre submenus ou ações.

---


2.5. Feedback Visual (Componentes de Estado)
Componentes:
- Toast Notification:

- Mensagem temporária (ex: "Tarefa salva!").

- Fundo semi-transparente com texto em contraste.

- Confirmação de Exclusão:

- Modal com texto ("Excluir esta tarefa?") e botões "Sim"/"Não".

---


3. Fluxo de Navegação
Tela Inicial* → Adicionar Tarefa → *Modal de Tarefa.
Tela Inicial* → Toque Longo em Coluna → *Modal de Editar Coluna.
Tela Inicial* → Ícone de Configurações → *Menu de Personalização.
---


4. Requisitos de Dados por Componente
- Card de Tarefa:

- ID único.

- Título (string).

- Categoria (string + cor hexadecimal).

- Coluna:

- Nome (string).

- Cor (hexadecimal).

- Lista de IDs de tarefas.

---


5. Especificações Técnicas de UI
- Bibliotecas:

- iOS: SwiftUI (para efeitos de blur e animações).

- Android: Jetpack Compose (com suporte a Material You).

- Assets:

- Ícones SF Symbols (iOS) e Material Icons (Android).

- Paleta de cores pastel em formato JSON para personalização.

- Acessibilidade:

- Labels para VoiceOver (ex: "Botão para adicionar tarefa").

- Contraste mínimo de 4.5:1 para texto.

---


6. Validações e Notas
- Testes:

- Verificar fluidez do drag-and-drop em dispositivos antigos.

- Garantir que modais não quebrem em telas pequenas.

- Observações:

- Evitar poluição visual: máximo de 2 ações por card (editar/arrastar).

- Priorizar feedback imediato para todas as interações.

---