# Catálogo de constantes, tipos e estados

Complementa [AGENTS.md](../AGENTS.md). Caminhos abaixo são relativos à raiz. Valores são os observados no código em 24/11/2026; strings em colunas não são enums SQL. Categorias e tags editáveis não constituem listas fechadas.

## Domínio, limites e configuração de interface

| Grupo / símbolo | Valores ou regra | Definição |
| --- | --- | --- |
| `PERMISSAO_ADM`, `PERMISSAO_COMUM` | `ADM`, `Comum` | `backend/app/utils/permissoes.py`; `frontend/src/utils/permissoes.js` |
| `PERMISSOES`, `PERMISSOES_USUARIO` | ADM e Comum | `backend/app/routes/usuario_routes.py`; `frontend/src/utils/permissoes.js` |
| `STATUS`, `STATUS_USUARIO` | `Ativo`, `Inativo`; padrão Ativo | Mesmos arquivos de usuários/permissões; default em `models.py` |
| `STATUS_VALIDOS` | `nao_iniciado`, `em_andamento`, `concluido`; model inicia em_andamento, resposta sintética inicia nao_iniciado | `backend/app/routes/progresso_quiz_routes.py`, `backend/app/models/models.py`; consumidores nas páginas/components de quizzes/progresso |
| `SENHA_MIN`, `EMAIL_REGEX` | Mínimo 6; e-mail com local, domínio e TLD alfabético de 2+ caracteres; até 100; normalização trim/lower | `backend/app/utils/validators.py`, `frontend/src/utils/validacao.js` |
| `NOME_MAX` | 100 | `backend/app/routes/usuario_routes.py`, `frontend/src/pages/Home/perfil.jsx`; limites literais no cadastro/gestão |
| `TAMANHO_MAXIMO_FOTO` | 2 × 1024 × 1024 bytes | `usuario_routes.py`, `pages/Home/perfil.jsx` |
| `EXTENSOES_FOTO`, `EXTENSOES_IMAGEM`, `TIPOS_IMAGEM` | `.png`, `.jpg`, `.jpeg`, `.webp`; image/png, image/jpeg, image/webp | Rotas de usuários e página Perfil |
| `BACKEND_DIR`, `PASTA_FOTOS_PERFIL` | Raiz backend e `uploads/perfil` | `backend/app/utils/foto_perfil.py` |
| `TIPOS_MATERIAIS`, `TIPOS` | `PDF`, `WORD`, `EXCEL`, `POWERPOINT`, `IMAGE`, `VIDEO`, `AUDIO`, `LINK`, `YOUTUBE`, `OTHER`; filtro frontend também aceita vazio para Todos | `backend/app/routes/library_routes.py`; `frontend/src/pages/Home/biblioteca-categoria.jsx` |
| Fonte de material no formulário | `FILE`, `LINK`, `YOUTUBE`; FILE é estado de UI, não tipo aceito pela API | `biblioteca-categoria.jsx` |
| Tags de material | Texto livre separado por vírgulas; frontend exibe três e contador das demais; sem vocabulário ou tabela de tags | `LibraryMaterial.tags`, rotas library e `biblioteca-categoria.jsx` |
| Flags de biblioteca | `is_active` e `is_published`: booleanos, defaults true; `position`: inteiro, default 0 | Models e rotas library |
| `QUIZZES` | LGPD (4 perguntas), Letramento Digital (5), Segurança da Informação (3), Saúde Digital (4) | `backend/seed_quizzes.py`; catálogo pode ser alterado por ADM |
| `CATEGORIAS` | Podcasts/audio/card-seguranca; Infográficos/image/card-letramento; Guias e Manuais/book/card-lgpd; Vídeos/video/card-saude; Documentos/file/card-cor-5 | `backend/seed_library.py`; nomes/ícones/cores são dados editáveis |
| `CORES_SEED` | `card-lgpd`, `card-letramento`, `card-seguranca`, `card-saude` | `backend/app/routes/quiz_routes.py` |
| `CORES_PALETA` | `card-cor-1` a `card-cor-6` | Rotas quiz; `components/cards-Inicio.jsx` e `pages/Home/quiz.jsx` |
| `PALETA_CATEGORIA`, `CORES` | card-lgpd/roxo, card-letramento/verde-azulado, card-seguranca/âmbar, card-saude/rosa, card-cor-5/azul-petróleo | `frontend/src/pages/Home/biblioteca.jsx`; seleção atual tem cinco cores, API de categorias não impõe essa enumeração |
| `VARIANTES_PADRAO`, `CORES_VARIANTE` | biblioteca-card-azul, roxo, verde, rosa, branco, ambar; mapa converte classes card-* para variantes | `biblioteca.jsx` |
| Ilustrações de categoria | podcast, video, infografico, guia, planilha, imagem, link, documento, pasta; inferidas de icon/nome/slug | `escolherIlustracao`/`IlustracaoBiblioteca` em `biblioteca.jsx`; não enum persistido |
| `DEFAULT_THEME` | `light`; temas aceitos `light`, `dark` | `context/ThemeContext.jsx`; script em `index.html`, reset em `layouts/AuthLayout.jsx` |
| `CHAVE_TOKEN` | `acs-token` em sessionStorage | `utils/tokenStorage.js` |
| `API_URL` | `http://localhost:5000` | `services/api.js` |
| `LIMITE`, `ITENS_POR_PAGINA` | Histórico 5; usuários 10 por página no cliente | `components/historico-quiz.jsx`, `pages/Home/usuarios.jsx` |
| Paginação library | page 1, per_page 12; limite servidor 100 | Rotas library e `biblioteca-categoria.jsx` |
| `PERGUNTA_VAZIA` | enunciado/explicação vazios, quantidade 4, quatro textos vazios, correta null | `components/QuizAdminModal.jsx`; API exige mínimo 2 alternativas e uma correta |
| `IMAGENS`, `falasDidio` | Estados `inicio`, `acerto`, `erro`; quatro falas por estado; poses acenando/prancheta/pensando | `components/didio-tutor.jsx`, `data/didio.js` |
| Estados de alternativas | selecionada, correta, errada, apagada, ou vazio | `pages/Home/quiz.jsx` e `assets/css/pages_css/quiz.css` |
| Estados transitórios | Modais criar/editar; feedback sucesso/erro; reset verificando/invalido/valido/erro; visualizador youtube/image/pdf/video/audio | Páginas Home, Auth/redefinir-senha; não persistidos |
| Resultado de quiz | ≥75% excelente; ≥50% bom; abaixo continuar praticando | `pages/Home/quiz.jsx` |
| `MSG_CREDENCIAIS_INVALIDAS` | Email ou senha inválidos | `backend/app/services/auth_service.py` |
| `MSG_REDEFINICAO_SOLICITADA`, `MSG_LINK_INVALIDO` | Resposta genérica de envio; Link inválido ou expirado | `backend/app/routes/auth_routes.py`; segunda também em `pages/Auth/redefinir-senha.jsx` |
| `NOME_PLATAFORMA`, `NOME_RESPONSAVEL`, `EMAIL_CONTATO`, `DATA_ATUALIZACAO` | Plataforma ACS; responsável e DPO com `[PREENCHER: ...]`; 26/10/2026 | `frontend/src/data/documentosLegais.js`; também exporta termosDeUso e politicaPrivacidade |

Demais constantes operacionais de ambiente, JWT de duas horas e reset de 30 minutos estão descritas no [guia raiz](../AGENTS.md). Textos e mensagens de serviço são conteúdo de interface, não tags de quiz. Não há enum de tags de quiz no model atual.

## Arquivos da biblioteca

`backend/app/services/library_storage.py:ALLOWED_EXTENSIONS` e `tipo_por_extensao` definem:

| Extensão | MIME | Tipo inferido |
| --- | --- | --- |
| pdf | application/pdf | PDF |
| doc / docx | application/msword / application/vnd.openxmlformats-officedocument.wordprocessingml.document | WORD |
| xls / xlsx | application/vnd.ms-excel / application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | EXCEL |
| ppt / pptx | application/vnd.ms-powerpoint / application/vnd.openxmlformats-officedocument.presentationml.presentation | POWERPOINT |
| png | image/png | IMAGE |
| jpg / jpeg | image/jpeg | IMAGE |
| webp | image/webp | IMAGE |
| gif | image/gif | IMAGE |
| svg | image/svg+xml | IMAGE |
| mp4 / webm | video/mp4 / video/webm | VIDEO |
| mp3 / wav | audio/mpeg / audio/wav | AUDIO |
| txt | text/plain | OTHER |
| csv | text/csv | EXCEL |

Não há upload de thumbnail implementado nas rotas atuais, embora exista `thumbnail_path`. Os tipos LINK/YOUTUBE usam URL e não arquivo. O frontend traduz rótulos e ações em `rotuloTipo` e `acaoMaterial`: assistir vídeo/YouTube, ouvir áudio, visualizar PDF/imagem, abrir link e baixar demais tipos.

## Tokens visuais

Fonte completa e valores claros/escuros: `frontend/src/index.css`. Não duplicar valores em estilos de componentes. Os valores abaixo são referências para localizar a paleta, não autorização para hardcode.

| Token | Claro | Escuro |
| --- | --- | --- |
| --azul | #052373 | #1C3C86 |
| --azul-secundario | #0934AB | #294FA8 |
| --azul-profundo | #031a57 | #16243D |
| --azul-claro | #3A66F0 | #3159B0 |
| --fundo | #F3F6FC | #111B2B |
| --superficie | #FFFFFF | #1B283B |
| --borda | #E3E9F5 | #35445A |
| --texto | #1E2A55 | #E8EEF8 |
| --texto-suave | #66719A | #B2BED0 |
| --cor-lgpd | #6C4FE0 | #B3A0FF |
| --cor-letramento | #0A8579 | #69D1BF |
| --cor-seguranca | #B45F06 | #F2B66D |
| --cor-saude | #D6336C | #FF91B1 |
| --cor-paleta-1 | #2463A6 | #8BBEFF |
| --cor-paleta-2 | #467A3C | #9BD58C |
| --cor-paleta-3 | #8A4F8D | #D7A0E2 |
| --cor-paleta-4 | #A34F35 | #F0A18B |
| --cor-paleta-5 | #267A83 | #83D3DA |
| --cor-paleta-6 | #6D6B24 | #D2CE7A |

Demais grupos definidos em `index.css`:

- Texto/controle: `--azul-terciario`, `--texto-titulo`, `--texto-link`, `--branco`, `--branco-gelo`, `--texto-botao`, `--texto-botao-desabilitado`, `--texto-botao-acento`, `--placeholder`, `--tema-ativo`, `--barra-progresso`.
- Foco: `--foco-contorno`, `--foco-sidebar`, `--foco-sombra`.
- Estado: `--sucesso`, `--sucesso-fundo`, `--sucesso-texto`, `--texto-em-sucesso`, `--ponto-novo`, `--aviso`, `--aviso-fundo`, `--erro`, `--erro-fundo`, `--erro-quiz`, `--erro-quiz-fundo`, `--erro-quiz-texto`, `--texto-em-erro`, `--estado-inativo-fundo`, `--selecionado-fundo`, `--opcao-hover`.
- Login: `--login-fundo`, `--login-texto-forte`, `--login-texto-suave`, `--login-borda`, `--login-botao-hover`, `--login-focus`, `--login-focus-sombra`, `--login-sombra-card`, `--login-glow-1` a `--login-glow-4`, `--login-link`.
- Sidebar: `--sidebar-divisor`, `--sidebar-hover`, `--sidebar-menu-hover`, `--sidebar-texto`, `--sidebar-borda-hover`, `--sidebar-borda-ativa`, `--sidebar-sombra`, `--sidebar-sombra-ativa`.
- Menu: `--menu-borda`, `--menu-borda-hover`, `--menu-sombra`, `--menu-divisor`, `--menu-borda-erro`.
- Decoração/sombra: `--home-texto`, `--sombra-home`, `--biblioteca-sombra-icone`, `--quiz-sombra-botao`, `--decoracao-fundo-1`, `--decoracao-fundo-2`, `--sombra-card`, `--sombra-card-hover`.
- Camadas: `--z-content=0`, `--z-header=10`, `--z-dropdown=20`; overlays ainda usam z-index literal nas folhas locais.

Variáveis locais complementares:

| Fonte | Variáveis e valores/referências |
| --- | --- |
| `components_css/sidebar.css` e responsivos | --sidebar-largura 260px/220px; --sidebar-largura-recolhida 76px/68px; mobile substitui layout por navegação inferior |
| CSS de cards, histórico, quiz e biblioteca | --cor-card aponta para token de tema/paleta |
| `components_css/progresso.css`, `dashboard-admin.css` | --ponto usa azul-secundario/sucesso/aviso/ponto-novo |
| `pages_css/quiz.css` | --sel-fundo, --certo, --certo-fundo, --certo-texto, --quiz-erro, --quiz-erro-fundo, --quiz-erro-texto são aliases de tokens; --pct é percentual dinâmico no JSX |
| `pages_css/didio.css` | --didio-certo-fundo #e8f7ee, --didio-certo-texto #14532d, --didio-erro-fundo #fdecec, --didio-erro-texto #7f1d1d; sem override escuro local |
| `pages_css/biblioteca.css` e `biblioteca.jsx` | --cor-opcao aponta para token da paleta; o acervo usa --acervo-espaco, --acervo-raio, --acervo-altura, --acervo-arte, --acervo-titulo e --acervo-sombra para dimensões/tipografia; --acervo-texto, --acervo-suave, --acervo-fundo e --acervo-destaque derivam dos tokens de tema. Cards claros alternam com destaques em azul e rosa a cada quatro categorias |
| `animations.css` | --anim-stagger 70ms (mobile 45ms), --anim-max-delay 560ms (mobile 360ms), --anim-base-delay por área, --anim-offset por contexto; --anim-delay zerada em reduced-motion |

`--azul-fundo` aparece em `biblioteca.css` sem definição encontrada. Não reutilizar essa referência sem resolver a origem.
