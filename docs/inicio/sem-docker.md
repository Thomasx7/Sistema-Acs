# Executar sem Docker

PostgreSQL, API Python e frontend Node rodam na sua máquina. Faça primeiro
a [clonagem do projeto](README.md#1-baixar-o-projeto).

## 1. Conferir as instalações

Instale Node.js 24, Python 3.12 e PostgreSQL 16. Inclua Python no PATH durante
a instalação. Anote a senha do administrador `postgres` e a porta do banco
(normalmente `5432`). Abra um novo terminal e confira:

```powershell
node --version
npm --version
python --version
psql --version
```

Se `psql` não for encontrado, use o **SQL Shell (psql)** instalado com o
PostgreSQL ou adicione a pasta `bin` da instalação ao PATH. Mantenha o serviço
PostgreSQL iniciado.

## 2. Criar o banco

Conecte pelo terminal, informando a senha quando solicitada:

```powershell
psql -h localhost -p 5432 -U postgres -d postgres
```

No prompt PostgreSQL, execute os comandos abaixo para um **ambiente novo**.
Troque a senha de exemplo pela sua senha local antes de executar:

```sql
CREATE USER sistema_acs WITH PASSWORD 'troque_esta_senha_local';
CREATE DATABASE sistema_acs OWNER sistema_acs;
\q
```

Se usuário ou banco já existirem, use os dados existentes ou escolha outro
nome. Não exclua bancos para repetir o tutorial. As migrations criarão as
tabelas; não é necessário criá-las manualmente no pgAdmin.

Também é possível usar outro PostgreSQL acessível: obtenha host, porta,
usuário, senha e banco e configure a URL abaixo. O usuário precisa de permissão
para criar e alterar tabelas no banco de desenvolvimento escolhido.

## 3. Preparar a API

Em um terminal na raiz do repositório:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Edite `backend/.env`. Ajuste a conexão e substitua as duas chaves por valores
aleatórios distintos:

```dotenv
DATABASE_URL=postgresql://sistema_acs:troque_esta_senha_local@localhost:5432/sistema_acs
SECRET_KEY=SUBSTITUA_POR_UMA_CHAVE_ALEATORIA
JWT_SECRET_KEY=SUBSTITUA_POR_OUTRA_CHAVE_ALEATORIA
FRONTEND_URL=http://localhost:5173
LIBRARY_UPLOAD_DIR=./uploads/library
```

Gere cada chave com o comando abaixo e copie cada resultado para a variável
correspondente no `.env`:

```powershell
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
```

Se a senha tiver caracteres reservados de URL, como `@`, `:` ou `/`, codifique-os
no trecho da senha da `DATABASE_URL` (por exemplo, `@` vira `%40`). Use a porta
da sua instalação; `5434` é a porta publicada pelo Compose, enquanto instalações
locais normalmente usam `5432`.

O diretório relativo de uploads acima funciona executando a API dentro de
`backend/`, como neste guia. Fotos ficam em `backend/uploads/perfil/`.

Para iniciar sem SMTP, deixe `MAIL_SERVER`, `MAIL_USERNAME`, `MAIL_PASSWORD`
e `MAIL_DEFAULT_SENDER` vazios e configure `MAIL_USE_TLS=False` no `.env`.
Para envio real, use os dados fornecidos pelo seu serviço de e-mail.

Para criar um administrador inicial, acrescente ao mesmo `.env` e substitua
e-mail e senha pelos seus valores de desenvolvimento:

```dotenv
SEED_ADMIN=true
ADMIN_EMAIL=admin@example.com
ADMIN_SENHA=troque_esta_senha_admin
```

Sem essa configuração, o seed de administrador fica desativado. O cadastro
na interface cria usuários comuns.

## 4. Criar tabelas e iniciar a API

Ainda em `backend/`, com o banco ativo:

```powershell
.\.venv\Scripts\python.exe -m flask --app app db upgrade
.\.venv\Scripts\python.exe seed_quizzes.py
.\.venv\Scripts\python.exe seed_admin.py
.\.venv\Scripts\python.exe seed_library.py
.\.venv\Scripts\python.exe app.py
```

Confira se cada comando concluiu sem erro antes do próximo. Os seeds criam
quizzes, administrador habilitado e categorias iniciais ausentes. Materiais
podem ser adicionados pela interface administrativa.
Mantenha esse terminal aberto: a API atende em `http://localhost:5000`.
Usar o executável da `.venv` diretamente dispensa ativar o ambiente virtual.

Este passo é para um banco novo. Antes de atualizar um banco antigo, revise
as [orientações de migrations](../orientacoes_backend.md#migrations-e-regras-do-time):
a migration `91b7e02c4a6d` recria a tabela de progresso e apaga seus registros.

## 5. Iniciar o frontend com Node

Abra **outro terminal na raiz do repositório**:

```powershell
cd frontend
npm ci
npm run dev
```

`npm ci` instala as versões do lock existente. Abra
[http://localhost:5173](http://localhost:5173) e mantenha os dois terminais
abertos. A API está fixa em `http://localhost:5000` em
`frontend/src/services/api.js`; `VITE_API_URL` não está implementada.

## Próximas execuções

Mantenha o PostgreSQL ativo. Em um terminal dentro de `backend/`:

```powershell
.\.venv\Scripts\python.exe -m flask --app app db upgrade
.\.venv\Scripts\python.exe app.py
```

Em outro, dentro de `frontend/`:

```powershell
npm run dev
```

Se dependências mudarem após atualizar o repositório, repita a instalação
Python e/ou `npm ci`. Para encerrar, use `Ctrl+C` em cada terminal de servidor;
isso preserva banco e uploads.

## Problemas comuns

- **Falha de conexão:** confira serviço PostgreSQL, host, porta, senha e banco
  da `DATABASE_URL`.
- **Tabela não encontrada:** execute `db upgrade` dentro de `backend/`, usando
  a `.venv` e o `.env` deste ambiente.
- **Login ou carregamento falha:** confira o terminal da API e a porta `5000`.
  Abrir somente o Vite não inicia o backend.
- **Porta 5173 ocupada:** encerre a outra instância para usar o endereço esperado
  pelo guia e pelos links de recuperação de senha.
- **Erro de upload:** confira `LIBRARY_UPLOAD_DIR` e a permissão de escrita.

Continue com os [comandos rápidos de Git](git.md).
