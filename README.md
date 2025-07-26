# 📋 Kanban App

Uma aplicação moderna de gerenciamento de tarefas estilo Kanban, desenvolvida com React, TypeScript e Supabase.

## ✨ Características

- 🎨 **Interface Moderna**: Design com efeito liquid glass e animações suaves
- 🔐 **Autenticação Segura**: Sistema completo de login/cadastro com Supabase Auth
- 📱 **Responsivo**: Funciona perfeitamente em desktop e mobile
- 🎯 **Drag & Drop**: Arraste e solte tarefas entre colunas
- 🔄 **Tempo Real**: Sincronização automática entre dispositivos
- 🌙 **Acessibilidade**: Suporte completo a leitores de tela
- 🚀 **Performance**: Otimizado para carregamento rápido

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Animações e transições
- **Lucide React** - Ícones modernos

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança a nível de linha

### Ferramentas de Desenvolvimento
- **Create React App** - Configuração inicial do projeto
- **ESLint** - Linting de código
- **Prettier** - Formatação de código

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd kanban-app
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do Supabase
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Configurações da aplicação
REACT_APP_NAME=Kanban App
REACT_APP_VERSION=1.0.0

# Configurações de desenvolvimento
NODE_ENV=development
```

### 4. Execute o projeto
```bash
npm start
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Componentes de autenticação
│   ├── kanban/         # Componentes do Kanban
│   ├── modals/         # Componentes de modal
│   └── ui/             # Componentes de interface
├── contexts/           # Contextos React
├── lib/               # Configurações e utilitários
├── store/             # Gerenciamento de estado
├── types/             # Definições de tipos TypeScript
└── styles/            # Arquivos de estilo
```

## 🎯 Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Cadastro de novos usuários
- ✅ Confirmação por email
- ✅ Logout seguro
- ✅ Modal de confirmação personalizado

### Gerenciamento de Tarefas
- ✅ Criar, editar e excluir tarefas
- ✅ Organizar tarefas em colunas
- ✅ Arrastar e soltar tarefas
- ✅ Definir prioridades
- ✅ Adicionar datas de vencimento
- ✅ Descrições detalhadas

### Interface
- ✅ Design responsivo
- ✅ Animações suaves
- ✅ Feedback visual
- ✅ Ícones intuitivos
- ✅ Campo de senha com toggle de visibilidade

## 🔧 Scripts Disponíveis

### `npm start`
Executa a aplicação em modo de desenvolvimento.\
Abra [http://localhost:3000](http://localhost:3000) para visualizar no navegador.

### `npm test`
Executa os testes em modo interativo.\
Veja mais sobre [execução de testes](https://facebook.github.io/create-react-app/docs/running-tests).

### `npm run build`
Compila a aplicação para produção na pasta `build`.\
Otimiza o build para melhor performance.

### `npm run eject`
**Nota: esta é uma operação irreversível!**

Remove a dependência de build única do projeto, copiando todas as configurações.

## 🔒 Segurança

- **Variáveis de Ambiente**: Credenciais sensíveis armazenadas em `.env`
- **Row Level Security**: Políticas de segurança no Supabase
- **Validação de Dados**: Validação tanto no frontend quanto no backend
- **Autenticação JWT**: Tokens seguros para autenticação

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Confirme se o Supabase está configurado corretamente
3. Consulte a documentação do [Supabase](https://supabase.com/docs)
4. Abra uma issue no repositório

## 🎨 Design

O design da aplicação utiliza:
- **Liquid Glass Effect**: Efeito de vidro líquido com transparência
- **Micro-interações**: Animações sutis para melhor UX
- **Tipografia Moderna**: Fontes legíveis e hierarquia clara
- **Cores Harmoniosas**: Paleta de cores suave e profissional

---

Desenvolvido com ❤️ por Antonio
