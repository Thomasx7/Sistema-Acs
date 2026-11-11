# Backend do Sistema ACS

API REST desenvolvida com Flask e PostgreSQL. O ambiente local recomendado
usa Docker Compose; as instruções de configuração, execução, migrations e
solução de problemas estão em
[docs/orientacoes_backend.md](../docs/orientacoes_backend.md).

As rotas, permissões, autenticação, tabelas e exemplos de uso estão em
[docs/orientacoes_rotas.md](../docs/orientacoes_rotas.md).

## Execução sem Docker

O arquivo `backend/.env` é usado somente para execução local sem Docker.
Instale as dependências com `pip install -r requirements.txt`, configure essa
variável `DATABASE_URL` para um PostgreSQL acessível e aplique as migrations:

```bash
flask --app app db upgrade
python seed_quizzes.py
python app.py
```

O servidor de desenvolvimento escuta em `http://localhost:5000`. Para um
ambiente Docker, use o `.env` da raiz e siga o guia de backend.

## Observação sobre a migration inicial de quizzes

A migration `91b7e02c4a6d` recria a tabela `progresso_quiz` para adicionar a
relação com quizzes e, ao fazer isso, apaga os registros de progresso
existentes nessa tabela. Essa migration já foi enviada; não a edite. Consulte o
guia de backend antes de aplicá-la em um banco que já tenha dados.
