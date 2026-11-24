import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { ehAdm } from "../../utils/permissoes";
import { ApiError } from "../../services/api";
import {
    atualizarCategoria,
    criarCategoria,
    excluirCategoria,
    listarCategorias,
} from "../../services/library";
import "../../assets/css/pages_css/biblioteca.css";

const PALETA_CATEGORIA = {
    "card-lgpd": { nome: "roxo", cor: "var(--cor-lgpd)" },
    "card-letramento": { nome: "verde-azulado", cor: "var(--cor-letramento)" },
    "card-seguranca": { nome: "âmbar", cor: "var(--cor-seguranca)" },
    "card-saude": { nome: "rosa", cor: "var(--cor-saude)" },
    "card-cor-5": { nome: "azul-petróleo", cor: "var(--cor-paleta-5)" },
};

const CORES = Object.keys(PALETA_CATEGORIA);

const VARIANTES_PADRAO = [
    "biblioteca-card-azul",
    "biblioteca-card-roxo",
    "biblioteca-card-verde",
    "biblioteca-card-rosa",
    "biblioteca-card-branco",
    "biblioteca-card-ambar",
];

const CORES_VARIANTE = {
    "card-cor-1": "biblioteca-card-azul",
    "card-cor-2": "biblioteca-card-verde",
    "card-cor-3": "biblioteca-card-roxo",
    "card-cor-4": "biblioteca-card-ambar",
    "card-cor-5": "biblioteca-card-verde",
    "card-cor-6": "biblioteca-card-ambar",
    "card-lgpd": "biblioteca-card-roxo",
    "card-letramento": "biblioteca-card-verde",
    "card-seguranca": "biblioteca-card-ambar",
    "card-saude": "biblioteca-card-rosa",
};

function contarMateriais(quantidade) {
    if (!quantidade) return "Nenhum material ainda";
    return `${quantidade} ${quantidade === 1 ? "material" : "materiais"}`;
}

function escolherIlustracao(categoria) {
    const nome = `${categoria.icon || ""} ${categoria.name || ""} ${categoria.slug || ""}`
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();

    if (/podcast|audio|microfone/.test(nome)) return "podcast";
    if (/youtube|video|player/.test(nome)) return "video";
    if (/infograf|grafico|chart/.test(nome)) return "infografico";
    if (/guia|manual|livro|book/.test(nome)) return "guia";
    if (/planilha|excel|tabela|spreadsheet/.test(nome)) return "planilha";
    if (/imagem|foto|image|picture/.test(nome)) return "imagem";
    if (/link|elo|corrente/.test(nome)) return "link";
    if (/document|pdf|word|arquivo|file/.test(nome)) return "documento";
    return "pasta";
}

function IlustracaoBiblioteca({ tipo }) {
    const id = useId();
    const claro = `${id}-claro`;
    const escuro = `${id}-escuro`;
    const acento = `${id}-acento`;
    const common = {
        fill: `url(#${claro})`,
        stroke: `url(#${escuro})`,
        strokeWidth: 3,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    return (
        <svg
            className="biblioteca-ilustracao-svg"
            viewBox="0 0 260 230"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id={claro} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="var(--branco)" stopOpacity=".98" />
                    <stop offset="1" stopColor="var(--cor-card)" stopOpacity=".88" />
                </linearGradient>
                <linearGradient id={escuro} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="var(--branco)" stopOpacity=".9" />
                    <stop offset="1" stopColor="var(--cor-card)" />
                </linearGradient>
                <linearGradient id={acento} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="var(--cor-card)" />
                    <stop offset="1" stopColor="var(--azul-profundo)" />
                </linearGradient>
                <filter id={`${id}-sombra`} x="-30%" y="-30%" width="160%" height="170%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                    <feOffset dy="7" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope=".2" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <g filter={`url(#${id}-sombra)`} {...common}>
                {tipo === "podcast" && (
                    <>
                        <path d="M56 126v-17a74 74 0 0 1 148 0v17" />
                        <rect x="48" y="112" width="31" height="62" rx="15" />
                        <rect x="181" y="112" width="31" height="62" rx="15" />
                        <path d="M196 172c-4 19-20 27-43 27h-17" fill="none" />
                        <circle cx="127" cy="197" r="8" fill={`url(#${acento})`} />
                        <rect x="111" y="69" width="34" height="76" rx="17" fill={`url(#${acento})`} />
                        <path d="M99 117v13a29 29 0 0 0 58 0v-13" fill="none" />
                        <path d="M127 159v17m-18 0h36" fill="none" />
                    </>
                )}
                {tipo === "video" && (
                    <>
                        <rect x="38" y="50" width="184" height="132" rx="23" />
                        <path d="M39 82h182" fill="none" />
                        <circle cx="59" cy="66" r="4" fill={`url(#${acento})`} />
                        <circle cx="74" cy="66" r="4" fill={`url(#${acento})`} />
                        <circle cx="89" cy="66" r="4" fill={`url(#${acento})`} />
                        <circle cx="130" cy="128" r="34" fill={`url(#${acento})`} />
                        <path d="m122 110 27 18-27 18z" fill="var(--branco)" stroke="none" />
                    </>
                )}
                {tipo === "infografico" && (
                    <>
                        <rect x="43" y="44" width="174" height="147" rx="23" />
                        <path d="M67 162h126M77 151v-31h23v31m16 0V91h23v60m16 0v-44h23v44" fill={`url(#${acento})`} />
                        <circle cx="185" cy="78" r="20" fill={`url(#${acento})`} />
                        <path d="M185 58v20h20" fill="none" stroke="var(--branco)" />
                        <path d="M68 79h42" fill="none" />
                    </>
                )}
                {tipo === "guia" && (
                    <>
                        <path d="M128 73c-26-18-54-20-83-9v112c29-11 57-9 83 9 26-18 54-20 83-9V64c-29-11-57-9-83 9Z" />
                        <path d="M128 75v109M66 91c15-4 30-3 43 2m-43 18c15-4 30-3 43 2m65-22c8-2 17-2 25 0m-25 18c8-2 17-2 25 0" fill="none" />
                        <path d="M106 66v25l12-8 12 8V73" fill={`url(#${acento})`} />
                    </>
                )}
                {tipo === "documento" && (
                    <>
                        <path d="M75 47h76l38 38v105H75a16 16 0 0 1-16-16V63a16 16 0 0 1 16-16Z" />
                        <path d="M151 48v29a10 10 0 0 0 10 10h28" fill={`url(#${acento})`} />
                        <path d="M91 111h79m-79 22h79m-79 22h55" fill="none" />
                        <path d="M42 75h14v111a16 16 0 0 0 16 16h92" fill="none" opacity=".55" />
                    </>
                )}
                {tipo === "planilha" && (
                    <>
                        <rect x="42" y="45" width="176" height="142" rx="21" />
                        <path d="M43 83h174M43 118h174M43 153h174M87 84v102m44-102v102m44-102v102" fill="none" />
                        <rect x="88" y="84" width="42" height="33" rx="4" fill={`url(#${acento})`} />
                        <rect x="132" y="119" width="42" height="33" rx="4" fill={`url(#${acento})`} opacity=".82" />
                        <path d="M58 65h85" fill="none" />
                    </>
                )}
                {tipo === "imagem" && (
                    <>
                        <rect x="39" y="48" width="182" height="139" rx="24" />
                        <circle cx="168" cy="87" r="17" fill={`url(#${acento})`} />
                        <path d="m52 162 47-49 27 27 25-23 56 45v8H52z" fill={`url(#${acento})`} />
                        <path d="m99 113 27 27 25-23" fill="none" />
                    </>
                )}
                {tipo === "link" && (
                    <>
                        <path d="m105 143-15 15a32 32 0 0 1-45-45l30-30a32 32 0 0 1 45 0" fill="none" strokeWidth="17" />
                        <path d="m155 87 15-15a32 32 0 0 1 45 45l-30 30a32 32 0 0 1-45 0" fill="none" strokeWidth="17" />
                        <path d="m91 139 78-78" fill="none" stroke={`url(#${acento})`} strokeWidth="15" />
                        <path d="m109 91 42 42" fill="none" stroke="var(--branco)" strokeWidth="6" opacity=".75" />
                    </>
                )}
                {tipo === "pasta" && (
                    <>
                        <path d="M37 78a18 18 0 0 1 18-18h55l19 20h76a18 18 0 0 1 18 18v76a18 18 0 0 1-18 18H55a18 18 0 0 1-18-18z" />
                        <path d="m50 107 17-18h147l-23 83a17 17 0 0 1-16 12H54a17 17 0 0 1-16-21z" fill={`url(#${acento})`} />
                        <path d="M87 58h43l17 18h-43z" opacity=".9" />
                    </>
                )}
            </g>
            <ellipse cx="136" cy="203" rx="70" ry="9" fill="var(--azul-profundo)" opacity=".14" />
        </svg>
    );
}

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
        <div className="biblioteca anim-page-enter">
            <div className="biblioteca-top biblioteca-top-acoes">
                <div>
                    <h1>Biblioteca</h1>
                    <p>Materiais de apoio para os seus estudos.</p>
                </div>
                {administrador && (
                    <button type="button" className="biblioteca-botao-principal" onClick={abrirCriacao}>
                        Nova categoria
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
                    {categorias.map((categoria, indice) => {
                        const cor = categoria.color || "";
                        const variante = CORES_VARIANTE[cor] || VARIANTES_PADRAO[indice % VARIANTES_PADRAO.length];
                        const palavras = categoria.name.trim().split(/\s+/);
                        const tituloPrimario = palavras.shift() || categoria.name;
                        const tituloSecundario = palavras.join(" ");
                        const quantidade = Number(categoria.material_count) || 0;

                        return (
                            <article
                                className={`biblioteca-categoria-card ${cor || "card-cor-1"} ${variante}`}
                                key={categoria.id}
                            >
                                <Link
                                    className="biblioteca-categoria-link"
                                    to={`/biblioteca/${categoria.slug}`}
                                    aria-label={`${categoria.name}, ${contarMateriais(quantidade)}. Ver materiais.`}
                                >
                                    <div className="biblioteca-categoria-conteudo">
                                        <h2>
                                            <span>{tituloPrimario}</span>
                                            {tituloSecundario && <span className="biblioteca-titulo-suave">{tituloSecundario}</span>}
                                        </h2>
                                        {categoria.description && (
                                            <p className="biblioteca-categoria-descricao">{categoria.description}</p>
                                        )}
                                        <span className="biblioteca-badge biblioteca-categoria-contagem">
                                            {contarMateriais(quantidade)}
                                        </span>
                                        <span className="biblioteca-ver-materiais">
                                            <span className="biblioteca-seta" aria-hidden="true">↗</span>
                                            <span>Ver materiais</span>
                                        </span>
                                    </div>
                                    <span className="biblioteca-ilustracao">
                                        <IlustracaoBiblioteca tipo={escolherIlustracao(categoria)} />
                                    </span>
                                </Link>
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
                                    {CORES.map((valor) => (
                                        <label
                                            key={valor}
                                            className={`biblioteca-opcao-cor ${valor}`}
                                            data-tooltip={`Cor ${PALETA_CATEGORIA[valor].nome}`}
                                            style={{ "--cor-opcao": PALETA_CATEGORIA[valor].cor }}
                                        >
                                            <input
                                                type="radio"
                                                name="cor"
                                                value={valor}
                                                aria-label={`Cor ${PALETA_CATEGORIA[valor].nome}`}
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
