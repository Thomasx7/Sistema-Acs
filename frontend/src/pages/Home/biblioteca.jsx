import { useEffect, useRef, useState } from "react";
import CardPasta from "../../components/CardPasta";
import { ICONES_CATEGORIA, PALETA_CATEGORIA, configurarPasta } from "../../data/pastasBiblioteca";

import { useAuth } from "../../context/useAuth";
import { ehAdm } from "../../utils/permissoes";
import { ApiError } from "../../services/api";
import {
    atualizarCategoria,
    criarCategoria,
    excluirCategoria,
    listarCategorias,
} from "../../services/library";
import "../../assets/css/pages_css/home.css";
import "../../assets/css/pages_css/biblioteca.css";

const CORES = Object.keys(PALETA_CATEGORIA);

function mensagemErro(falha, alternativa) {
    return falha instanceof ApiError ? falha.message : alternativa;
}

function Biblioteca() {
    const { usuario } = useAuth();
    const administrador = ehAdm(usuario);
    const [categorias, setCategorias] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: "", description: "", color: CORES[0], icon: "" });
    const [salvando, setSalvando] = useState(false);
    const [erroModal, setErroModal] = useState("");
    const primeiroCampoRef = useRef(null);

    useEffect(() => {
        let cancelado = false;
        listarCategorias()
            .then((dados) => {
                if (!cancelado) {
                    setCategorias(dados);
                    setErro("");
                }
            })
            .catch((falha) => {
                if (!cancelado) setErro(mensagemErro(falha, "Não foi possível carregar a biblioteca."));
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });
        return () => { cancelado = true; };
    }, [tentativa]);

    useEffect(() => {
        if (!modal) return undefined;
        primeiroCampoRef.current?.focus();
        const fechar = (evento) => {
            if (evento.key === "Escape" && !salvando) setModal(null);
        };
        window.addEventListener("keydown", fechar);
        return () => window.removeEventListener("keydown", fechar);
    }, [modal, salvando]);

    function abrirCriacao() {
        setForm({ name: "", description: "", color: CORES[categorias.length % CORES.length], icon: "" });
        setErroModal("");
        setModal({ modo: "criar" });
    }

    function abrirEdicao(categoria) {
        setForm({
            name: categoria.name,
            description: categoria.description || "",
            color: categoria.color || CORES[0],
            icon: categoria.icon || "",
        });
        setErroModal("");
        setModal({ modo: "editar", categoria });
    }

    async function salvarCategoria(evento) {
        evento.preventDefault();
        if (!form.name.trim()) {
            setErroModal("Informe o nome da categoria.");
            return;
        }
        setSalvando(true);
        setErroModal("");
        try {
            if (modal.modo === "editar") {
                const atualizada = await atualizarCategoria(modal.categoria.id, form);
                setCategorias((atuais) => atuais.map((item) => item.id === atualizada.id ? atualizada : item));
            } else {
                const criada = await criarCategoria(form);
                setCategorias((atuais) => [...atuais, criada].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name)));
            }
            setModal(null);
        } catch (falha) {
            setErroModal(mensagemErro(falha, "Não foi possível salvar a categoria."));
        } finally {
            setSalvando(false);
        }
    }

    async function excluir(categoria) {
        if (!window.confirm(`Excluir a categoria "${categoria.name}"?`)) return;
        try {
            await excluirCategoria(categoria.id);
            setCategorias((atuais) => atuais.filter((item) => item.id !== categoria.id));
        } catch (falha) {
            setErro(mensagemErro(falha, "Não foi possível excluir a categoria."));
        }
    }

    return (
        <div className="biblioteca biblioteca-acervo anim-page-enter">
            <div className="biblioteca-cabecalho">
                <div className="boas-vindas">
                    <h1>Biblioteca</h1>
                    <p>Conhecimento para consultar, descobrir e levar para a prática.</p>
                </div>
                {administrador && (
                    <button type="button" className="biblioteca-botao-principal" onClick={abrirCriacao}>
                        <span aria-hidden="true">+</span> Nova categoria
                    </button>
                )}
            </div>

            {carregando && (
                <section className="biblioteca-skeletons" aria-label="Carregando categorias">
                    {[1, 2, 3].map((item) => <div className="biblioteca-card-skeleton" key={item} />)}
                </section>
            )}
            {!carregando && erro && (
                <section className="biblioteca-estado biblioteca-estado-erro" role="alert">
                    <p>{erro}</p>
                    <button type="button" className="biblioteca-botao-secundario" onClick={() => { setCarregando(true); setTentativa((valor) => valor + 1); }}>Tentar novamente</button>
                </section>
            )}
            {!carregando && !erro && categorias.length === 0 && (
                <section className="biblioteca-estado">
                    <span className="biblioteca-vazio-ilustracao" aria-hidden="true">
                        <svg viewBox="0 0 48 48">
                            <path d="M7 15.5h12l4 4h18a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-19a3 3 0 0 1 3-3Z" />
                            <path d="m8 25 4-4h30l-5 15H5z" />
                            <path d="M16 12V7h16v13m-11-8 3 3 6-7" />
                        </svg>
                    </span>
                    <h2>Nenhuma categoria disponível</h2>
                    <p>{administrador ? "Crie a primeira categoria para começar." : "Novos materiais aparecerão aqui em breve."}</p>
                    {administrador && (
                        <button type="button" className="biblioteca-botao-principal" onClick={abrirCriacao}>
                            Criar primeira categoria
                        </button>
                    )}
                </section>
            )}
            {!carregando && !erro && categorias.length > 0 && (
                <section className="biblioteca-categorias" aria-label="Categorias da biblioteca">
                    {categorias.map((categoria) => {
                        const pasta = configurarPasta(categoria);
                        const quantidade = Number(categoria.material_count) || 0;

                        return (
                            <article
                                className="biblioteca-categoria-card"
                                key={categoria.id}
                            >
                                <CardPasta
                                    nome={categoria.name}
                                    quantidade={quantidade}
                                    icone={pasta.icone}
                                    cor={pasta.cor}
                                    texto={pasta.texto}
                                    intensidade={pasta.intensidade}
                                    tipo={pasta.tipo}
                                    descricao={categoria.description}
                                    destino={`/biblioteca/${categoria.slug}`}
                                />
                                {administrador && (
                                    <div className="biblioteca-card-acoes">
                                        <button
                                            type="button"
                                            aria-label={`Editar categoria ${categoria.name}`}
                                            title={`Editar categoria ${categoria.name}`}
                                            onClick={(evento) => {
                                                evento.preventDefault();
                                                evento.stopPropagation();
                                                abrirEdicao(categoria);
                                            }}
                                        >
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="m14 5 5 5M4 20l4.2-.9L19 8.3 15.7 5 4.9 15.8 4 20Z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={`Excluir categoria ${categoria.name}`}
                                            title={`Excluir categoria ${categoria.name}`}
                                            onClick={(evento) => {
                                                evento.preventDefault();
                                                evento.stopPropagation();
                                                excluir(categoria);
                                            }}
                                        >
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>
            )}

            {modal && (
                <div className="biblioteca-overlay" role="presentation" onMouseDown={(evento) => {
                    if (evento.target === evento.currentTarget && !salvando) setModal(null);
                }}>
                    <section className="biblioteca-modal" role="dialog" aria-modal="true" aria-labelledby="categoria-modal-titulo">
                        <div className="biblioteca-modal-topo">
                            <h2 id="categoria-modal-titulo">{modal.modo === "editar" ? "Editar categoria" : "Nova categoria"}</h2>
                            <button type="button" className="biblioteca-fechar" aria-label="Fechar" onClick={() => setModal(null)} disabled={salvando}>×</button>
                        </div>
                        <form className="biblioteca-form" onSubmit={salvarCategoria}>
                            <label>Nome
                                <input ref={primeiroCampoRef} value={form.name} onChange={(evento) => setForm({ ...form, name: evento.target.value })} maxLength="150" />
                            </label>
                            <label>Descrição
                                <textarea value={form.description} onChange={(evento) => setForm({ ...form, description: evento.target.value })} rows="3" />
                            </label>
                            <fieldset className="biblioteca-cor-fieldset" role="radiogroup" aria-label="Cor da categoria">
                                <legend>Cor</legend>
                                <div className="biblioteca-cores">
                                    {(CORES.includes(form.color) ? CORES : [...CORES, form.color]).map((valor) => (
                                        <label
                                            key={valor}
                                            className={`biblioteca-opcao-cor ${valor}`}
                                            data-tooltip={`Cor ${(PALETA_CATEGORIA[valor]?.nome || "atual")}`}
                                            style={{ "--cor-opcao": (PALETA_CATEGORIA[valor]?.cor || configurarPasta({ color: valor }).cor) }}
                                        >
                                            <input
                                                type="radio"
                                                disabled={salvando}
                                                name="cor"
                                                value={valor}
                                                aria-label={`Cor ${(PALETA_CATEGORIA[valor]?.nome || "atual")}`}
                                                checked={form.color === valor}
                                                onChange={() => setForm({ ...form, color: valor })}
                                            />
                                            <span className="biblioteca-amostra-cor" aria-hidden="true">
                                                <svg className="biblioteca-check-cor" viewBox="0 0 16 16">
                                                    <path d="m3.5 8.5 3 3 6-7" />
                                                </svg>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <fieldset className="biblioteca-icone-fieldset" aria-describedby="categoria-icone-ajuda">
                                <legend>Ícone</legend>
                                <p id="categoria-icone-ajuda" className="biblioteca-campo-ajuda">Escolha o símbolo e o tipo de conteúdo que identificam esta pasta.</p>
                                <div className="biblioteca-icones">
                                    {[
                                        ["", { nome: "Automático", caminho: configurarPasta({ name: form.name }).icone }],
                                        ...Object.entries(ICONES_CATEGORIA),
                                        ...(!form.icon || ICONES_CATEGORIA[form.icon] ? [] : [[form.icon, { nome: "Ícone atual", caminho: configurarPasta(form).icone }]]),
                                    ].map(([valor, opcao]) => (
                                        <label className="biblioteca-opcao-icone" key={valor}>
                                            <input type="radio" name="icone" value={valor}
                                                checked={form.icon === valor}
                                                onChange={() => setForm({ ...form, icon: valor })}
                                                disabled={salvando} />
                                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={opcao.caminho} /></svg>
                                            <span>{opcao.nome}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            {erroModal && <p className="biblioteca-erro" role="alert">{erroModal}</p>}
                            <div className="biblioteca-modal-acoes">
                                <button type="button" className="biblioteca-botao-secundario" onClick={() => setModal(null)} disabled={salvando}>Cancelar</button>
                                <button type="submit" className="biblioteca-botao-principal" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Biblioteca;
