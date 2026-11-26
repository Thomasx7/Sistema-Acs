# Sistema ACS

Plataforma de educação para profissionais da saúde e comunidade, com quizzes
e materiais sobre LGPD, letramento digital, segurança da informação e saúde digital.

Usuários podem estudar, retomar quizzes, acompanhar o progresso e editar seu
perfil. Administradores também gerenciam usuários, quizzes e a biblioteca.
O projeto usa **React + Vite**, **Python + Flask** e **PostgreSQL**.

## Começar do zero

O [guia de início](docs/inicio/README.md) reúne os pré-requisitos, a clonagem
e a configuração do projeto. Escolha como executar:

| Opção | Guia |
| --- | --- |
| Node, Python e PostgreSQL na máquina | [Sem Docker](docs/inicio/sem-docker.md) |
| Frontend, API e banco em containers | [Com Docker](docs/inicio/com-docker.md) |
| Node local e API/banco em containers | [Opção mista](docs/inicio/com-docker.md#opção-mista-node-local-e-apibanco-no-docker) |

Depois de iniciar os serviços, acesse [http://localhost:5173](http://localhost:5173).
A API atende em `http://localhost:5000`. Os guias descrevem desenvolvimento
local; a implantação em produção não faz parte deste fluxo.

## Organização e referências

- `frontend/`: interface React e comunicação com a API.
- `backend/`: API Flask, models, migrations e seeds.
- `docs/inicio/`: instalação, execução e [comandos rápidos de Git](docs/inicio/git.md).
- Referências técnicas: [execução](docs/orientacoes_backend.md),
  [rotas](docs/orientacoes_rotas.md) e [catálogo do sistema](docs/catalogo_sistema.md).
