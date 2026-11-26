import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "../../context/useAuth";
import {
    atualizarUsuario,
    criarUsuario,
    excluirUsuario,
    listarUsuarios,
} from "../../services/admin";
import { ApiError } from "../../services/api";
import {
    PERMISSAO_ADM,
    PERMISSAO_COMUM,
    PERMISSOES_USUARIO,
    STATUS_USUARIO,
} from "../../utils/permissoes";
import {
    normalizarEmail,
    validarEmail,
    validarSenha,
} from "../../utils/validacao";
import "../../assets/css/pages_css/usuarios.css";

const ITENS_POR_PAGINA = 10;

function normalizarBusca(valor) {
    return valor
        .trim()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLocaleLowerCase("pt-BR");
}

function formatarData(valor) {
    if (typeof valor !== "string") return "-";

    const data = new Date(`${valor.replace(" ", "T")}Z`);
    return Number.isNaN(data.getTime()) ? "-" : data.toLocaleString("pt-BR");
}

function mensagemDoErro(erro) {
    if (erro instanceof ApiError) {
        return erro.message;
    }

    return "Não foi possível carregar os usuários. Tente novamente.";
}

function Usuarios() {
    const { usuario, atualizarUsuario: atualizarUsuarioContexto } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [busca, setBusca] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");
    const [permissaoFiltro, setPermissaoFiltro] = useState("");
    const [pagina, setPagina] = useState(1);
    const [modal, setModal] = useState(null);
    const [formulario, setFormulario] = useState({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        permissao: PERMISSAO_COMUM,
        status: STATUS_USUARIO[0],
    });
    const [salvando, setSalvando] = useState(false);
    const [excluindoId, setExcluindoId] = useState(null);
    const [erroModal, setErroModal] = useState("");
    const [feedbackOperacao, setFeedbackOperacao] = useState(null);
    const primeiroCampoRef = useRef(null);

    useEffect(() => {
        let cancelado = false;

        listarUsuarios()
            .then((dados) => {
                if (!cancelado) {
                    setUsuarios(dados);
                    setErro("");
                }
            })
            .catch((falha) => {
                if (!cancelado) setErro(mensagemDoErro(falha));
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });

        return () => {
            cancelado = true;
        };
    }, [tentativa]);

    useEffect(() => {
        if (!modal) return undefined;

        primeiroCampoRef.current?.focus();
        function fecharComEsc(evento) {
            if (evento.key === "Escape" && !salvando) setModal(null);
        }

        window.addEventListener("keydown", fecharComEsc);
        return () => window.removeEventListener("keydown", fecharComEsc);
    }, [modal, salvando]);

    useEffect(() => {
        if (!modal) return undefined;

        const elementoRolagem = document.scrollingElement || document.documentElement;
        const overflowAnterior = elementoRolagem.style.overflow;
        const paddingDireitoAnterior = elementoRolagem.style.paddingRight;
        const larguraBarraRolagem =
            window.innerWidth - document.documentElement.clientWidth;
        const paddingDireitoAtual = Number.parseFloat(
            window.getComputedStyle(elementoRolagem).paddingRight
        ) || 0;

        elementoRolagem.style.overflow = "hidden";
        if (larguraBarraRolagem > 0) {
            elementoRolagem.style.paddingRight =
                `${paddingDireitoAtual + larguraBarraRolagem}px`;
        }

        return () => {
            elementoRolagem.style.overflow = overflowAnterior;
            elementoRolagem.style.paddingRight = paddingDireitoAnterior;
        };
    }, [modal]);

    const usuariosFiltrados = useMemo(() => {
        const termo = normalizarBusca(busca);

        return usuarios.filter((item) => {
            const correspondeBusca =
                !termo ||
                normalizarBusca(item.nome).includes(termo) ||
                normalizarBusca(item.email).includes(termo);
            const correspondeStatus = !statusFiltro || item.status === statusFiltro;
            const correspondePermissao =
                !permissaoFiltro || item.permissao === permissaoFiltro;

            return correspondeBusca && correspondeStatus && correspondePermissao;
        });
    }, [usuarios, busca, statusFiltro, permissaoFiltro]);

    const totalPaginas = Math.ceil(usuariosFiltrados.length / ITENS_POR_PAGINA);
    const inicio = (pagina - 1) * ITENS_POR_PAGINA;
    const usuariosDaPagina = usuariosFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA);
    const quantidadeMostrada = usuariosDaPagina.length;
    const filtrosAtivos = Boolean(busca.trim() || statusFiltro || permissaoFiltro);
    const usuarioAtualNaEdicao =
        modal?.modo === "editar" &&
        String(modal.usuario.id_usuario) === String(usuario?.id_usuario);

    function atualizarBusca(evento) {
        setBusca(evento.target.value);
        setPagina(1);
    }

    function atualizarStatus(evento) {
        setStatusFiltro(evento.target.value);
        setPagina(1);
    }

    function atualizarPermissao(evento) {
        setPermissaoFiltro(evento.target.value);
        setPagina(1);
    }

    function limparFiltros() {
        setBusca("");
        setStatusFiltro("");
        setPermissaoFiltro("");
        setPagina(1);
    }

    function tentarNovamente() {
        setErro("");
        setCarregando(true);
        setTentativa((atual) => atual + 1);
    }

    function abrirCriacao() {
        setFormulario({
            nome: "",
            email: "",
            senha: "",
            confirmarSenha: "",
            permissao: PERMISSAO_COMUM,
            status: STATUS_USUARIO[0],
        });
        setErroModal("");
        setModal({ modo: "criar" });
    }

    function abrirEdicao(item) {
        setFormulario({
            nome: item.nome,
            email: item.email,
            senha: "",
            confirmarSenha: "",
            permissao: item.permissao,
            status: item.status,
        });
        setErroModal("");
        setModal({ modo: "editar", usuario: item });
    }

    function atualizarCampo(evento) {
        const { name, value } = evento.target;
        setFormulario((atual) => ({ ...atual, [name]: value }));
    }

    async function salvarUsuario(evento) {
        evento.preventDefault();
        if (salvando) return;

        const nome = formulario.nome.trim();
        const email = normalizarEmail(formulario.email);
        if (!nome) {
            setErroModal("Nome é obrigatório");
            return;
        }
        if (nome.length > 100) {
            setErroModal("O nome deve ter no máximo 100 caracteres");
            return;
        }
        const erroEmail = validarEmail(email);
        if (erroEmail) {
            setErroModal(erroEmail);
            return;
        }
        if (!PERMISSOES_USUARIO.includes(formulario.permissao)) {
            setErroModal("Selecione uma permissão válida");
            return;
        }
        if (!STATUS_USUARIO.includes(formulario.status)) {
            setErroModal("Selecione um status válido");
            return;
        }

        const criando = modal.modo === "criar";
        if (criando || formulario.senha) {
            const erroSenha = validarSenha(formulario.senha);
            if (erroSenha) {
                setErroModal(erroSenha);
                return;
            }
        }
        if (criando && formulario.senha !== formulario.confirmarSenha) {
            setErroModal("As senhas não coincidem");
            return;
        }

        const dados = {
            nome,
            email,
            permissao: formulario.permissao,
            status: formulario.status,
        };
        if (criando || formulario.senha) dados.senha = formulario.senha;

        setSalvando(true);
        setErroModal("");
        setFeedbackOperacao(null);
        try {
            const resposta = criando
                ? await criarUsuario(dados)
                : await atualizarUsuario(modal.usuario.id_usuario, dados);
            if (
                !criando &&
                String(modal.usuario.id_usuario) === String(usuario?.id_usuario)
            ) {
                atualizarUsuarioContexto(resposta.usuario);
            }
            setModal(null);
            setFeedbackOperacao({
                tipo: "sucesso",
                mensagem: resposta.mensagem || "Usuário salvo com sucesso",
            });
            setTentativa((atual) => atual + 1);
        } catch (falha) {
            setErroModal(
                falha instanceof ApiError
                    ? falha.message
                    : "Não foi possível salvar o usuário. Tente novamente."
            );
        } finally {
            setSalvando(false);
        }
    }

    async function confirmarExclusao(item) {
        if (excluindoId !== null) return;
        const confirmou = window.confirm(
            `Tem certeza que deseja excluir ${item.nome}? Essa ação não pode ser desfeita e apaga também o progresso dele.`
        );
        if (!confirmou) return;

        setExcluindoId(item.id_usuario);
        setFeedbackOperacao(null);
        try {
            const resposta = await excluirUsuario(item.id_usuario);
            setFeedbackOperacao({
                tipo: "sucesso",
                mensagem: resposta.mensagem || "Usuário excluído com sucesso",
            });
            if (pagina > 1 && usuariosDaPagina.length === 1) {
                setPagina((atual) => atual - 1);
            }
            setTentativa((atual) => atual + 1);
        } catch (falha) {
            setFeedbackOperacao({
                tipo: "erro",
                mensagem:
                    falha instanceof ApiError
                        ? falha.message
                        : "Não foi possível excluir o usuário. Tente novamente.",
            });
        } finally {
            setExcluindoId(null);
        }
    }

    function abrirEdicaoComTeclado(evento, item) {
        if (evento.target !== evento.currentTarget) return;
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            abrirEdicao(item);
        }
    }

    return (
        <div className="usuarios anim-page-enter">
            <header className="usuarios-top">
                <h1>Usuários</h1>
                <p>Gerencie e consulte os usuários cadastrados no sistema.</p>
            </header>

            {!carregando && !erro && (
                <>
                    <section className="usuarios-resumo" aria-label="Resumo de usuários">
                        <article className="usuarios-resumo-card">
                            <span>Total</span>
                            <strong>{usuarios.length}</strong>
                        </article>
                        <article className="usuarios-resumo-card usuarios-resumo-ativo">
                            <span>Ativos</span>
                            <strong>
                                {usuarios.filter(
                                    (item) => item.status === STATUS_USUARIO[0]
                                ).length}
                            </strong>
                        </article>
                        <article className="usuarios-resumo-card usuarios-resumo-inativo">
                            <span>Inativos</span>
                            <strong>
                                {usuarios.filter(
                                    (item) => item.status === STATUS_USUARIO[1]
                                ).length}
                            </strong>
                        </article>
                        <article className="usuarios-resumo-card usuarios-resumo-adm">
                            <span>Administradores</span>
                            <strong>
                                {usuarios.filter((item) => item.permissao === PERMISSAO_ADM).length}
                            </strong>
                        </article>
                    </section>

                    <section className="usuarios-lista" aria-label="Lista de usuários">
                        <div className="usuarios-lista-topo">
                            <button
                                type="button"
                                className="usuarios-adicionar"
                                onClick={abrirCriacao}
                            >
                                Adicionar usuário
                            </button>
                        </div>

                        {feedbackOperacao && (
                            <p
                                className={`usuarios-feedback usuarios-feedback-${feedbackOperacao.tipo}`}
                                role={feedbackOperacao.tipo === "erro" ? "alert" : "status"}
                            >
                                {feedbackOperacao.mensagem}
                            </p>
                        )}

                        <div className="usuarios-ferramentas">
                            <label className="usuarios-busca">
                                <span>Buscar por nome ou e-mail</span>
                                <input
                                    type="search"
                                    value={busca}
                                    onChange={atualizarBusca}
                                    placeholder="Digite um nome ou e-mail"
                                />
                            </label>

                            <label>
                                <span>Status</span>
                                <select value={statusFiltro} onChange={atualizarStatus}>
                                    <option value="">Todos</option>
                                    {STATUS_USUARIO.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span>Permissão</span>
                                <select value={permissaoFiltro} onChange={atualizarPermissao}>
                                    <option value="">Todas</option>
                                    {PERMISSOES_USUARIO.map((permissao) => (
                                        <option key={permissao} value={permissao}>
                                            {permissao}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {filtrosAtivos && (
                                <button
                                    type="button"
                                    className="usuarios-limpar"
                                    onClick={limparFiltros}
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>

                        <div
                            className="usuarios-tabela-container"
                            role="region"
                            aria-label="Tabela de usuários"
                            tabIndex="0"
                        >
                            <table>
                                <caption>Usuários cadastrados no sistema</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Nome</th>
                                        <th scope="col">E-mail</th>
                                        <th scope="col">Permissão</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Cadastrado em</th>
                                        <th scope="col">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosDaPagina.map((item) => (
                                        <tr
                                            key={item.id_usuario}
                                            className="usuarios-linha"
                                            onClick={() => abrirEdicao(item)}
                                            onKeyDown={(evento) =>
                                                abrirEdicaoComTeclado(evento, item)
                                            }
                                            tabIndex="0"
                                        >
                                            <td data-label="Nome">
                                                <span className="usuarios-nome">
                                                    {item.nome}
                                                    {String(item.id_usuario) ===
                                                        String(usuario?.id_usuario) && (
                                                        <span className="usuarios-voce">Você</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td data-label="E-mail">{item.email}</td>
                                            <td data-label="Permissão">
                                                <span
                                                    className={`usuarios-badge usuarios-badge-permissao ${
                                                        item.permissao === PERMISSAO_ADM
                                                            ? "badge-adm"
                                                            : "badge-comum"
                                                    }`}
                                                >
                                                    {item.permissao === PERMISSAO_ADM
                                                        ? "ADM"
                                                        : PERMISSAO_COMUM}
                                                </span>
                                            </td>
                                            <td data-label="Status">
                                                <span
                                                    className={`usuarios-badge ${
                                                        item.status === STATUS_USUARIO[0]
                                                            ? "badge-ativo"
                                                            : "badge-inativo"
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td data-label="Cadastrado em">
                                                {formatarData(item.data_cadastro)}
                                            </td>
                                            <td data-label="Ações" className="usuarios-acoes-celula">
                                                <div className="usuarios-acoes">
                                                    <button
                                                        type="button"
                                                        className="usuarios-acao"
                                                        aria-label={`Editar usuário ${item.nome}`}
                                                        title="Editar usuário"
                                                        onClick={(evento) => {
                                                            evento.stopPropagation();
                                                            abrirEdicao(item);
                                                        }}
                                                    >
                                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                                            <path d="M12 20h9" />
                                                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                                        </svg>
                                                    </button>
                                                    {String(item.id_usuario) !==
                                                        String(usuario?.id_usuario) && (
                                                        <button
                                                            type="button"
                                                            className="usuarios-acao usuarios-acao-excluir"
                                                            aria-label={
                                                                excluindoId === item.id_usuario
                                                                    ? `Excluindo usuário ${item.nome}`
                                                                    : `Excluir usuário ${item.nome}`
                                                            }
                                                            title="Excluir usuário"
                                                            aria-busy={
                                                                excluindoId === item.id_usuario
                                                            }
                                                            disabled={
                                                                excluindoId === item.id_usuario
                                                            }
                                                            onClick={(evento) => {
                                                                evento.stopPropagation();
                                                                confirmarExclusao(item);
                                                            }}
                                                        >
                                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                                <path d="M3 6h18" />
                                                                <path d="M8 6V4h8v2" />
                                                                <path d="m19 6-1 14H6L5 6" />
                                                                <path d="M10 11v5M14 11v5" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {usuariosDaPagina.length === 0 && (
                                        <tr>
                                            <td className="usuarios-vazio" colSpan="6">
                                                Nenhum usuário encontrado
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="usuarios-paginacao">
                            <p>
                                Mostrando {quantidadeMostrada ? inicio + 1 : 0}–
                                {inicio + quantidadeMostrada} de {usuariosFiltrados.length}
                            </p>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setPagina((atual) => atual - 1)}
                                    disabled={pagina <= 1}
                                >
                                    Anterior
                                </button>
                                <span aria-live="polite">
                                    Página {totalPaginas ? pagina : 0} de {totalPaginas}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPagina((atual) => atual + 1)}
                                    disabled={pagina >= totalPaginas}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {carregando && (
                <p className="usuarios-mensagem" role="status">
                    Carregando usuários...
                </p>
            )}

            {!carregando && erro && (
                <div className="usuarios-mensagem usuarios-erro" role="alert">
                    <p>{erro}</p>
                    <button type="button" onClick={tentarNovamente}>
                        Tentar novamente
                    </button>
                </div>
            )}

            {modal && createPortal(
                <div
                    className="usuarios-modal-fundo"
                    onClick={(evento) => {
                        if (evento.target === evento.currentTarget && !salvando) {
                            setModal(null);
                        }
                    }}
                >
                    <section
                        className="usuarios-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="usuarios-modal-titulo"
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="usuarios-modal-fechar"
                            aria-label="Fechar formulário"
                            disabled={salvando}
                            onClick={() => setModal(null)}
                        >
                            ×
                        </button>
                        <h2 id="usuarios-modal-titulo">
                            {modal.modo === "criar" ? "Adicionar usuário" : "Editar usuário"}
                        </h2>
                        <form onSubmit={salvarUsuario}>
                            <label>
                                Nome
                                <input
                                    ref={primeiroCampoRef}
                                    name="nome"
                                    value={formulario.nome}
                                    onChange={atualizarCampo}
                                    maxLength="100"
                                    autoComplete="name"
                                    required
                                />
                            </label>
                            <label>
                                E-mail
                                <input
                                    name="email"
                                    type="email"
                                    value={formulario.email}
                                    onChange={atualizarCampo}
                                    maxLength="100"
                                    autoComplete="email"
                                    required
                                />
                            </label>
                            {modal.modo === "criar" && (
                                <>
                                    <label>
                                        Senha
                                        <input
                                            name="senha"
                                            type="password"
                                            value={formulario.senha}
                                            onChange={atualizarCampo}
                                            autoComplete="new-password"
                                            required
                                        />
                                    </label>
                                    <label>
                                        Confirmar senha
                                        <input
                                            name="confirmarSenha"
                                            type="password"
                                            value={formulario.confirmarSenha}
                                            onChange={atualizarCampo}
                                            autoComplete="new-password"
                                            required
                                        />
                                    </label>
                                </>
                            )}
                            {modal.modo === "editar" && !usuarioAtualNaEdicao && (
                                <label>
                                    Nova senha
                                    <input
                                        name="senha"
                                        type="password"
                                        value={formulario.senha}
                                        onChange={atualizarCampo}
                                        autoComplete="new-password"
                                        aria-describedby="usuarios-senha-ajuda"
                                    />
                                    <small id="usuarios-senha-ajuda">
                                        Deixe em branco para manter a atual.
                                    </small>
                                </label>
                            )}
                            <label>
                                Permissão
                                <select
                                    name="permissao"
                                    value={formulario.permissao}
                                    onChange={atualizarCampo}
                                    disabled={usuarioAtualNaEdicao}
                                >
                                    {PERMISSOES_USUARIO.map((permissao) => (
                                        <option key={permissao} value={permissao}>
                                            {permissao}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Status
                                <select
                                    name="status"
                                    value={formulario.status}
                                    onChange={atualizarCampo}
                                    disabled={usuarioAtualNaEdicao}
                                >
                                    {STATUS_USUARIO.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </label>
                            {usuarioAtualNaEdicao && (
                                <p className="usuarios-modal-ajuda">
                                    Sua permissão, status e senha não podem ser alterados por esta tela.
                                </p>
                            )}
                            {erroModal && (
                                <p className="usuarios-modal-erro" role="alert">
                                    {erroModal}
                                </p>
                            )}
                            <div className="usuarios-modal-botoes">
                                <button
                                    type="button"
                                    className="usuarios-modal-cancelar"
                                    disabled={salvando}
                                    onClick={() => setModal(null)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="usuarios-modal-salvar"
                                    disabled={salvando}
                                >
                                    {salvando ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>,
                document.body
            )}
        </div>
    );
}

export default Usuarios;
