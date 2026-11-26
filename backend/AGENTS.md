# Orientações do backend

Leia primeiro [../AGENTS.md](../AGENTS.md). Estas orientações valem para `backend/`.

## Arquitetura e execução

- `app/__init__.py:create_app()` inicializa SQLAlchemy, Mail, Migrate, JWT e CORS e registra os blueprints. `app.py` inicia Flask em `0.0.0.0:5000`, com debug.
- Models ficam em `app/models/models.py`; novas operações HTTP entram no blueprint do domínio em `app/routes/`. Regras reutilizáveis ficam em `services/` ou `utils/`, conforme os exemplos existentes.
- Imports usam `from app ...`; execute comandos locais dentro de `backend/`.

Sem Docker, com PostgreSQL disponível, crie um ambiente virtual e configure `backend/.env` sem sobrescrever um existente:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
# Se ainda não houver .env:
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m flask --app app db upgrade
.\.venv\Scripts\python.exe seed_quizzes.py
.\.venv\Scripts\python.exe seed_admin.py
.\.venv\Scripts\python.exe seed_library.py
.\.venv\Scripts\python.exe app.py
```

Configure `DATABASE_URL`, chaves JWT/Flask e, fora do container, `LIBRARY_UPLOAD_DIR` apropriado. `seed_admin.py` só cria conta com `SEED_ADMIN=true`; não altera conta existente. Seeds de quizzes e categorias consultam nomes e só criam ausentes.

## Modelo de dados e integridade

| Model/tabela | Campos e relações principais |
| --- | --- |
| `Usuarios` / `usuarios` | `id_usuario`, nome/e-mail até 100, e-mail único, hash `senha`, cadastro, permissão, status, `foto_perfil` relativo |
| `RedefinicoesSenha` / `redefinicoes_senha` | FK usuário com CASCADE, `token_hash` SHA-256 único, criação, expiração e uso |
| `Quiz` / `quizzes` | `id`, nome único até 150, descrição, classe de cor, contadores, criação; perguntas e progressos com delete-orphan/CASCADE |
| `Pergunta` / `perguntas` | FK quiz CASCADE, enunciado, explicação, ordem (padrão 1); alternativas CASCADE |
| `Alternativa` / `alternativas` | FK pergunta CASCADE, texto e booleano `correta` |
| `ProgressoQuiz` / `progresso_quiz` | FKs usuário/quiz CASCADE; par único `uq_progresso_usuario_quiz`; status, percentual, acertos, respondidas, total e atualização |
| `LibraryCategory` / `library_categories` | `name` (150) e `slug` (160) únicos, descrição, ícone, cor, posição, ativo, autor SET NULL e datas |
| `LibraryMaterial` / `library_materials` | FK categoria RESTRICT, título (200), descrição, tipo, URL (1000) ou arquivo (500), nome original, MIME, tamanho, checksum, thumbnail, tags, posição, publicado, autor SET NULL e datas |

O check `ck_library_material_url_or_file` exige exatamente um entre URL e caminho do arquivo. Categoria com materiais não pode ser excluída (409). Slugs são gerados por `gerar_slug`/`slug_unico`; alteração de nome pode alterar a URL da categoria.

Permissões, status e tipos são strings validadas na aplicação, não enums SQL. A regra de exatamente uma alternativa correta é validada nas rotas, não por constraint do banco. Consulte [catálogo](../docs/catalogo_sistema.md).

## Migrations

Após alterar models, na raiz do repositório, com container ativo:

```powershell
docker compose exec backend flask --app app db migrate -m "descricao"
docker compose exec backend flask --app app db heads
docker compose exec backend flask --app app db upgrade
```

Revise `upgrade()` e `downgrade()` em `migrations/versions/<revision>_<descricao>.py` e entregue com o model. Havendo múltiplas heads, inspecione e use o merge documentado: `docker compose exec backend flask --app app db merge heads -m "merge"`.

Cadeia observada: `70414d3679b5` → `91b7e02c4a6d` → `2d8af64c19be` → `8f21d3c7a64b`. A segunda migration **descarta e recria progresso_quiz**; não editar migrations enviadas nem aplicá-la cegamente em banco com dados. Schema não deve ser alterado por pgAdmin.

## API, autorização e respostas

- JSON de erro usual: `{"erro": "mensagem em português"}`; sucesso pode retornar objeto, lista ou `{"mensagem": "..."}` com dados. Não há envelope único.
- JWT Bearer dura duas horas. `@autenticado` consulta usuário ativo no banco e define `g.usuario_atual`; `@apenas_adm` acrescenta permissão `ADM`. Para rota administrativa nova, reutilize `@apenas_adm`.
- Cadastro público força defaults `Comum`/`Ativo`. Consulta/edição de usuário exige ADM ou proprietário; exclusão só ADM e nunca da própria conta. Não permitir ao ADM mudar o próprio status/permissão. A própria senha exige `senha_atual`; gestão administrativa não permite trocar a própria senha.
- Reutilize normalização de e-mail, `validar_email`, `validar_senha` e `validar_nome`; nome/e-mail até 100 e senha com no mínimo 6 caracteres. Não enfraqueça o backend por já existir validação no navegador.
- Para transações, siga os exemplos `_commit`/`_flush` de quizzes e tratamento de `SQLAlchemyError` com rollback e mensagens genéricas. Tratamento não está uniformizado nas rotas antigas; preserve contrato e registre falhas sem dados sensíveis.
- Datas de quizzes/biblioteca usam ISO; usuários/progresso usam `%Y-%m-%d %H:%M:%S`. Não trocar formatos sem verificar consumidores.

| Grupo | Rotas principais e acesso |
| --- | --- |
| `/auth` | POST login, esqueci-senha, redefinir-senha/validar, redefinir-senha públicos; GET me exige JWT e consulta conta |
| `/usuarios` | POST `/` público; GET `/`, POST `/admin`, PUT `/admin/<id>` e DELETE `/<id>` ADM; GET/PUT `/<id>` ADM ou próprio; POST/DELETE `/foto-perfil` autenticado |
| `/admin` | GET `/dashboard` ADM |
| `/quizzes` | GET lista/detalhe, POST `/<id>/acesso` e `/<id>/responder` autenticados; POST/PUT/DELETE quiz, GET `/<id>/admin` e POST `/<id>/perguntas` ADM |
| `/perguntas/<id>` | PUT/DELETE ADM |
| `/progresso-quiz` | GET lista e GET/POST/PUT `/<id_quiz>` do usuário autenticado |
| `/uploads/perfil/<nome_arquivo>` | GET público, nome UUID e extensão controlados |
| `/library/categories` | GET autenticado; POST ADM; PUT/PATCH/DELETE `/<id>` ADM |
| `/library/categories/<valor>/materials` | GET autenticado; categoria por ID ou slug |
| `/library/materials` | POST ADM; PUT/PATCH/DELETE `/<id>` ADM; GET `/<id>/download` autenticado |

Apenas listagem de materiais tem paginação no servidor: `page=1`, `per_page=12` (1–100), `type` e `search` no título. Resposta: `{category, items, page, pages, total}`. Listas de usuários/quizzes/progresso/categorias retornam arrays sem paginação.

Cada pergunta precisa de ao menos duas alternativas e uma única `correta=true`. Confirme vínculo pergunta→quiz e alternativa→pergunta em `responder_pergunta`; não expor `correta` na consulta comum. A explicação já aparece na serialização da pergunta. Atualizar perguntas exige manter `quantidade_perguntas` coerente.

`salvar_progresso` recebe `status`, `progresso`, `acertos`, `total_perguntas` e `perguntas_respondidas`; rejeita booleanos nos campos inteiros e recalcula percentual/total usando o quiz atual. Sem registro, GET retorna progresso inicial sintético com `id_progresso=null`. Não há tabela de tentativas históricas.

## Reset e arquivos

- Reset: resposta genérica para evitar enumerar e-mails; token aleatório `secrets.token_urlsafe(32)`, apenas hash no banco, limite de geração de 60 segundos por usuário, validade configurável e uso único com bloqueio de linha. Envio de e-mail em thread; sem SMTP e com debug, o código atual registra link local no log. Não reproduza esse comportamento em produção.
- Foto: campo multipart `foto`, PNG/JPG/JPEG/WebP, até 2 MiB, valida extensão e assinatura. Grava em `backend/uploads/perfil/<uuid>.<ext>` e persiste caminho relativo. Reutilize `foto_perfil.py` para resolver/excluir com contenção de diretório.
- Biblioteca: multipart `file` mais metadados, ou JSON para `LINK`/`YOUTUBE`. `library_storage.py` controla extensão, assinatura, limite e MIME; o tipo de arquivo é inferido pela extensão. Arquivos recebem UUID sob `<LIBRARY_UPLOAD_DIR>/<category_id>/`; checksum SHA-256. `serializar_material` omite `file_path` e checksum. Downloads passam pelo backend autenticado e usam attachment.
- URLs aceitam HTTP/HTTPS; YouTube é validado/normalizado pelo backend. Não confiar apenas no preview do frontend. Formatos completos no catálogo; a checagem SVG atual é parcial, não uma garantia de sanitização completa.

## Verificação

Não existe configuração de pytest, lint Python ou CI. Confira sintaxe e exercite os endpoints afetados com PostgreSQL de desenvolvimento, incluindo erros, usuário comum, ADM e recurso de outro usuário. Mudanças em models exigem revisar migration e integridade; mudanças em uploads exigem conferir banco e disco em falhas. Informe claramente quando ambiente integrado/SMTP não puder ser testado.
