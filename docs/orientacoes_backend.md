# Orientações para executar o backend

Este guia descreve o ambiente local de desenvolvimento com Docker Compose.
Cada pessoa executa seu próprio PostgreSQL e backend na própria máquina; os
containers e bancos não são compartilhados entre os integrantes.

## Pré-requisitos e configuração inicial

- Docker Desktop instalado e em execução.
- Git instalado.
- Clone atualizado do repositório.

Na raiz do projeto, crie seu arquivo local de ambiente:

```powershell
Copy-Item .env.example .env
```

O Compose lê o `.env` da **raiz**. Os valores do exemplo são para
desenvolvimento; altere as senhas se necessário e não envie o `.env` ao Git.
O antigo `backend/.env` só é usado ao executar o backend **sem Docker**.

## Primeiro uso

Na raiz do projeto:

```bash
docker compose up --build
```

O Compose inicia o PostgreSQL, aguarda o banco ficar saudável, aplica as
migrations, roda o seed dos quizzes e tenta criar o administrador padrão antes
de iniciar o Flask. O backend fica disponível em `http://localhost:5000`.

## Dia a dia

Depois de atualizar o repositório:

```bash
git pull
docker compose up
```

Use `docker compose up --build` quando houver alterações em
`backend/requirements.txt` ou `backend/Dockerfile`. As migrations pendentes
são aplicadas automaticamente a cada inicialização do backend.

Para encerrar sem apagar os dados, use `Ctrl+C` e, se necessário,
`docker compose down`. Os volumes mantêm o banco e os uploads.

## Recomeçar do zero

Na raiz:

```bash
docker compose down -v
docker compose up
```

O comando `down -v` apaga os volumes nomeados, incluindo o banco PostgreSQL e
as fotos de perfil. Na inicialização seguinte, as migrations criam o schema e
os seeds inserem os quatro quizzes padrão e o administrador, se habilitado.
Esse comando apaga também os dados e contas criados localmente.

## Usuário administrador de desenvolvimento

Com os valores padrão do `.env.example`:

- E-mail: `sistema.acs.oficial@gmail.com`
- Senha: `Admin@123`

O seed só é executado quando `SEED_ADMIN=true`. Se o e-mail já existir, nada
nele é alterado. A senha é armazenada com o mesmo hash usado pelo cadastro e
login. Essa conta e senha são **somente para desenvolvimento**: não use essa
configuração em produção; desative o seed (`SEED_ADMIN=false`) e configure
credenciais apropriadas.

## Variáveis de ambiente

O `.env.example` da raiz contém os valores necessários:

| Variável | Uso |
| --- | --- |
| `DB_PORT` | Porta do PostgreSQL publicada na máquina. Padrão `5434`; o container sempre usa `5432`. |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Usuário, senha e banco inicial do PostgreSQL. |
| `SEED_ADMIN` | Ativa (`true`) ou desativa (`false`) a criação do administrador padrão. |
| `ADMIN_EMAIL`, `ADMIN_SENHA` | E-mail e senha do administrador inicial. |
| `SECRET_KEY`, `JWT_SECRET_KEY` | Chaves locais de exemplo para Flask e JWT; substitua-as no ambiente local. |
| `FRONTEND_URL` | Endereço do frontend, usado nos links de redefinição de senha. Padrão `http://localhost:5173`. |
| `RESET_SENHA_EXPIRA_MINUTOS` | Validade do link de redefinição de senha. |
| `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_USE_TLS`, `MAIL_DEFAULT_SENDER` | Configuração opcional de SMTP. Sem SMTP, o envio real de e-mail não está configurado. |
| `DATABASE_URL` | O Compose monta essa URL para o backend usando o host `db` e a porta interna `5432`; não use `localhost` nessa conexão. |

O banco do Docker é independente do PostgreSQL já instalado na máquina. A
porta publicada padrão é `5434` porque `5432` e `5433` podem estar ocupadas.
Se outra porta estiver ocupada, altere `DB_PORT` no `.env`.
Para evitar problemas ao montar a URL de conexão, mantenha usuário e senha do
PostgreSQL sem caracteres reservados de URL, como `@`, `:` ou `/`.

## Usar o pgAdmin

Para consultar o banco local do container, conecte o pgAdmin com:

- Host: `localhost`
- Porta: `5434`, ou o valor definido em `DB_PORT`
- Banco, usuário e senha: valores de `POSTGRES_DB`, `POSTGRES_USER` e
  `POSTGRES_PASSWORD` no `.env`

Use o pgAdmin **apenas para consulta**. Nunca altere o schema ou edite dados
de aplicação por ele; migrations e a API são a fonte compartilhada de mudanças.

## Migrations e regras do time

Gere uma migration dentro do container depois de alterar um model:

```bash
docker compose exec backend flask --app app db migrate -m "descricao"
```

Revise o arquivo gerado, aplique-o localmente (ou reinicie o backend), e
commite a migration junto com as alterações de código. Faça push antes de o
parceiro dar pull e executar `docker compose up`.

- Nunca altere o schema pelo pgAdmin.
- Nunca edite uma migration que já foi enviada; crie outra migration.
- Se houver mais de uma cabeça de migration, confira com
  `docker compose exec backend flask --app app db heads` e resolva criando a
  migration de merge:
  `docker compose exec backend flask --app app db merge heads -m "merge"`.
- Dados de teste importantes e compartilhados devem ser adicionados a um seed
  idempotente, não inseridos manualmente no banco.
- O seed existente dos quizzes cria os quizzes ausentes e não altera quizzes
  que já existam, inclusive os editados pelo ADM.

**Atenção:** a migration `91b7e02c4a6d` recria a tabela `progresso_quiz` e
apaga os registros de progresso existentes nela. A migration já enviada não
deve ser editada. Em um banco que já possua esses dados, avalie o impacto antes
de atualizar.

## Frontend

Em outro terminal, inicie o Vite na pasta `frontend`:

```bash
npm install
npm run dev
```

O frontend usa `http://localhost:5000` como URL da API. O Vite fica, por
padrão, em `http://localhost:5173`, origem aceita pelo backend.

## Problemas comuns

- **Porta do PostgreSQL ocupada:** altere `DB_PORT` no `.env` (por exemplo,
  `5435`) e use essa porta também no pgAdmin. A conexão interna do backend
  continua em `db:5432`.
- **Erro de fim de linha no entrypoint:** mantenha o arquivo com LF; a regra
  `.gitattributes` (`*.sh text eol=lf`) aplica isso ao Git. Se preciso, faça
  pull novamente após a regra ser versionada.
- **Backend inicia antes do banco:** o Compose espera o healthcheck do
  PostgreSQL, e o entrypoint também aguarda a conexão antes das migrations.
  Confira os logs com `docker compose logs backend db`.
- **Dependências ou Dockerfile mudaram, mas o container não atualizou:**
  execute `docker compose up --build`.
- **A porta 5000 está ocupada:** encerre o processo que a utiliza antes de
  iniciar o backend; o frontend está configurado para acessar essa porta.
