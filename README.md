# Sistema ACS

Plataforma web de educação e capacitação voltada a profissionais da saúde e à
comunidade. O projeto aborda LGPD, letramento digital, segurança da informação
e saúde digital. O frontend usa React e Vite; o backend oferece uma API Flask
com PostgreSQL, autenticação, quizzes, usuários e progresso.

## Funcionalidades

- Interface de quizzes, progresso e histórico.
- API com cadastro e login, recuperação de senha, perfis de usuário e permissões.
- Quizzes administráveis e progresso persistido no PostgreSQL.
- Fotos de perfil armazenadas pelo backend.

A experiência de estudo inclui escolha de temas, perguntas em sequência e
feedback de resposta. A interface também contém páginas de início, biblioteca,
progresso e autenticação.

## Tecnologias

- Frontend: React, JavaScript e Vite.
- Backend: Python, Flask e SQLAlchemy.
- Banco de dados: PostgreSQL.

## Executar

Com Docker Desktop em execução e o `.env` da raiz configurado (copie de
`.env.example` apenas se ainda não existir), execute na raiz:

```powershell
docker compose up --build
```

Esse comando inicia frontend, backend e PostgreSQL em containers separados.
Acesse `http://localhost:5173`; a API fica em `http://localhost:5000`.
O código local do frontend tem recarga automática. Banco e uploads continuam
nos volumes existentes; não use `docker compose down -v` para atualizar.

Consulte [docs/orientacoes_backend.md](docs/orientacoes_backend.md) para
configuração, preservação dos dados e execução do frontend separadamente.

Para entender a estrutura da API, autenticação, dados e rotas disponíveis,
consulte [docs/orientacoes_rotas.md](docs/orientacoes_rotas.md).

Como alternativa, inicie apenas banco/backend com
`docker compose up --build db backend` e execute `npm ci` e `npm run dev` na
pasta `frontend`, em outro terminal. Ele usa a API em `http://localhost:5000`.
