# Executar com Docker

O Compose inicia frontend, API e PostgreSQL em containers separados. Para
essa opção completa, instale Git e Docker Desktop com containers Linux.
Node, Python e PostgreSQL locais não são necessários. Faça primeiro a
[clonagem do projeto](README.md#1-baixar-o-projeto).

## 1. Configurar

Com Docker Desktop aberto, execute na raiz:

```powershell
docker --version
docker compose version
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Edite o `.env` da **raiz** e confira:

- `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`: dados do banco novo.
- `DB_PORT`: porta publicada na máquina; o exemplo usa `5434`.
- `SECRET_KEY` e `JWT_SECRET_KEY`: substitua os exemplos por chaves aleatórias distintas.
- `SEED_ADMIN`, `ADMIN_EMAIL` e `ADMIN_SENHA`: criação opcional de administrador;
  configure suas credenciais de desenvolvimento antes de iniciar.
- `FRONTEND_URL`: mantenha `http://localhost:5173` neste ambiente.

Se tiver Python, gere cada chave com
`python -c "import secrets; print(secrets.token_hex(32))"`.
Como o Compose monta uma URL com os dados do banco, use uma senha local longa
sem caracteres reservados de URL, como `@`, `:` ou `/`, neste fluxo simples.
O Compose configura `DATABASE_URL` com o host interno `db:5432` automaticamente.
Não é necessário configurar `backend/.env`.

Deixe os campos de SMTP vazios como no exemplo se não for enviar e-mails.
O envio real de recuperação de senha precisa de SMTP configurado.

## 2. Iniciar

Na raiz:

```powershell
docker compose up --build
```

A primeira execução baixa imagens e instala dependências. O backend aguarda
o banco, aplica migrations e executa os seeds de quizzes, administrador
habilitado e biblioteca. O frontend instala dependências com `npm ci` e
inicia o Vite. Aguarde a inicialização dos serviços.

Abra [http://localhost:5173](http://localhost:5173). A API atende em
`http://localhost:5000`. O banco no container é independente de um PostgreSQL
instalado na máquina.

Antes de retomar um banco antigo, revise as
[orientações de migrations](../orientacoes_backend.md#migrations-e-regras-do-time):
a migration `91b7e02c4a6d` recria a tabela de progresso.

## 3. Consultar, parar e iniciar novamente

Em outro terminal na raiz:

```powershell
docker compose ps
docker compose logs --tail 100 backend frontend db
```

Para parar, use `Ctrl+C` no terminal do `up`. Para remover containers
preservando os dados:

```powershell
docker compose down
```

Inicie novamente com `docker compose up`. Quando Dockerfiles ou dependências
mudarem, use `docker compose up --build`.

Banco e uploads ficam em volumes. **Não use `docker compose down -v` para
atualizar: ele apaga os volumes, incluindo banco e uploads.** Mantenha o mesmo
diretório e nome de projeto Compose para reutilizar os dados. Alterar usuário
ou senha no `.env` não reconfigura um banco já inicializado no volume.

No pgAdmin, conecte com host `localhost`, porta `5434` (ou `DB_PORT`) e os dados
`POSTGRES_*` do `.env`. Não altere o schema manualmente: use migrations.

## Opção mista: Node local e API/banco no Docker

Instale Node.js 24 e configure o `.env` da raiz como acima. Na raiz, inicie
somente banco e backend:

```powershell
docker compose up --build db backend
```

Em outro terminal na raiz:

```powershell
cd frontend
npm ci
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173). Não inicie o container
`frontend` junto com o Vite local: ambos usam a porta `5173`. As chamadas
saem do navegador para `http://localhost:5000`; o hostname `backend` só existe
na rede interna do Docker.

## Problemas comuns

- **Docker não conecta:** abra o Docker Desktop e aguarde o mecanismo iniciar.
- **Porta do banco ocupada:** altere `DB_PORT`; a conexão interna continua `db:5432`.
- **Porta 5000 ou 5173 ocupada:** encerre o outro servidor antes de iniciar.
- **Frontend indisponível:** veja `docker compose logs frontend`; a instalação
  inicial precisa de acesso ao registro npm.
- **Erro na API:** veja `docker compose logs backend db` e confira o `.env`
  da raiz sem compartilhar senhas ou tokens dos logs.

Para verificar o frontend no container ativo:

```powershell
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

Na opção mista, execute `npm run lint` e `npm run build` dentro de `frontend/`
na máquina. Continue com os [comandos rápidos de Git](git.md).
