# Sistema ACS — Backend

![Flask](https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

API REST do Sistema ACS, desenvolvida com Flask. Atualmente, disponibiliza endpoints para listar, consultar, criar, atualizar e excluir usuários, com persistência em PostgreSQL.

## 📋 Pré-requisitos

- Python 3.9 ou superior.
- PostgreSQL instalado e em execução, com um banco de dados e um usuário criados para a aplicação.
- Terminal aberto na pasta `backend` para executar os comandos abaixo.

## 1️⃣ Criar e ativar o ambiente virtual `.venv`

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

## 2️⃣ Instalar as dependências

Com o ambiente virtual ativado:

```bash
pip install -r requirements.txt
```

## 3️⃣ Criar e configurar o arquivo `.env`

Copie o exemplo para criar o arquivo local. No Windows, pelo Prompt de Comando:

```bash
copy .env.exemplo .env
```

No Windows, pelo PowerShell:

```bash
Copy-Item .env.exemplo .env
```

No Linux ou macOS:

```bash
cp .env.exemplo .env
```

Edite o `.env` e configure as variáveis usadas em `app/config.py`:

| Variável | O que preencher |
| --- | --- |
| `DATABASE_URL` | URL de conexão do PostgreSQL no formato `postgresql://usuario:senha@localhost:5432/sistema_acs`. Ajuste usuário, senha, host, porta e nome do banco conforme sua instalação. |
| `SECRET_KEY` | Uma chave aleatória e privada para a aplicação. O código tem um valor temporário padrão para desenvolvimento, mas configure sua própria chave. |
| `MAIL_SERVER` | Host do servidor SMTP, por exemplo `smtp.example.com`. |
| `MAIL_PORT` | Porta SMTP. O padrão do código é `587`. |
| `MAIL_USERNAME` | Usuário ou endereço de e-mail do servidor SMTP. |
| `MAIL_PASSWORD` | Senha ou senha de aplicativo do servidor SMTP. |
| `MAIL_USE_TLS` | Use `True` para habilitar TLS ou `False` para desabilitá-lo. O código compara o valor com a string `True`. |

As variáveis `MAIL_*` configuram o Flask-Mail; os endpoints atuais de usuários não enviam e-mails. Não há leitura de `FLASK_APP` ou `FLASK_ENV` no backend. O arquivo `.env` é carregado por `app/config.py` e não deve ser enviado ao repositório.

## 4️⃣ Executar as migrations

O projeto já possui Flask-Migrate, a pasta `migrations` e uma migration para criar a tabela `usuarios`. Com o PostgreSQL configurado e a partir de `backend`, aplique-a com:

```bash
flask --app app db init
```

Não é necessário inicializar as migrations existentes. Se futuramente os models forem alterados, crie uma nova revisão e aplique-a:

```bash
flask --app app db migrate -m "descricao da alteracao"
flask --app app db upgrade
```

## 5️⃣ Rodar o projeto

Com o ambiente virtual ativado e a partir de `backend`:

```bash
python app.py
```

A aplicação inicia em `http://localhost:5000` (porta `5000`). O servidor escuta em todas as interfaces e o modo debug está habilitado no `app.py`; use essa configuração somente em desenvolvimento.

## 🔄 Fluxo de trabalho com o Git
Quando estiver com o projeto em sua máquina, sempre siga o fluxo abaixo para evitar conflitos e manter o código atualizado.

### 1️⃣ Antes de começar qualquer modificação
```bash
git pull origin main # Baixa todas as atualizações do repositório remoto antes de começar a trabalhar.
```

### 2️⃣ Após realizar alterações
Adicione todos os arquivos modificados:
```bash
git add .
```
Crie um commit com uma mensagem descritiva:
```bash
git commit -m "Descrição das alterações feitas"
```
Envie suas mudanças para o repositório remoto:
```bash
git push origin main # Envia suas alterações para o repositório
```
