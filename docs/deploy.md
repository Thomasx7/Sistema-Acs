# Deploy: Vercel, Render e Neon

Este guia corresponde ao frontend `https://sistema-acs.vercel.app` e à API
`https://sistema-acs-5vql.onrender.com`. Ambos devem acompanhar a branch `main`.
O ambiente local com Docker continua separado deste fluxo.

## 1. Conferir o banco antes de publicar

Na Neon, confirme o projeto, a branch do banco e os dados existentes. Um compute
suspenso por inatividade pode reativar ao receber uma conexão; isso não significa
que seja necessário recriar o banco. Não apague banco, tabelas ou histórico para
resolver uma falha de deploy.

Se uma senha aparecer em prints ou mensagens, redefina a senha da role na Neon
e atualize `DATABASE_URL` na Render. Copie a conexão pelo botão **Connect** do
projeto correto, preservando os parâmetros TLS fornecidos, incluindo
`sslmode=require`. Não salve essa conexão no Git nem em variáveis `VITE_*`.

Antes de aplicar migrations em um banco com dados, faça backup e confira a
revisão instalada. Um banco vindo de outra versão pode ter migrations diferentes
das atuais; nesse caso, revise a compatibilidade antes de qualquer upgrade.
Não use `db stamp` para contornar revisões ausentes.

### Preparar tabelas e dados iniciais

Este procedimento não é executado pelo script de inicialização da Render.
Use um terminal administrativo com Python e as dependências do backend
instaladas, dentro de `backend/`. Para apontar somente esse terminal à Neon no
PowerShell, solicite a conexão sem deixá-la no histórico de comandos:

```powershell
$neonConnection = Read-Host "Cole a conexao PostgreSQL da Neon" -AsSecureString
$env:DATABASE_URL = [System.Net.NetworkCredential]::new("", $neonConnection).Password
.\.venv\Scripts\python.exe -m flask --app app db current
.\.venv\Scripts\python.exe -m flask --app app db heads
```

O `.env` local ainda fornece as demais configurações. A variável do terminal
tem prioridade para a conexão; ela será usada por todos os comandos de banco
nesse terminal até ser removida. Nunca exiba seu conteúdo.

A head atual é `8f21d3c7a64b`. Se houver erro de revisão desconhecida, pare para
analisar o histórico. Se não houver tabelas, `db current` pode não retornar
revisão. Confirme o estado do banco; esse resultado sozinho não prova que esteja vazio.

Em um **banco novo**, ou após revisar e aprovar a atualização de um banco com
backup, execute cada comando separadamente e confira o resultado:

```powershell
.\.venv\Scripts\python.exe -m flask --app app db upgrade
.\.venv\Scripts\python.exe seed_quizzes.py
.\.venv\Scripts\python.exe seed_library.py
```

A migration `91b7e02c4a6d` descarta e recria a tabela de progresso. Não a aplique
cegamente em banco existente. Migrations já enviadas não devem ser editadas.

O administrador é opcional: configure `SEED_ADMIN=true`, `ADMIN_EMAIL` e
`ADMIN_SENHA` nesse ambiente administrativo antes de executar `seed_admin.py`.
O seed não altera contas existentes. Não é necessário manter o seed ativo no
serviço de produção. Ao terminar a preparação, feche o terminal ou remova a conexão:

```powershell
Remove-Item Env:DATABASE_URL
Remove-Variable neonConnection
```

## 2. Configurar a Render existente

Não é necessário recriar o serviço. Em **Settings**, confira:

| Campo | Valor |
| --- | --- |
| Branch | `main` |
| Runtime | Python |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `sh render-start.sh` |
| Health Check Path | `/health` |

O script inicia Gunicorn na porta `PORT` fornecida pela Render. Ele não usa
o servidor Flask em debug, não aplica migrations e não executa seeds.
`gunicorn` está fixado nas dependências para Linux; o marcador de plataforma
dispensa sua instalação no Windows, onde ele não roda.

Os arquivos `.python-version` fixam a série Python `3.12`, acompanhando o Docker.
Se houver uma variável `PYTHON_VERSION` na Render, ela tem prioridade: remova-a
para usar o arquivo ou configure uma versão completa da série 3.12 suportada.

Em **Environment**, configure:

| Variável | Valor ou orientação |
| --- | --- |
| `DATABASE_URL` | Conexão secreta atualizada da Neon, com TLS |
| `APP_ENV` | `production` |
| `SECRET_KEY` | Chave aleatória própria, com pelo menos 32 caracteres |
| `JWT_SECRET_KEY` | Outra chave aleatória, com pelo menos 32 caracteres |
| `FRONTEND_URL` | `https://sistema-acs.vercel.app` |
| `CORS_ORIGINS` | `https://sistema-acs.vercel.app` |
| `SEED_ADMIN` | `false` |

Gere cada chave separadamente com `python -c "import secrets; print(secrets.token_hex(32))"`
em seu terminal e preencha o painel. Não copie os resultados para código ou chat.
A Render também define `RENDER=true`; o backend reconhece esse ambiente como
produção e valida chaves e origens mesmo sem `APP_ENV`.

`CORS_ORIGINS` aceita várias origens exatas separadas por vírgulas. Não inclua
`/login`, caminhos, curingas ou barras finais. Adicione outro domínio somente
quando ele também precisar acessar a API. Chaves de exemplo, origens HTTP e
origens com caminhos impedem a inicialização em produção.

Para recuperação de senha, configure SMTP (`MAIL_SERVER`, `MAIL_PORT`,
`MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_USE_TLS`, `MAIL_DEFAULT_SENDER`).
`MAIL_USE_TLS` usa o texto exato `True` quando necessário. O link de reset usa
`FRONTEND_URL`. Sem SMTP, não considere esse fluxo validado.

Depois que o código estiver no remoto e as configurações estiverem corretas,
faça o deploy e confira os logs. `gunicorn: command not found` indicava ausência
da dependência; um erro posterior de conexão ou schema precisa ser tratado
separadamente.

`GET /health` retorna `200` com `{"status":"ok"}` quando a API consegue
executar uma consulta simples no banco, ou `503` com resposta genérica quando
o banco está indisponível. Isso não verifica tabelas, migrations, SMTP ou uploads.

## 3. Configurar a Vercel

No projeto existente, confira:

| Campo | Valor |
| --- | --- |
| Production Branch | `main` |
| Root Directory | `frontend` |
| Framework | Vite |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 24.x |

`frontend/vercel.json` configura a compilação e o fallback para `index.html`,
permitindo abrir e recarregar rotas como `/login`, `/perfil` e `/biblioteca`.

O arquivo versionado `frontend/.env.production` contém **somente a URL pública**
da API. Isso permite compilar com o endereço correto mesmo sem acesso ao painel
da Vercel. Se existir `VITE_API_URL` no painel, ela tem prioridade: configure-a
como `https://sistema-acs-5vql.onrender.com`, sem ponto final, e faça novo deploy.
Variáveis `VITE_*` são públicas e incorporadas na compilação; nunca coloque
senhas, chaves JWT ou a conexão do banco nelas.

Em desenvolvimento, a interface continua usando `http://localhost:5000`.
Para outra API local, use `frontend/.env.local` com `VITE_API_URL`; não versione
esse arquivo. A compilação de produção exige uma URL configurada.

Você pode criar outro projeto em sua própria conta Vercel se as permissões
da integração Git permitirem. O endereço será diferente: ajuste `FRONTEND_URL`
e `CORS_ORIGINS` na Render. Publicar no endereço original exige acesso ao
projeto original. Não é necessário duplicar o banco para outro frontend.

## 4. Fotos e materiais no Neon Object Storage

O bucket privado escolhido é `acs-buckets`, em N. Virginia. Ele pertence ao
projeto criado para arquivos; o PostgreSQL existente continua no projeto
original. Não troque `DATABASE_URL` pela conexão do novo projeto.

Na Render, acrescente as variáveis abaixo. Cole os valores sem aspas, vírgulas
ou barras invertidas antes de `:`:

```dotenv
UPLOAD_STORAGE=s3
S3_BUCKET=acs-buckets
AWS_ENDPOINT_URL_S3=https://br-red-thunder-bcd119q5.storage.c-16.us-east-1.aws.neon.tech
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=SUBSTITUA_PELO_TOKEN_ID_DA_CREDENCIAL
AWS_SECRET_ACCESS_KEY=SUBSTITUA_PELO_S3_SECRET_ACCESS_KEY
```

Os dois últimos valores são **segredos**, não exemplos utilizáveis. No projeto
de arquivos da Neon, selecione a mesma branch do bucket e abra **Connect →
Storage**. Use/crie uma credencial com `storage:read` e `storage:write`.
O `token_id` corresponde a `AWS_ACCESS_KEY_ID`; o `s3_secret_access_key`
corresponde a `AWS_SECRET_ACCESS_KEY`. Configure-os diretamente na Render;
não envie prints com os valores visíveis. A senha PostgreSQL e uma chave da
API administrativa da Neon não substituem esse par de credenciais S3.

Se não houver opção no painel, siga o [fluxo oficial de credenciais](https://neon.com/docs/storage/authentication).
Credenciais e endpoint devem corresponder à branch que contém `acs-buckets`.
O backend valida a presença da configuração ao iniciar, mas a validade das
credenciais só é confirmada quando o bucket é acessado.

A dependência `boto3` permite acessar a API S3 compatível da Neon. O cliente
usa assinatura v4 e endereçamento por caminho, sem ACLs públicas. As chaves
dos objetos são `uploads/perfil/<uuid>.<ext>` para fotos e
`library/<categoria_id>/<uuid>.<ext>` para materiais. As URLs e os metadados
retornados ao frontend mantêm o contrato atual; materiais continuam exigindo
autenticação para download. Fotos continuam acessíveis pela rota pública de
perfil, como antes, embora o bucket seja privado.

Os arquivos passam pela API na Render. Não é necessário expor credenciais
na Vercel nem configurar acesso direto do navegador ao bucket. Limites,
assinaturas de arquivo e nomes UUID continuam sendo validados pelo backend.
`/health` verifica somente o PostgreSQL; não testa o armazenamento S3.

Na atualização de materiais, o arquivo anterior só é removido após o commit;
se o commit falhar, o novo arquivo é removido e o antigo é preservado. Se a
limpeza posterior falhar, a atualização permanece salva e um aviso é registrado.
Banco e bucket não compartilham uma transação; falhas de rede ainda podem
exigir conferir/remover objetos órfãos. O mesmo cuidado vale para exclusões.

No desenvolvimento local, mantenha `UPLOAD_STORAGE=local`, que dispensa
credenciais S3 e continua gravando fotos em `backend/uploads/perfil` e materiais
em `LIBRARY_UPLOAD_DIR`. Esse diretório é ignorado para materiais em modo S3.
Não use modo local para uploads persistentes na Render gratuita.

Ativar S3 **não copia arquivos antigos automaticamente**. Se houver arquivos
locais que precisem continuar disponíveis, copie-os para as chaves equivalentes
no bucket antes de mudar o modo. Os registros do banco não precisam de nova
migration. Não apague as cópias antigas antes de conferir o acesso no destino.

A Neon oferece 5 GB de Object Storage por projeto no plano gratuito e só
disponibiliza o recurso em regiões específicas; N. Virginia é compatível.
Confira limites e consumo no painel antes de carregar vídeos grandes.

## 5. Validar antes de disponibilizar

Para verificar inicialização, CORS, saúde, permissões e uploads sem acessar a
Neon, execute dentro de `backend/`:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Os testes usam `unittest` da biblioteca padrão e SQLite em memória; simulam
o S3 e falhas de banco, sem aplicar migrations ou acessar dados reais. Não
substituem a validação com PostgreSQL e com o bucket real.
No frontend, execute `npm run lint` e `npm run build` dentro de `frontend/`.

1. Confirme migrations e dados iniciais no banco correto.
2. Confira `/health` e os logs da Render.
3. Abra `/login` diretamente e recarregue a página na Vercel.
4. Teste cadastro, login, quiz, retomada de progresso e permissões de usuário/ADM.
5. Teste recuperação de senha após configurar SMTP.
6. Com as credenciais S3 configuradas, teste envio, acesso, substituição e
   exclusão de fotos/materiais, inclusive depois de reiniciar a API. Confira
   os objetos correspondentes no painel da Neon.

Não considere o deploy completo somente porque o build terminou. Mudanças na
branch `main` podem disparar deploy automático nos serviços conectados.

## Referências

- [Flask na Render](https://render.com/docs/deploy-flask)
- [Versão do Python na Render](https://render.com/docs/python-version)
- [Limitações do plano gratuito da Render](https://render.com/docs/free)
- [Vite e rotas SPA na Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Suspensão automática na Neon](https://neon.com/docs/introduction/scale-to-zero)
- [Limites do Neon Object Storage](https://neon.com/docs/storage/overview)
- [Autenticação do Object Storage](https://neon.com/docs/storage/authentication)
- [Compatibilidade S3](https://neon.com/docs/storage/s3-compatibility)
