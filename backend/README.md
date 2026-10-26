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
| `MAIL_DEFAULT_SENDER` | Remetente dos e-mails; se vazio, usa `MAIL_USERNAME`. |
| `FRONTEND_URL` | Endereço base do frontend usado nos links enviados por e-mail, sem barra no final. O padrão é `http://localhost:5173`. |
| `RESET_SENHA_EXPIRA_MINUTOS` | Validade do link de redefinição em minutos. O padrão é `30`. |

As variáveis `MAIL_*` configuram o Flask-Mail. O arquivo `.env` é carregado por `app/config.py` e não deve ser enviado ao repositório.

## 4️⃣ Executar as migrations

O projeto já possui Flask-Migrate e a pasta `migrations`. Com o PostgreSQL configurado e a partir de `backend`, aplique as migrations existentes com:

```bash
flask --app app db upgrade
```

Não execute `db init` para um projeto que já possui a pasta de migrations. Quando os models forem alterados, crie uma nova revisão e aplique-a:

```bash
flask --app app db migrate -m "descricao da alteracao"
flask --app app db upgrade
```

## 5️⃣ Recuperação de senha

As rotas públicas de recuperação de senha são:

### Solicitar link — `POST /auth/esqueci-senha`

Corpo:

```json
{ "email": "usuario@example.com" }
```

Para qualquer e-mail válido, a resposta é sempre a mesma, mesmo que a conta não exista ou esteja inativa:

```json
{
  "mensagem": "Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha."
}
```

Um novo pedido só pode gerar outro e-mail após 60 segundos. O link anterior é invalidado quando um novo token é criado.

### Validar link — `POST /auth/redefinir-senha/validar`

Corpo:

```json
{ "token": "TOKEN_RECEBIDO_POR_EMAIL" }
```

Resposta para um token ainda válido:

```json
{ "valido": true }
```

Tokens inválidos, expirados ou já usados retornam HTTP 400:

```json
{ "erro": "Link inválido ou expirado" }
```

### Redefinir senha — `POST /auth/redefinir-senha`

Corpo:

```json
{
  "token": "TOKEN_RECEBIDO_POR_EMAIL",
  "senha": "minha-nova-senha"
}
```

Resposta de sucesso:

```json
{ "mensagem": "Senha redefinida com sucesso" }
```

O token é de uso único e expira após o intervalo definido por `RESET_SENHA_EXPIRA_MINUTOS`.

### Testar localmente

1. Configure `FRONTEND_URL=http://localhost:5173`, deixe `MAIL_SERVER` e `MAIL_USERNAME` vazios no `.env` local e aplique as migrations com `flask --app app db upgrade`.
2. Sem SMTP configurado, execute `python app.py` em modo debug. Ao solicitar a recuperação em `http://localhost:5173/esqueci-senha`, o backend registra o link no console. Esse comportamento de desenvolvimento não é usado quando `debug` está desativado.
3. Abra o link no navegador, defina uma nova senha e entre novamente em `/login`.

Com SMTP configurado, o link é enviado para o e-mail da conta ativa. A tela de solicitação não revela se o endereço está cadastrado.

## 6️⃣ Rodar o projeto

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
