# Orientações sobre as rotas do backend

## Estrutura e fluxo

- `backend/app/models/`: models SQLAlchemy que representam as tabelas.
- `backend/app/routes/`: blueprints HTTP agrupados por área.
- `backend/app/services/`: autenticação, e-mail e redefinição de senha.
- `backend/app/utils/`: autenticação/autorização, validações, permissões,
  hash de senha e tratamento de fotos.
- `backend/migrations/`: histórico versionado de alterações no schema.

Em geral, uma requisição chega à rota, passa pelo decorator de autenticação ou
permissão quando necessário, valida os dados recebidos, consulta ou altera o
banco com SQLAlchemy e retorna JSON. Respostas bem-sucedidas e erros usam os
códigos HTTP indicados nas tabelas abaixo.

## Autenticação e permissões

O login público é `POST /auth/login`. Se as credenciais e a conta ativa forem
válidas, a API retorna um JWT. Para rotas protegidas, envie o token no header:

```http
Authorization: Bearer <access_token>
```

O token expira após duas horas. O decorator de autenticação também carrega a
conta atual do banco e exige que ela esteja ativa. `ADM` pode acessar as
operações administrativas; `Comum` acessa as operações autenticadas permitidas
a qualquer usuário, normalmente os próprios dados e quizzes.

## Rotas

`Público` não exige autenticação; `Autenticado` exige um usuário ativo;
`ADM` exige a permissão administrativa; `ADM ou próprio` permite ao ADM agir
sobre usuários ou ao usuário acessar seus próprios dados, conforme indicado.

### Autenticação

| Método | Caminho | Acesso | O que faz |
| --- | --- | --- | --- |
| POST | `/auth/login` | Público | Valida credenciais e retorna JWT e dados básicos do usuário. |
| GET | `/auth/me` | JWT válido | Retorna os dados do usuário do token. |
| POST | `/auth/esqueci-senha` | Público | Solicita um link de redefinição para conta ativa. |
| POST | `/auth/redefinir-senha/validar` | Público | Verifica se o token de redefinição ainda é válido. |
| POST | `/auth/redefinir-senha` | Público | Define nova senha usando token válido. |

### Usuários

| Método | Caminho | Acesso | O que faz |
| --- | --- | --- | --- |
| POST | `/usuarios/` | Público | Cadastra usuário comum ativo. |
| GET | `/usuarios/` | ADM | Lista os usuários. |
| POST | `/usuarios/admin` | ADM | Cria usuário informando nome, e-mail, senha, permissão e status. |
| PUT | `/usuarios/admin/<id_usuario>` | ADM | Atualiza dados de usuário; não permite alterar a própria senha, permissão ou status por essa rota. |
| GET | `/usuarios/<id_usuario>` | ADM ou próprio | Consulta os dados de um usuário. |
| PUT | `/usuarios/<id_usuario>` | ADM ou próprio | Atualiza dados; usuário comum só altera a própria conta. Mudança de permissão/status é exclusiva de ADM e não pode ser feita na própria conta; ao trocar a própria senha, exige `senha_atual`. |
| DELETE | `/usuarios/<id_usuario>` | ADM | Exclui outro usuário; não permite excluir a própria conta. |
| POST | `/usuarios/foto-perfil` | Autenticado | Envia a foto de perfil no campo `foto` (PNG, JPG, JPEG ou WEBP, até 2 MB). |
| DELETE | `/usuarios/foto-perfil` | Autenticado | Remove a própria foto de perfil. |

### Administração

| Método | Caminho | Acesso | O que faz |
| --- | --- | --- | --- |
| GET | `/admin/dashboard` | ADM | Retorna totais de usuários, contas ativas/inativas, administradores e cadastros recentes. |

### Quizzes

| Método | Caminho | Acesso | O que faz |
| --- | --- | --- | --- |
| GET | `/quizzes` | Autenticado | Lista quizzes sem as perguntas. |
| GET | `/quizzes/<id_quiz>` | Autenticado | Consulta quiz e perguntas; para usuário comum, oculta a alternativa correta. |
| POST | `/quizzes` | ADM | Cria quiz e perguntas opcionais no mesmo pedido. |
| PUT | `/quizzes/<id_quiz>` | ADM | Atualiza nome e/ou descrição do quiz. |
| DELETE | `/quizzes/<id_quiz>` | ADM | Exclui quiz e dados relacionados. |
| POST | `/quizzes/<id_quiz>/perguntas` | ADM | Adiciona pergunta e alternativas a um quiz. |
| PUT | `/perguntas/<id_pergunta>` | ADM | Atualiza enunciado, explicação e/ou alternativas. |
| DELETE | `/perguntas/<id_pergunta>` | ADM | Exclui pergunta e atualiza a quantidade no quiz. |
| POST | `/quizzes/<id_quiz>/acesso` | Autenticado | Registra um acesso ao quiz. |
| GET | `/quizzes/<id_quiz>/admin` | ADM | Consulta quiz, perguntas e respostas corretas. |
| POST | `/quizzes/<id_quiz>/responder` | Autenticado | Confere alternativa e retorna resultado e explicação. |

### Progresso

| Método | Caminho | Acesso | O que faz |
| --- | --- | --- | --- |
| GET | `/progresso-quiz` | Autenticado | Lista o progresso do usuário atual. |
| GET | `/progresso-quiz/<id_quiz>` | Autenticado | Consulta o progresso do usuário para um quiz cadastrado. |
| POST, PUT | `/progresso-quiz/<id_quiz>` | Autenticado | Cria ou atualiza o progresso do usuário para um quiz. |

### Uploads

| Método | Caminho | Acesso | O que faz |
| --- | --- | --- | --- |
| GET | `/uploads/perfil/<nome_arquivo>` | Público | Serve uma imagem de perfil pelo nome de arquivo gerado pelo backend. |

## Exemplos

Os exemplos usam `http://localhost:5000` como base.

### Login

```http
POST /auth/login
Content-Type: application/json

{"email":"sistema.acs.oficial@gmail.com","senha":"Admin@123"}
```

Resposta resumida:

```json
{
  "mensagem": "Login realizado com sucesso",
  "access_token": "<JWT>",
  "usuario": {
    "id_usuario": 1,
    "nome": "Administrador",
    "email": "sistema.acs.oficial@gmail.com",
    "permissao": "ADM",
    "foto_perfil": null
  }
}
```

Use `access_token` como `Bearer` nas chamadas protegidas.

### Listar quizzes

```http
GET /quizzes
Authorization: Bearer <JWT>
```

Retorna uma lista com dados resumidos dos quizzes, por exemplo:

```json
[
  {
    "id": 1,
    "nome": "LGPD",
    "descricao": "...",
    "cor": "card-lgpd",
    "quantidade_perguntas": 4,
    "quantidade_acessos": 0,
    "criado_em": "..."
  }
]
```

### Responder pergunta

```http
POST /quizzes/1/responder
Authorization: Bearer <JWT>
Content-Type: application/json

{"id_pergunta":1,"id_alternativa":2}
```

Resposta:

```json
{
  "acertou": true,
  "alternativa_correta": {"id": 2, "texto": "..."},
  "explicacao": "..."
}
```

### Criar quiz como ADM

```http
POST /quizzes
Authorization: Bearer <JWT de ADM>
Content-Type: application/json

{
  "nome": "Quiz de exemplo",
  "descricao": "Descrição do quiz",
  "perguntas": [
    {
      "enunciado": "Qual alternativa está correta?",
      "explicacao": "Explicação da resposta.",
      "alternativas": [
        {"texto": "Correta", "correta": true},
        {"texto": "Incorreta", "correta": false}
      ]
    }
  ]
}
```

Retorna HTTP `201` com o quiz criado, pergunta, alternativas e indicação da
resposta correta. Cada pergunta precisa ter pelo menos duas alternativas e
exatamente uma marcada como correta.

## Erros comuns

| Código | Significado |
| --- | --- |
| 400 | Dados ausentes, inválidos ou incompatíveis com as validações da rota. |
| 401 | Token ausente, inválido ou expirado; também pode indicar conta inativa. |
| 403 | Usuário autenticado sem permissão para a operação. |
| 404 | Recurso não encontrado, como quiz, usuário ou pergunta. |

## Tabelas e relacionamentos

| Tabela | Conteúdo e relações |
| --- | --- |
| `usuarios` | Conta, e-mail único, hash da senha, permissão, status e caminho da foto. |
| `quizzes` | Nome único, descrição, cor e contadores. Tem várias perguntas e registros de progresso. |
| `perguntas` | Pertence a um quiz (`id_quiz`) e tem várias alternativas. |
| `alternativas` | Pertence a uma pergunta (`id_pergunta`) e indica se é correta. |
| `progresso_quiz` | Relaciona usuário e quiz (`id_usuario`, `id_quiz`); guarda status, respostas, acertos e percentual. |
| `redefinicoes_senha` | Guarda hash de token, validade e uso; cada registro pertence a um usuário (`id_usuario`). |

As relações de progresso, perguntas, alternativas e redefinições usam chaves
estrangeiras. A exclusão de usuário e de quiz remove dados relacionados conforme
as regras definidas nos models e no banco.
