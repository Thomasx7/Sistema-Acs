# Começar no Sistema ACS

Este guia acompanha a preparação do projeto do zero. Os comandos usam
**PowerShell no Windows**. Execute cada bloco na pasta indicada e aguarde
sua conclusão, exceto quando ele mantiver um servidor aberto.

## 1. Baixar o projeto

Instale Git e abra um terminal na pasta onde deseja guardar o projeto:

```powershell
git clone https://github.com/Thomasx7/Sistema-Acs.git
cd Sistema-Acs
```

Se já tiver o repositório, entre na pasta existente e consulte `git status`
antes de atualizar, para identificar alterações locais.

## 2. Escolher o ambiente

| Quero executar… | Preciso instalar… | Próximo passo |
| --- | --- | --- |
| Tudo na máquina | Node.js 24, Python 3.12 e PostgreSQL 16 | [Sem Docker](sem-docker.md) |
| Tudo em containers | Docker Desktop com containers Linux | [Com Docker](com-docker.md) |
| Frontend local e API/banco em containers | Node.js 24 e Docker Desktop | [Opção mista](com-docker.md#opção-mista-node-local-e-apibanco-no-docker) |

Use Node 24 para acompanhar o Dockerfile; npm acompanha a instalação do Node.
O pgAdmin é opcional e não substitui o servidor PostgreSQL.

O frontend inicia com `npm ci` e `npm run dev`, dentro de `frontend/`.
Login, quizzes e biblioteca também dependem da API e do banco em execução.
Não é necessário executar `npm init` nem criar outro projeto React.

## 3. Entender os arquivos de configuração

| Execução da API | Arquivo usado |
| --- | --- |
| No Docker | `.env` na raiz |
| Com Python na máquina | `backend/.env` |

Os `.env.example` são modelos. Copie apenas se o `.env` correspondente ainda
não existir e edite a cópia com seus valores. Cada guia mostra os detalhes.
Não envie `.env`, senhas, tokens, uploads ou bancos locais ao Git.
A recuperação de senha por e-mail precisa de SMTP configurado; cadastro e
login não dependem dele.

## 4. Conferir o primeiro acesso

Após concluir um dos guias:

1. Mantenha os serviços ativos e abra [http://localhost:5173](http://localhost:5173).
2. Na tela de login, use a opção de cadastro para criar um usuário comum.
3. Entre, abra um quiz e confira a biblioteca e o perfil.
4. Para funções administrativas, use a conta configurada no seed de administrador.

O seed só cria o administrador com `SEED_ADMIN=true` e se o e-mail ainda não
existir. Reexecutá-lo não muda a senha nem a permissão de uma conta existente.

## 5. Verificar as alterações

Dentro de `frontend/`, com as dependências instaladas:

```powershell
npm run lint
npm run build
```

Esses comandos verificam o código com ESLint e geram a compilação em `dist/`.
`npm run preview` permite conferir a compilação no endereço mostrado no
terminal; os recursos do sistema ainda dependem da API.
Não há comando `npm test` nem suíte de testes configurada no repositório.

Referências: [execução técnica](../orientacoes_backend.md),
[rotas da API](../orientacoes_rotas.md) e [catálogo](../catalogo_sistema.md).

Por fim, consulte os [comandos rápidos de Git e o fluxo de trabalho](git.md).
