# Orientações para executar o ambiente de desenvolvimento

Este guia descreve o ambiente local de desenvolvimento com Docker Compose.
Cada pessoa executa frontend, backend e PostgreSQL na própria máquina, cada
um no seu container; os containers e bancos não são compartilhados entre os
integrantes. Não é necessário instalar Node na máquina para usar o Compose.

## Pré-requisitos e configuração inicial

- Docker Desktop instalado e em execução.
- Git instalado.
- Clone atualizado do repositório.

Na raiz do projeto, crie seu arquivo local de ambiente **somente se ainda não
existir** (preserve a configuração atual de quem já usa o sistema):

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
migrations e executa os seeds de quizzes, administrador (se habilitado) e
biblioteca antes de iniciar o Flask. O backend fica em `http://localhost:5000`.
O frontend inicia em outro container com Node 24 e Vite, disponível em
`http://localhost:5173`. Aguarde a instalação das dependências e a mensagem de
inicialização do Vite; não é necessário abrir outro terminal para o frontend.

## Dia a dia

Depois de atualizar o repositório:

```bash
git pull
docker compose up
```

Use `docker compose up --build` quando houver alterações nos Dockerfiles ou
nas dependências (`backend/requirements.txt`, `frontend/package.json` ou
`frontend/package-lock.json`). As migrations pendentes
são aplicadas automaticamente a cada inicialização do backend.

Para encerrar sem apagar os dados, use `Ctrl+C` e, se necessário,
`docker compose down`. Os volumes mantêm o banco e os uploads.

## Preservar os dados existentes

Ao atualizar, continue usando o mesmo diretório e nome de projeto Compose.
Os volumes `postgres_data` e `uploads_data` mantêm sua configuração e
identidade; adicionar o frontend não exige recriar o banco nem seus dados.
Não use `docker compose down -v`: ele apaga os volumes do banco e dos uploads.
Não remova volumes nem altere o nome de projeto com `-p`/`COMPOSE_PROJECT_NAME`
para atualizar o ambiente existente.

O novo volume `frontend_node_modules` armazena apenas dependências Linux do
frontend, separadas do `node_modules` do Windows. O serviço executa `npm ci`
a cada início para sincronizá-las com o lock; precisa de acesso ao registro
npm e pode demorar na primeira execução.

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

## Frontend e recarga automática

O Vite escuta em `0.0.0.0:5173` dentro do container, com porta fixa e
`strictPort`. O diretório `frontend` é montado para desenvolvimento e
`CHOKIDAR_USEPOLLING=true` permite detectar edições no Docker Desktop/Windows.
Os arquivos locais `.env` não são copiados para a imagem, e o serviço frontend
não recebe o `.env` do backend.

As chamadas à API partem do **navegador**, que usa `http://localhost:5000`.
Não substitua essa URL por `http://backend:5000`: esse hostname só existe na
rede interna do Docker. Este fluxo é para desenvolvimento na própria máquina.

### Alternativa sem container para o frontend

Na raiz, inicie apenas os serviços necessários:

```bash
docker compose up --build db backend
```

Em outro terminal, dentro de `frontend` (com Node compatível instalado):

```bash
npm ci
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
- **A porta 5173 está ocupada:** encerre o Vite que estava rodando no terminal
  antes de subir o frontend do Compose. O container não troca de porta sozinho.
- **Frontend ainda instalando ou falhou:** confira `docker compose logs frontend`.
  Para lint/build no container, use `docker compose exec frontend npm run lint`
  e `docker compose exec frontend npm run build`.
