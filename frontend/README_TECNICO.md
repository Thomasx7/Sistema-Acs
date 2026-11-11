# README Técnico — Sistema ACS

## 1. Visão geral

Este repositório contém a implementação atual de um frontend em React para a plataforma ACS. O sistema foi desenvolvido para oferecer uma experiência de aprendizagem em temas como LGPD, letramento digital, segurança da informação e saúde digital.

O frontend React consome a API Flask autenticada para quizzes, perguntas e progresso. O catálogo e as respostas corretas são armazenados no PostgreSQL; o jogo valida respostas no backend.

## 2. Estado atual do projeto

| Funcionalidade | Estado | Observação |
|---|---|---|
| Interface principal | Implementado | Estrutura visual em React + CSS |
| Navegação | Implementado | Rotas definidas com react-router-dom |
| Login | Parcial | Tela visual e lógica local de formulário; sem autenticação real |
| Quiz interativo | Implementado | Perguntas e validação de respostas pela API |
| Progresso do usuário | Implementado | Salvo no backend com posição exata de retomada |
| Biblioteca | Parcial | Página informativa e de orientação; conteúdo não estruturado como repositório funcional |
| Perfil do usuário | Parcial | Perfil e foto salvos localmente; o tema vale durante a sessão e não há integração de atualização com a API |
| Cadastro | Pendente | Existem referências visuais, mas sem fluxo funcional |
| Recuperação de senha | Pendente | Link presente sem rota correspondente |
| Reset de senha | Pendente | Não identificado no código |
| API/backend | Implementado | Cliente autenticado em `src/services/api.js` |
| Banco de dados | Implementado | Quizzes, perguntas, alternativas e progresso no PostgreSQL |
| Autenticação | Implementado | Contexto de autenticação, token e rotas protegidas |

## 3. Stack tecnológica

### 3.1 Tecnologias realmente presentes

- JavaScript
- React 19
- Vite 8
- React Router DOM
- HTML5
- CSS3
- LocalStorage do navegador

### 3.2 Finalidade por tecnologia

- React: construção da interface e do comportamento reativo.
- Vite: tooling de desenvolvimento e build do projeto.
- React Router DOM: navegação entre páginas e layouts.
- JavaScript: lógica da aplicação, manipulação de estados e dados.
- CSS: estilização visual do sistema.
- LocalStorage: preferências e dados locais não sensíveis; o progresso dos quizzes é remoto.

### 3.3 Observações sobre a stack

Não há biblioteca de UI nem state management externo. Os serviços em `src/services` centralizam o acesso à API; os dados de quizzes não são mais mocks no frontend.

## 4. Arquitetura atual

### 4.1 Arquitetura atual

```mermaid
flowchart LR
    U[Usuário] --> F[Frontend React]
    F --> C[Componentes e páginas]
    C --> S[Serviços da API]
    S --> A[API Flask]
    A --> DB[(PostgreSQL)]
    C --> L[Preferências locais]
```

## 5. Estrutura de diretórios

```text
src/
  App.jsx
  index.css
  main.jsx
  assets/
    css/
      auth_css/
      components_css/
      pages_css/
    icons/
  components/
    cards-Inicio.jsx
    header.jsx
    historico-quiz.jsx
    quiz-item.jsx
    sidebar.jsx
  layouts/
    PainelLayout.jsx
  pages/
    Auth/
      login.jsx
    Home/
      biblioteca.jsx
      home.jsx
      progresso.jsx
      quiz.jsx
  utils/
    progresso.js
```

## 6. Arquitetura de navegação

### 6.1 Rotas definidas

| Rota | Página | Componente | Finalidade | Status |
|---|---|---|---|---|
| /login | Login | src/pages/Auth/login.jsx | tela de acesso | Parcial |
| / | Home | src/pages/Home/home.jsx | painel inicial | Implementado |
| /quiz | Seleção de quiz | src/pages/Home/quiz.jsx | lista de temas | Implementado |
| /quiz/:id | Quiz | src/pages/Home/quiz.jsx | execução do questionário | Implementado |
| /biblioteca | Biblioteca | src/pages/Home/biblioteca.jsx | materiais e orientação | Parcial |
| /progresso | Progresso | src/pages/Home/progresso.jsx | acompanhamento | Implementado |
| /perfil | Perfil | src/pages/Home/perfil.jsx | dados pessoais e preferências | Parcial |
| * | Redirecionamento | src/App.jsx | fallback para / | Implementado |

### 6.2 Observações

- O sistema usa `BrowserRouter` em `src/main.jsx`.
- O layout principal é definido em `src/layouts/PainelLayout.jsx`.
- O menu do usuário no Header leva a `/perfil`; a página usa `PainelLayout`.
- O link `/esqueci-senha` ainda não tem rota correspondente.
- O menu lateral tem `NavLink` para `/painel`, mas a configuração real do `Routes` usa `/` como base do painel. Isso indica que o sistema de navegação ainda precisa refinamento.

## 7. Páginas e componentes principais

### 7.1 App

Arquivo: `src/App.jsx`

Responsabilidade:
- registrar as rotas da aplicação;
- renderizar o layout do painel para páginas internas;
- redirecionar rotas desconhecidas para `/`.

Fluxo:
- `/login` renderiza Login.
- `/` renderiza `PainelLayout` com `Home` por padrão.
- `/quiz` e `/quiz/:id` renderizam a lógica do quiz.
- `/biblioteca` e `/progresso` renderizam as páginas correspondentes.
- `/perfil` renderiza o formulário de perfil dentro do layout do painel.

### 7.2 PainelLayout

Arquivo: `src/layouts/PainelLayout.jsx`

Responsabilidade:
- estruturar o painel principal com `Sidebar`, `Header` e área de conteúdo.

Elementos:
- `Sidebar`: navegação lateral.
- `Header`: área de boas-vindas e perfil.
- `Outlet`: renderiza a página ativa do React Router.

### 7.3 Sidebar

Arquivo: `src/components/sidebar.jsx`

Responsabilidade:
- navegação lateral entre Home, Quiz, Biblioteca e Progresso.

Estados:
- `collapsed`: controla a abertura/fechamento do sidebar.

Hooks:
- `useState` para alternar o estado do menu.

Observações:
- há links para páginas que existem, mas também há referência a `/painel`, que não foi configurado como rota real.

### 7.4 Header

Arquivo: `src/components/header.jsx`

Responsabilidade:
- exibir nome do usuário, avatar inicial e menu de perfil.

Estados:
- `aberto`: controla a abertura do dropdown do perfil.

Hooks:
- `useState`: botão do menu.
- `useRef`: referência do container do perfil.
- `useEffect`: escuta cliques fora do menu e tecla `Escape` para fechar.

Ações:
- `handleSair()`: fecha o menu e redireciona para `/login` usando `window.location.href`.

Observações:
- não há autenticação verdadeira; o sair apenas troca a URL.
- o link "Perfil" aponta para `/perfil`, mas essa rota não existe.

### 7.5 Home

Arquivo: `src/pages/Home/home.jsx`

Responsabilidade:
- composição da página inicial.

Componentes filhos:
- `CardsInicio`
- `HistoricoQuiz`

### 7.6 CardsInicio

Arquivo: `src/components/cards-Inicio.jsx`

Responsabilidade:
- exibir os quizzes disponíveis.
- mostrar o status do quiz para o usuário.

Dados:
- quizzes carregados pela API em `GET /quizzes`;
- progresso carregado pela API em `/progresso-quiz`;
- quizzes e perguntas administrados pelos endpoints do service `src/services/quizzes.js`.

Estados:
- carregamento e erros de quizzes, progresso e registro de acesso.

Função relevante:
- o status da API define os rótulos "Iniciar Quiz", "Continuar Quiz" e "Refazer Quiz";
- usuários ADM podem criar, editar e excluir quizzes e perguntas nessa página.

### 7.7 HistoricoQuiz

Arquivo: `src/components/historico-quiz.jsx`

Responsabilidade:
- listar os quizzes mais recentes salvos no histórico.

Fluxo:
- carrega os quizzes e o progresso da API;
- associa os registros por `id_quiz`;
- filtra os quizzes com progresso;
- ordena pela data mais recente;
- exibe apenas os últimos cinco.

### 7.8 QuizItem

Arquivo: `src/components/quiz-item.jsx`

Responsabilidade:
- renderizar um item da lista de progresso ou histórico.

Props:
- `quiz`
- `status`
- `progresso`
- `atualizadoEm`

Funções:
- `formatarData(iso)`: transforma a data ISO em string legível em português.

### 7.9 Quiz

Arquivo: `src/pages/Home/quiz.jsx`

Responsabilidade:
- carregar quiz e perguntas pela API;
- renderizar a pergunta atual;
- validar a resposta pela API e exibir o retorno;
- salvar progresso e posição exata de retomada na API.

Componentes internos:
- `QuizJogo`: lógica da sessão do quiz.

Estados principais:
- `indice`
- `selecionada`
- `confirmada`
- `acertos`
- `finalizado`

Fluxo real:
1. A página carrega `GET /quizzes/<id>` e o progresso do usuário.
2. O usuário seleciona uma alternativa e envia a resposta a `POST /quizzes/<id>/responder`.
3. O retorno do backend informa acerto, alternativa correta e explicação.
4. O progresso, incluindo `perguntas_respondidas`, é salvo em `/progresso-quiz/<id>`.
5. A posição exata salva permite continuar na pergunta seguinte.

### 7.10 Biblioteca

Arquivo: `src/pages/Home/biblioteca.jsx`

Responsabilidade:
- apresentar conteúdo explicativo sobre o funcionamento da plataforma.
- mostrar ações e materiais previstos, com status disponível/em breve.

Observações:
- A lista `funcoes` define `disponivel: false` para a biblioteca, confirmando que essa área ainda não está funcional.
- O texto diz explicitamente que a plataforma está preparando materiais e que por enquanto o usuário pratica quizzes.

### 7.11 Progresso

Arquivo: `src/pages/Home/progresso.jsx`

Responsabilidade:
- calcular o resumo geral por quiz e mostrar o percentual de andamento.

Dados:
- quizzes e progresso carregados pela API autenticada.

Implementação:
- `lista` associa cada quiz ao progresso usando `id_quiz`.
- `concluidos`, `emAndamento` e `naoIniciados` são calculados com `filter`.
- `progressoGeral` usa `reduce` e `Math.round`; quizzes sem registro aparecem com 0%.

### 7.12 Perfil

Arquivo: `src/pages/Home/perfil.jsx`

Responsabilidade:
- permitir editar nome, e-mail, foto e preferência de tema;
- exibir o resumo do progresso já salvo pelos quizzes;
- validar os dados antes de habilitar a persistência local.

Persistência:
- `src/utils/perfil.js` usa a chave `acs-perfil-usuario`;
- a foto é salva em base64 e limitada a 2 MB;
- a senha nunca é persistida no navegador; sua atualização depende de integração autenticada com a API.
- o tema é gerenciado pelo `ThemeContext` e não é salvo junto aos dados do perfil.

## 8. Login e autenticação

Arquivo: `src/pages/Auth/login.jsx`

O `AuthProvider` em `src/context/AuthContext.jsx` autentica via `/auth/login`, mantém o usuário e valida a sessão em `/auth/me`. O cliente `src/services/api.js` envia o token Bearer e limpa a sessão quando recebe 401 com token. `ProtectedRoute` protege o painel e restringe a área de usuários a ADM; o backend também verifica as permissões.

## 9. Cadastro, recuperação e reset de senha

### 9.1 Cadastro

Estado identificado:
- não há página de cadastro no `Routes`.
- não há `form` de cadastro.
- não há persistência ou API.

Conclusão:
- funcionalidade pendente.

### 9.2 Recuperação de senha

Identificado:
- existe um link `Link to="/esqueci-senha"` no formulário de login.
- não existe rota correspondente em `App.jsx`.

Conclusão:
- interface de referência presente, mas sem implementação real.

### 9.3 Reset de senha

Identificado:
- não foi encontrada rota, componente ou fluxo de reset.

Conclusão:
- pendente e não implementado.

## 10. Dados e armazenamento

### 10.1 Quizzes e progresso

- o catálogo de quizzes e suas perguntas são mantidos no PostgreSQL e servidos pela API;
- os antigos mocks `src/data/quizzes.js` e `src/data/perguntas.js` foram removidos por não terem mais consumidores;
- o frontend usa `src/services/progressoQuiz.js` para ler e gravar o progresso autenticado;
- `perguntas_respondidas` registra a posição precisa de retomada, enquanto o percentual é recalculado com base no total atual de perguntas.

### 10.3 Perfil e preferência de tema

Arquivo: `src/utils/perfil.js`

- `lerPerfil()` carrega `nome`, `email` e `foto` pela chave `acs-perfil-usuario`;
- `salvarPerfil(perfil)` persiste localmente `nome`, `email` e `foto`;
- a senha é mantida somente no estado do formulário e não é armazenada em texto puro;
- o perfil ainda não é sincronizado com a API.

### 10.4 Tema global

Arquivos:
- `src/context/ThemeContext.jsx`
- `src/context/useTheme.js`
- `src/index.css`
- `index.html`

Comportamento:
- `ThemeProvider` fornece `theme`, `toggleTheme()` e `setTheme()` para a árvore React;
- o tema é aplicado ao elemento `<html>` por `data-theme` e `color-scheme`;
- o tema sempre inicia em `light`, sem ler preferências antigas ou `prefers-color-scheme`;
- um script no `<head>` aplica `light` antes da montagem React para evitar flash de tema;
- a troca para `dark` ou `light` pelo perfil altera o tema global durante a sessão, sem persistência entre recargas;
- os tokens de cor do tema escuro são definidos em `src/index.css`.

## 11. Funções principais e responsabilidades

### Serviços de quizzes e progresso

Arquivos: `src/services/quizzes.js` e `src/services/progressoQuiz.js`.

Responsabilidade:
- consumir os endpoints autenticados de quizzes, perguntas, respostas e progresso;
- manter a posição de retomada por `perguntas_respondidas`.

### `handleSubmit(event)`

Arquivo: `src/pages/Auth/login.jsx`

Responsabilidade:
- bloquear submit padrão e registrar os valores no console do navegador.

Observação:
- não há autenticação real nem integração com API.

### `confirmar()`

Arquivo: `src/pages/Home/quiz.jsx`

Responsabilidade:
- definir a resposta como confirmada;
- incrementar `acertos` quando a alternativa está correta;
- salvar progresso no navegador.

### `continuar()`

Arquivo: `src/pages/Home/quiz.jsx`

Responsabilidade:
- avançar para a próxima questão ou encerrar o quiz.

## 12. React e hooks utilizados

### Hooks realmente presentes

- `useState`: em vários componentes, incluindo login, sidebar, quiz e cards iniciais.
- `useEffect`: em `Header` para tratar clique fora e `Escape`.
- `useRef`: em `Header` para referência do menu de perfil.

### Observações

- Não há `useContext`.
- Não há hooks personalizados criados no projeto.
- Não há reducers, stores globais ou gerenciamento centralizado de estado.

## 13. Formulários e validação

### Formulário de login

Arquivo: `src/pages/Auth/login.jsx`

Campos:
- e-mail
- senha

Validação:
- `required` do HTML5
- `type="email"` para campo de e-mail

Estados:
- `email`
- `password`
- `showPassword`

Eventos:
- `onChange` atualiza o estado do input
- `onSubmit` dispara `handleSubmit`

Comportamento atual:
- coleta os dados e imprime no console
- não navega para painel após login
- não valida credenciais no servidor

## 14. API e backend

### Situação atual

O código atual não possui qualquer módulo dedicado à comunicação com API. Não existem endpoints, clientes HTTP, interceptadores, contexto de autenticação ou serviços no padrão de `fetch`, `axios` ou equivalentes.

### Evolução prevista

A arquitetura pretendida deve incluir:

- camada de serviços para acesso à API;
- autenticação via backend;
- gestão de usuários e progresso;
- persistência em banco de dados;
- endpoints para login, cadastro e recuperação de senha.

> Nenhuma dessas camadas foi implementada no código disponível.

## 15. Fluxos principais documentados

### 15.1 Fluxo de início e escolha de quiz

```text
Usuário abre o app
      ↓
Home renderiza CardsInicio
      ↓
CardsInicio carrega quizzes e progresso pela API
      ↓
Usuário inicia, continua ou refaz um quiz
      ↓
POST /quizzes/:id/acesso e navegação para /quiz/:id
      ↓
Quiz carrega perguntas pela API
```

### 15.2 Fluxo de pergunta

```text
Usuário seleciona alternativa
      ↓
Estado selecionada é atualizado
      ↓
Usuário clica em Confirmar resposta
      ↓
POST /quizzes/:id/responder valida resposta
      ↓
backend retorna resultado e explicação
      ↓
progresso e perguntas_respondidas são salvos na API
      ↓
interface mostra feedback visual
```

### 15.3 Fluxo de progresso

```text
Usuário conclui ou avança no quiz
      ↓
Progresso é salvo no backend
      ↓
Página de progresso combina quizzes e progresso pela API
      ↓
React renderiza estatísticas e status por tema
```

## 16. Limitações e pendências

- Biblioteca ainda é informacional.
- A URL da API está definida diretamente em `src/services/api.js` e deve ser configurada para cada ambiente antes da publicação.
- Não há suíte de testes com Jest, Vitest ou Testing Library identificada.

## 17. Instalação e execução

### Dependências

O projeto usa as dependências presentes em `package.json`:

```json
{
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.4"
  },
  "devDependencies": {
    "vite": "^8.3.0",
    "@vitejs/plugin-react": "^6.1.1",
    "eslint": "^10.10.0"
  }
}
```

### Execução local

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

## 18. Variáveis de ambiente

Não foi encontrado um arquivo `.env` ou configuração de variáveis de ambiente no repositório. O projeto atual não depende de variáveis de ambiente para funcionar localmente.

Se a solução futuramente consumir API, o mais provável é que seja criado um padrão como:

```env
VITE_API_URL=https://api.exemplo.com
```

> Este exemplo é fictício e não representa implementação real no projeto.

## 19. Próximas etapas sugeridas

1. Expandir os materiais da Biblioteca.
2. Adicionar testes automatizados para os fluxos de interface e API.
3. Configurar a URL da API por ambiente antes da publicação.

## 20. Glossário técnico

- Component: unidade visual e lógica do React.
- Route: mapeamento de URL para elemento renderizado.
- Hook: função do React para estado e efeitos.
- Props: dados passados de um componente pai para um filho.
- JSX: sintaxe de marcação usada em componentes React.
- localStorage: armazenamento local no navegador.
- SPA: Single Page Application, fluxo em página única com navegação client-side.

## 21. Conclusão

O projeto ACS reúne frontend React autenticado, API Flask e persistência PostgreSQL para quizzes e progresso. A interface e os serviços descritos nesta documentação refletem a integração atual; a configuração de produção deve ainda considerar a URL da API e a infraestrutura do ambiente.
