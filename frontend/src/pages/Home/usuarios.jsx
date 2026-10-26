import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/useAuth";
import { listarUsuarios } from "../../services/admin";
import { ApiError } from "../../services/api";
import { PERMISSAO_ADM } from "../../utils/permissoes";
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
    const { usuario } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [busca, setBusca] = useState("");
    const [statusFiltro, setStatusFiltro] = useState("");
    const [permissaoFiltro, setPermissaoFiltro] = useState("");
    const [pagina, setPagina] = useState(1);

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
                                {usuarios.filter((item) => item.status === "Ativo").length}
                            </strong>
                        </article>
                        <article className="usuarios-resumo-card usuarios-resumo-inativo">
                            <span>Inativos</span>
                            <strong>
                                {usuarios.filter((item) => item.status === "Inativo").length}
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
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                </select>
                            </label>

                            <label>
                                <span>Permissão</span>
                                <select value={permissaoFiltro} onChange={atualizarPermissao}>
                                    <option value="">Todas</option>
                                    <option value={PERMISSAO_ADM}>ADM</option>
                                    <option value="Comum">Comum</option>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosDaPagina.map((item) => (
                                        <tr key={item.id_usuario}>
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
                                                        : "Comum"}
                                                </span>
                                            </td>
                                            <td data-label="Status">
                                                <span
                                                    className={`usuarios-badge ${
                                                        item.status === "Ativo"
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
                                        </tr>
                                    ))}
                                    {usuariosDaPagina.length === 0 && (
                                        <tr>
                                            <td className="usuarios-vazio" colSpan="5">
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
        </div>
    );
}

export default Usuarios;
