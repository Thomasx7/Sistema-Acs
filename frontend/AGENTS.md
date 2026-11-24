# Orientações do frontend

Leia primeiro [../AGENTS.md](../AGENTS.md). Estas orientações valem para `frontend/`.

## Organização e execução

- JavaScript ESM/JSX com componentes funcionais e hooks. `src/main.jsx` compõe StrictMode, ThemeProvider, BrowserRouter, AuthProvider e ScrollToTop.
- Páginas ficam em `src/pages/Auth`, `Home` e `Legal`; layouts em `src/layouts`; componentes compartilhados em `src/components`. Não há `components/library/` nem `src/hooks/` atualmente.
- Hooks de contexto ficam em `src/context/useAuth.js` e `useTheme.js`; objetos de contexto ficam em arquivos separados dos providers, como `auth-context.js`/`AuthContext.jsx`.
- Serviços por domínio ficam em `src/services`; validações e permissões em `src/utils`; textos legais/falas em `src/data`.
- Preserve a grafia dos arquivos, inclusive `cards-Inicio.jsx`, `Auth_css` e `Home`; não normalizar nomes em massa. Imports são relativos, sem alias configurado.

```powershell
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

ESLint usa recommended de JavaScript, React Hooks e React Refresh em `eslint.config.js`; ignora `dist`. Não há Prettier ou script de teste. `ngrok` está nas dependências e há um allowedHost específico em `vite.config.js`; não é um fluxo de implantação completo.

## Rotas, sessão e dados

`src/App.jsx` é a fonte das rotas:

| Acesso | Rotas e composição |
| --- | --- |
| Público, `AuthLayout` | `/login`, `/esqueci-senha`, `/redefinir-senha`; layout força tema claro |
| Público | `/termos`, `/privacidade` com `DocumentoLegal` |
| Autenticado, `PainelLayout` | `/home`, `/quiz`, `/quiz/:id`, `/biblioteca`, `/biblioteca/:slug`, `/progresso`, `/perfil` |
| ADM | `/usuarios`, dentro de `ProtectedRoute permissao={PERMISSAO_ADM}` |
| Redirecionamentos | `/` → `/home`; desconhecido → `/login` |

Cadastro é um formulário alternável na página de login, sem rota `/cadastro`. Após cadastrar, retorna ao login sem autenticação automática.

- `AuthProvider` fornece `usuario`, `autenticado`, `carregando`, `login`, `cadastrar`, `logout`, `atualizarUsuario`; restaura usuário consultando `/auth/me`.
- `tokenStorage.js` é a única abstração para token: chave `acs-token` em sessionStorage. Perfil, foto e progresso vêm da API, sem persistência local desses dados.
- Reutilize `services/api.js`: `api.get/post/put/patch/delete`, Bearer, JSON/FormData e `ApiError(message, status, retryAfter)`. `status=0` representa falha de rede; 401 com token limpa sessão, 403 preserva sessão.
- `library.js` usa XHR para progresso de upload e fetch/blob para arquivos; essas chamadas não passam pelo tratamento central de expiração de `api.js`. Leve isso em conta ao alterar esse fluxo.
- `ThemeProvider` aceita apenas `light`/`dark`, aplica `data-theme` e `color-scheme` no `<html>`, inicia claro e não persiste a preferência. Para mudar a inicialização, conferir também script do `index.html` e `AuthLayout`.
- Em efeitos assíncronos, siga o sinalizador `cancelado` e remova listeners/timers/observers no cleanup. Revogue URLs blob de previews.

## Componentes e comportamento a preservar

- `CardsInicio` carrega quizzes/progresso, registra acesso antes de navegar e abre `QuizAdminModal` para ADM.
- `QuizJogo` em `pages/Home/quiz.jsx` retoma por `perguntas_respondidas`, valida resposta via backend e serializa gravações em `filaSalvamento`; refs impedem resposta duplicada. Use `key={quiz.id}` para reinicializar a sessão ao mudar quiz.
- `QuizAdminModal` gerencia perguntas persistidas ou rascunhos de quiz novo. A API aceita quiz vazio/descrição vazia, enquanto o formulário exige descrição e ao menos uma pergunta na criação; não confundir os contratos.
- `QuizItem` é reutilizado em `HistoricoQuiz` e Progresso; histórico exibe os cinco registros mais recentes.
- `PasswordField` já oferece alternância mostrar/ocultar. `Header`, `Sidebar`, `DocumentoLegal` e `DidioTutor` são as outras bases de composição.
- Biblioteca: categorias em `biblioteca.jsx`; materiais, menu, formulário, filtros e visualizador em `biblioteca-categoria.jsx`. O modo `FILE` do formulário é convertido em tipo persistido/`OTHER` antes de enviar.
- Perfil salva dados e foto em requisições separadas e atualiza AuthContext; use `montarUrlFoto` para URL pública da foto.
- Use estados explícitos de carregamento, erro, vazio e envio, como na biblioteca; mensagens via `role="status"`/`role="alert"`, ação de tentar novamente quando aplicável e botões desabilitados durante mutação. Não existe biblioteca global de toast; feedback é local.

## Design e CSS

Fonte dos tokens: `src/index.css`, com overrides em `:root[data-theme="dark"]`. Lista completa e valores de cor em [catálogo](../docs/catalogo_sistema.md).

| Uso | Tokens principais |
| --- | --- |
| Marca | `--azul` (#052373 claro), `--azul-secundario` (#0934AB), `--azul-profundo`, `--azul-claro` |
| Superfícies/texto | `--fundo` (#F3F6FC), `--superficie` (#FFFFFF), `--borda`, `--texto`, `--texto-suave`, `--texto-titulo`, `--texto-link` |
| Estados | `--sucesso`, `--sucesso-fundo`, `--sucesso-texto`, `--aviso`, `--aviso-fundo`, `--erro`, `--erro-fundo`, `--selecionado-fundo`, `--opcao-hover` |
| Quizzes | `--cor-lgpd`, `--cor-letramento`, `--cor-seguranca`, `--cor-saude`, `--cor-paleta-1` a `--cor-paleta-6`; classes atribuem `--cor-card` |
| Foco e camadas | `--foco-contorno`, `--foco-sombra`, `--foco-sidebar`; `--z-content:0`, `--z-header:10`, `--z-dropdown:20` |
| Sombras | `--sombra-card`, `--sombra-card-hover`, além dos tokens específicos de login/menu/sidebar |

- CSS de área: `assets/css/pages_css/`; de componentes: `assets/css/components_css/`; autenticação: `assets/css/Auth_css/`. Escopo por classes de área, como `.perfil` e `.quiz`.
- Reutilizar componentes, classes e tokens existentes; nunca inserir cores hex ou medidas arbitrárias em código novo. Há medidas literais antigas e não há tokens globais de espaçamento/raio: reutilize o padrão da área ou proponha token com finalidade explícita, sem inventar uma escala já existente.
- Exemplos observados: cards com superfície/borda/sombra, raios de 14–20px; botões com raios de 8–12px; badges/chips com 999px; gaps de 12/16/20/24px. São referências locais, não uma escala formal.
- Tipografia global declarada: `'Poppins', sans-serif`; títulos geralmente peso 600, tamanhos em rem/clamp. Não foi encontrado carregamento da fonte. Não adicionar outra família sem justificar.
- SVG inline e imagens de `assets/icons` compõem os ícones; não há pacote de ícones. Mantenha `currentColor`/tokens e descrição acessível quando necessário.
- Modais existentes usam overlay, `role="dialog"`, título, Escape e ações de cancelar/salvar; usuários usa `createPortal` e bloqueia rolagem. Não há Modal/Button/Card genéricos.
- Hover/foco/desabilitado seguem regras locais; preserve `:focus-visible`, contraste dos dois temas e estado de carregamento. Alternativas usam `selecionada`, `correta`, `errada`, `apagada`.
- `styles/responsive/index.css` é importado após os estilos principais. Breakpoints documentados: 1024/640/380px, com exceções de componente e container queries. Em celular a sidebar vira navegação inferior com safe-area; não cobrir o conteúdo.
- Reutilize `assets/css/animations.css` e preserve `prefers-reduced-motion`. Evite animar wrappers que alterem empilhamento de menus/overlays; o arquivo já trata esse caso no header.

## Acessibilidade e verificação

- Preserve labels associados, `aria-invalid`/`aria-describedby` em campos, nomes de botões de ícone, `aria-expanded` nos menus, texto alternativo e SVG decorativo com `aria-hidden`.
- Use controles nativos e mantenha Enter/Espaço nas linhas interativas de usuários, Escape nos menus/modais e setas/Home/End no menu de materiais.
- Barras reutilizadas expõem `role="progressbar"` e valores; feedback usa alert/status. Não depender só de cor para indicar acerto/erro.
- Verifique teclado, foco visível, tema claro/escuro, estados vazio/erro/carregando e telas pequenas quando houver mudança visual. Contenção/restauração de foco não é uniforme e não deve ser descrita como garantia existente.
- Execute lint/build antes da entrega de mudanças frontend. Não há Vitest/Jest/Testing Library configurados; novos testes devem ter runner e comandos documentados quando introduzidos.
