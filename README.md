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

Para executar o ambiente completo de desenvolvimento com Docker, consulte
[docs/orientacoes_backend.md](docs/orientacoes_backend.md). A documentação
também explica como executar o frontend separadamente.

Para entender a estrutura da API, autenticação, dados e rotas disponíveis,
consulte [docs/orientacoes_rotas.md](docs/orientacoes_rotas.md).

O frontend também pode ser iniciado na pasta `frontend` com `npm install` e
`npm run dev`. Ele usa a API em `http://localhost:5000`.
