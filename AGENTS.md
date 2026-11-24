# Orientações para trabalhar no Sistema ACS

## Escopo e fontes

Este é o guia geral do repositório, elaborado a partir do código e das configurações inspecionados em 24/11/2026. Leia também [backend/AGENTS.md](backend/AGENTS.md) e [frontend/AGENTS.md](frontend/AGENTS.md) ao alterar essas áreas. O [catálogo de constantes e estados](docs/catalogo_sistema.md) complementa este arquivo.

Documentação existente: [execução do backend](docs/orientacoes_backend.md), [rotas](docs/orientacoes_rotas.md), [README](README.md) e [README do backend](backend/README.md). Há divergências no `frontend/README_TECNICO.md` e nos textos de privacidade; confira a seção de pontos em aberto antes de usá-los como referência. Atualize estes guias quando contratos ou convenções mudarem.

## Visão geral e fluxos

Plataforma de educação para profissionais da saúde e comunidade, com temas de LGPD, letramento digital, segurança da informação e saúde digital.

- Cadastro público e login; JWT identifica a sessão. Recuperação de senha usa token temporário e SMTP.
- Usuário `Comum`: joga quizzes, retoma progresso, consulta materiais e edita o próprio perfil/foto.
- Usuário `ADM`: também gerencia usuários, quizzes/perguntas e categorias/materiais; a home mostra indicadores administrativos.
- O jogo confere respostas na API e salva o progresso em outra requisição. Didio usa falas prontas de `frontend/src/data/didio.js`; não há integração de IA.
- A biblioteca já tem CRUD, busca, filtro, paginação, upload, download e visualização de materiais.

## Stack e versões

| Área | Fonte e versões |
| --- | --- |
| Frontend | JavaScript ESM, JSX, React e React DOM `^19.2.8` (lock: `19.3.0`), React Router DOM `7.18.4` |
| Ferramentas web | Vite `8.3.0`, plugin React `6.1.1`, ESLint `^10.10.0` (lock: `10.12.0`); `frontend/package-lock.json` fixa a resolução |
| Backend | Python `3.12-slim` no Docker, Flask `3.1.3`, SQLAlchemy `2.0.51`, Flask-SQLAlchemy `3.1.1` |
| Banco e migrations | PostgreSQL `16`, psycopg2-binary `2.9.12`, Flask-Migrate `4.1.0`, Alembic `1.20.0` |
| Autenticação/e-mail | Flask-JWT-Extended `4.7.4`, Werkzeug `3.1.8`, Flask-Mail `0.10.0`, python-dotenv `1.2.2` |
| UI | CSS próprio e SVG/PNG/WebP; sem biblioteca de componentes, Tailwind ou TypeScript |

As versões Python estão em `backend/requirements.txt`. Embora Flask-Bcrypt/bcrypt estejam instalados, o hash efetivamente usado está em `app/utils/hash.py` e usa Werkzeug. Não há versão Node fixada pelo projeto: confira `engines` do lock; Vite exige `^20.19.0 || >=22.12.0` e o ESLint resolvido exige `^20.19.0 || ^22.13.0 || >=24`.

## Estrutura e destino de código novo

| Diretório | Responsabilidade |
| --- | --- |
| `backend/app/models/models.py` | Todos os oito models SQLAlchemy atuais |
| `backend/app/routes/` | Blueprints por domínio, validação HTTP e serialização |
| `backend/app/services/` | Autenticação, reset, e-mail e armazenamento da biblioteca |
| `backend/app/utils/` | Decorators, permissões, validadores, hash e fotos |
| `backend/migrations/versions/` | Alterações versionadas de schema |
| `backend/seed_*.py` | Seeds idempotentes de administrador, quizzes e biblioteca |
| `frontend/src/pages/{Auth,Home,Legal}/` | Páginas agrupadas por área |
| `frontend/src/components/`, `layouts/` | Componentes reutilizados e composição das rotas |
| `frontend/src/context/`, `services/`, `utils/`, `data/` | Estado global, API, funções auxiliares e textos estáticos |
| `frontend/src/assets/` | CSS por página/componente e imagens/ícones |
| `frontend/src/styles/responsive/` | Complementos responsivos importados por último em `main.jsx` |
| `docs/` | Guias compartilhados e referências detalhadas |

`node_modules/`, `dist/`, `.venv/`, `__pycache__/`, `.env` e uploads são dependências, saídas ou dados locais; não são fontes de convenções nem devem ser versionados. Não há diretório de testes ou pipeline de CI versionado.

## Instalar, executar e verificar

Na raiz, somente se ainda não existir `.env`:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

O Compose inicia banco e backend; o frontend roda em outro terminal:

```powershell
cd frontend
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

`npm ci` instala o lock existente; `npm install` também é documentado no projeto. `dev` executa `vite --host`; frontend padrão em `http://localhost:5173`, API em `http://localhost:5000`. Não há script `npm test` nem runner de testes configurado. O backend não tem lint ou comando de testes definidos; não declare essas verificações como existentes.

O entrypoint aguarda PostgreSQL, executa `flask --app app db upgrade`, `seed_quizzes.py`, `seed_admin.py`, `seed_library.py` e inicia `app.py`. Veja execução sem Docker e migrations em `backend/AGENTS.md`.

`docker compose down` preserva volumes. **`docker compose down -v` apaga banco e uploads**; não use como rotina de desenvolvimento. Preserve LF nos arquivos `.sh`, conforme `.gitattributes`.

## Ambiente

O Compose lê `.env` da raiz e injeta `DATABASE_URL` com host `db:5432`; a execução local do backend usa dotenv. Nunca copie segredos de arquivos `.env` para código, documentação, respostas ou logs. Os padrões abaixo vêm de exemplos/configuração, não de credenciais locais.

| Variável | Finalidade e padrão observado |
| --- | --- |
| `DB_PORT` | Porta externa do PostgreSQL: `5434`; interna: `5432` |
| `POSTGRES_USER`, `POSTGRES_DB` | Exemplo: `sistema_acs` |
| `POSTGRES_PASSWORD` | Senha local a configurar; sem fallback no Compose |
| `DATABASE_URL` | URI PostgreSQL, obrigatória na execução local; sem fallback no `Config` |
| `SECRET_KEY` | Segredo Flask; fallback de desenvolvimento `chave-temporaria-de-dev`; substituir fora de desenvolvimento |
| `JWT_SECRET_KEY` | Segredo JWT; sem fallback explícito no `Config` |
| `SEED_ADMIN` | Código: `false`; exemplo da raiz: `true` |
| `ADMIN_EMAIL`, `ADMIN_SENHA` | Obrigatórias quando o seed está ativo; código usa string vazia como padrão. Credenciais de demonstração estão no exemplo da raiz |
| `FRONTEND_URL` | Base do link de reset: `http://localhost:5173` |
| `RESET_SENHA_EXPIRA_MINUTOS` | Validade do token: `30` |
| `MAIL_SERVER`, `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP; sem padrão no código, vazios no exemplo da raiz |
| `MAIL_PORT` | `587` |
| `MAIL_USE_TLS` | Ativo apenas com texto exato `True`; exemplo da raiz: `False` |
| `MAIL_DEFAULT_SENDER` | Fallback para `MAIL_USERNAME` |
| `LIBRARY_UPLOAD_DIR` | `/app/uploads/library`; configurar caminho acessível ao executar fora do Docker |
| `LIBRARY_MAX_FILE_SIZE` | `52428800` bytes (50 MiB) |
| `LIBRARY_MAX_VIDEO_SIZE` | `524288000` bytes (500 MiB), para MP4/WebM |

As três variáveis `LIBRARY_*` existem em `app/config.py`, mas não nos `.env.example`. O frontend usa `API_URL` fixa em `src/services/api.js`; `VITE_API_URL` não está implementada.

## Convenções e segurança comuns

- Leia o código relacionado e apresente um plano curto antes de alterar; faça mudanças pequenas dentro do escopo. Este guia documenta o estado observado e estabelece o fluxo solicitado para novas contribuições.
- Interface, mensagens de erro e orientação ao usuário em português. Preserve as chaves reais dos contratos: usuários/quizzes usam português; biblioteca usa inglês.
- Python: quatro espaços, funções/arquivos em `snake_case`, classes em PascalCase e constantes em maiúsculas. Frontend: componentes em PascalCase, funções/estado em camelCase; nomes de arquivo existentes são mistos, preserve a grafia exata dos imports.
- Não há Prettier, Black ou convenção global de aspas/ponto e vírgula. Siga o arquivo alterado e a configuração ESLint existente.
- Autorização deve ocorrer na API. Reutilize `autenticado`, `apenas_adm`, `eh_adm` e os validadores existentes; não confie em flags da interface nem na permissão contida no JWT.
- Senhas só passam por `hash_password`/`check_password`; nunca persistir senha em texto puro no navegador ou banco, nem registrar tokens de acesso/reset.
- Preserve limites, assinaturas, nomes UUID e proteção contra travessia de diretórios nos uploads. Não devolva caminhos físicos em JSON.
- Reutilize componentes e tokens visuais. Não adicione cores literais ou medidas arbitrárias no código novo; onde não há token, reutilize a regra da área ou proponha um token sem promover uma refatoração geral.
- Não alterar migrations já enviadas/aplicadas, schema pelo pgAdmin, dependências sem justificar, componentes duplicados ou dados mockados substituindo a API. Seeds não devem sobrescrever conteúdo administrado.
- Não mudar infraestrutura, conteúdo legal ou política de segurança apenas para eliminar inconsistências encontradas durante outra tarefa.

## Qualidade e checklist de entrega

- [ ] Código relacionado, guias da área e contratos consultados; alteração dentro do escopo.
- [ ] Constantes e validações de frontend/backend mantidas coerentes.
- [ ] Autenticação, permissão e propriedade verificadas no backend quando aplicáveis.
- [ ] Layout/teclado, carregamento, erro, vazio e tema escuro conferidos quando a interface mudar.
- [ ] `npm run lint` e `npm run build` executados quando houver mudança web; falhas existentes relatadas.
- [ ] Alterações Python verificadas e fluxos afetados exercitados em ambiente apropriado; migrations revisadas antes de aplicar.
- [ ] Testes existentes executados se forem introduzidos no futuro; não inventar comando de teste atual. Para novos testes, priorizar comportamento e regressões, registrando o runner escolhido.
- [ ] Sem segredos, dados locais, saídas de build ou refatorações não solicitadas no diff.
- [ ] Entrega informa arquivos, comportamento, verificações, limitações, decisões e variáveis novas.

## Pontos em aberto e inconsistências

1. **Documentação:** `frontend/README_TECNICO.md` mistura estados antigos e atuais de login, cadastro, reset, perfil e biblioteca. `docs/orientacoes_rotas.md` não inclui `/library`; o guia Docker omite o seed da biblioteca. Decidir a revisão desses documentos.
2. **Privacidade:** `src/data/documentosLegais.js` contém responsável/DPO por preencher e descreve progresso/foto em localStorage, enquanto o código usa PostgreSQL e uploads. Também menciona bloqueio de login sem implementação correspondente na API. Definir textos e responsáveis reais.
3. **Produção:** API fixa em localhost, domínio ngrok em `vite.config.js`, `CORS(app, ...)` sem restrição explícita de origens, servidor Flask em debug e seeds de desenvolvimento. Definir configuração de implantação, origens, chaves e execução de produção; o repositório não fornece esse fluxo.
4. **Testes:** não há suíte automatizada, runner backend ou CI. Definir abordagem antes de documentar comandos como obrigatórios.
5. **Design:** não há escala global de espaçamento, raios ou tipografia; há valores literais, sobreposições CSS e estilos antigos da biblioteca. `--azul-fundo` é usado sem definição encontrada e Poppins é declarada sem carregamento de fonte encontrado. Decidir padronização visual e evitar ampliar a dívida em mudanças novas.
6. **Validação e erros:** algumas rotas usam `.get()`/`.strip()`/`int()` sem validar todos os tipos; duplicidade de e-mail retorna 400 ou 409 conforme a rota; datas têm formatos distintos. Definir contrato uniforme sem presumir que já exista.
7. **Biblioteca:** listagens retornam apenas categorias ativas/materiais publicados, inclusive para ADM; acesso direto por categoria/download não aplica os mesmos filtros. Definir política para inativos e rascunhos. Na atualização, arquivos antigos podem ser apagados antes do commit; decidir recuperação/consistência entre banco e disco.
8. **Progresso:** `responder` valida a resposta, mas o endpoint de progresso recebe contagens do cliente; não há histórico individual de respostas/tentativas nem validação completa entre acertos e perguntas respondidas. Definir o nível de integridade esperado.
9. **Acessibilidade:** há ARIA, foco e atalhos, mas não há contenção/restauração uniforme de foco dos modais nem verificação automatizada de contraste. Não declarar conformidade completa.
10. **Ambiente:** Python do Docker é 3.12, sem versão mínima local formal; biblioteca usa caminho absoluto de container por padrão. Definir política local e incluir variáveis faltantes nos exemplos.

## Limites da verificação desta análise

Foram percorridas as fontes e configurações versionadas dos dois módulos, documentação, migrations, seeds, estilos e metadados do lock. Dependências instaladas, saídas compiladas, binários de imagem e dados/segredos locais não foram tratados como código-fonte a ler integralmente. `npm run lint` e `npm run build` passaram. Sintaxe dos 30 arquivos Python e grafo das migrations foram conferidos sem aplicar mudanças no banco; a cabeça encontrada foi `8f21d3c7a64b`. Execução integrada, SMTP, persistência, uploads e migração de banco com dados exigem validação funcional própria.
