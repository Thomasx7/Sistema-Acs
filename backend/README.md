# Sistema ACS — Backend

![Flask](https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

API REST do Sistema ACS, desenvolvida com Flask, autenticação JWT e persistência em PostgreSQL. Disponibiliza autenticação, cadastro e gerenciamento de usuários, além de indicadores administrativos.

## Pré-requisitos

- Python 3.9 ou superior.
- PostgreSQL instalado e em execução, com um banco de dados e um usuário criados para a aplicação.
- Terminal aberto na pasta `backend` para executar os comandos abaixo.

## 1. Criar e ativar o ambiente virtual

No Windows, pelo Prompt de Comando:

```bash
py -m venv .venv
.venv\Scripts\activate
```

No Windows, pelo PowerShell:

```bash
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

No Linux ou macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 2. Instalar as dependências

Com o ambiente virtual ativado:

```bash
pip install -r requirements.txt
```

## 3. Configurar o arquivo `.env`

Copie `.env.exemplo` para `.env` e configure:

| Variável | O que preencher |
| --- | --- |
| `DATABASE_URL` | URL de conexão do PostgreSQL no formato `postgresql://usuario:senha@localhost:5432/sistema_acs`. |
| `SECRET_KEY` | Chave aleatória e privada para a aplicação. Configure uma chave própria. |
| `JWT_SECRET_KEY` | Chave aleatória e privada usada para assinar os tokens JWT. |
| `CORS_ORIGINS` | Origens autorizadas separadas por vírgula; em produção, use o domínio HTTPS da aplicação Vercel. |

O arquivo `.env` é carregado por `app/config.py` e não deve ser enviado ao repositório.

## 4. Aplicar alterações do banco de dados

O projeto possui Flask-Migrate e migrations versionadas. Não execute `db init` nem gere migrations localmente para o deploy. Com o PostgreSQL configurado e a partir de `backend`, aplique as migrations pendentes com:

```bash
flask --app app db upgrade
```

## 5. Endpoints

| Método e rota | Acesso |
| --- | --- |
| `POST /auth/login` | Público |
| `GET /auth/me` | Usuário autenticado |
| `GET /usuarios/` | Apenas ADM |
| `GET /usuarios/<id_usuario>` | Usuário autenticado: próprio cadastro ou ADM |
| `POST /usuarios/` | Público (cadastro) |
| `PUT /usuarios/<id_usuario>` | Usuário autenticado: próprio cadastro ou ADM; alterações de permissão/status somente ADM |
| `DELETE /usuarios/<id_usuario>` | Apenas ADM |
| `POST /admin/usuarios` | Apenas ADM (cria usuário com permissão e status definidos pelo administrador) |
| `GET /admin/dashboard` | Apenas ADM |

A permissão de administrador é `ADM`. Defina o primeiro administrador diretamente no banco:

```sql
UPDATE usuarios SET permissao = 'ADM' WHERE email = '...';
```

No login, e-mail inexistente e senha incorreta retornam a mesma mensagem (`Email ou senha inválidos`, HTTP 401); usuário inativo recebe HTTP 403. Não existe mais bloqueio por tentativas nem recuperação de senha por e-mail.

## 6. Executar o projeto

Com o ambiente virtual ativado e a partir de `backend`:

```bash
python app.py
```

A aplicação inicia em `http://localhost:5000` (porta `5000`). O servidor escuta em todas as interfaces e o modo debug está habilitado em `app.py`; use essa configuração somente em desenvolvimento.

## 7. Deploy no Render e Neon

O arquivo `render.yaml` na raiz configura o serviço web com `backend` como diretório raiz. O Render instala dependências com `pip install -r requirements.txt` e inicia a API com `gunicorn app:app`.

Configure no Render `DATABASE_URL` com a connection string PostgreSQL do Neon, `SECRET_KEY` e `JWT_SECRET_KEY` com valores aleatórios e independentes, e `CORS_ORIGINS` com o domínio HTTPS da aplicação Vercel. Antes de disponibilizar a API, execute `flask --app app db upgrade` no Shell do serviço para criar ou atualizar as tabelas.

## Fluxo de trabalho com o Git

Antes de começar qualquer modificação:

```bash
git pull origin teste
```

Após realizar as alterações:

```bash
git add .
git commit -m "Descrição das alterações feitas"
git push origin teste
```
