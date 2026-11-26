import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import { ehAdm } from "../../utils/permissoes";
import { ApiError } from "../../services/api";
import {
    atualizarMaterial,
    baixarArquivo,
    criarMaterial,
    criarUrlVisualizacao,
    excluirMaterial,
    listarMateriais,
} from "../../services/library";
import "../../assets/css/pages_css/biblioteca.css";

const TIPOS = ["", "PDF", "WORD", "EXCEL", "POWERPOINT", "IMAGE", "VIDEO", "AUDIO", "LINK", "YOUTUBE", "OTHER"];

function mensagemErro(falha, alternativa) {
    return falha instanceof ApiError ? falha.message : alternativa;
}

function tamanhoArquivo(bytes) {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })} MB`;
}

function formatarData(valor) {
    if (!valor) return "";
    const data = new Date(`${String(valor).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(data.getTime())) return "";
    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    return `${data.getDate()} ${meses[data.getMonth()]} ${data.getFullYear()}`;
}

function dominioUrl(valor) {
    try {
        return new URL(valor).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}

function youtubeEmbed(url) {
    try {
        const parsed = new URL(url);
        let id = "";
        if (parsed.hostname.includes("youtu.be")) id = parsed.pathname.slice(1).split("/")[0];
        else if (parsed.pathname === "/watch") id = parsed.searchParams.get("v");
        else id = parsed.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]+)/)?.[1] || "";
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
    } catch {
        return "";
    }
}

function rotuloTipo(tipo) {
    return {
        YOUTUBE: "YouTube",
        IMAGE: "Imagem",
        VIDEO: "Vídeo",
        AUDIO: "Áudio",
        WORD: "Word",
        EXCEL: "Excel",
        POWERPOINT: "PowerPoint",
        PDF: "PDF",
        LINK: "Link",
        OTHER: "Outro",
    }[tipo] || "Material";
}

function acaoMaterial(tipo) {
    return {
        YOUTUBE: "Assistir",
        VIDEO: "Assistir",
        AUDIO: "Ouvir",
        PDF: "Visualizar",
        IMAGE: "Visualizar",
        LINK: "Abrir",
        WORD: "Baixar",
        EXCEL: "Baixar",
        POWERPOINT: "Baixar",
        OTHER: "Baixar",
    }[tipo] || "Baixar";
}

function IconeMaterial({ tipo, className }) {
    return (
        <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            {tipo === "YOUTUBE" || tipo === "VIDEO" ? (
                <>
                    <rect x="7" y="13" width="50" height="38" rx="9" />
                    <path d="m27 23 16 9-16 9z" />
                </>
            ) : null}
            {tipo === "AUDIO" && (
                <>
                    <path d="M17 35V29a15 15 0 0 1 30 0v6" />
                    <rect x="12" y="32" width="9" height="17" rx="4" />
                    <rect x="43" y="32" width="9" height="17" rx="4" />
                    <path d="M43 48c-2 5-7 7-14 7" />
                </>
            )}
            {tipo === "LINK" && (
                <>
                    <path d="m27 39-5 5a10 10 0 0 1-14-14l9-9a10 10 0 0 1 14 0" />
                    <path d="m37 25 5-5a10 10 0 0 1 14 14l-9 9a10 10 0 0 1-14 0" />
                    <path d="m23 41 18-18" />
                </>
            )}
            {["PDF", "WORD", "EXCEL", "POWERPOINT", "OTHER"].includes(tipo) && (
                <>
                    <path d="M17 7h20l12 12v38H17z" />
                    <path d="M37 8v12h12" />
                    {tipo === "EXCEL" ? (
                        <>
                            <path d="M23 30h20M23 38h20M23 46h20M30 29v18m7-18v18" />
                            <path d="m23 28 8 9-8 9m14-18-8 9 8 9" />
                        </>
                    ) : tipo === "POWERPOINT" ? (
                        <>
                            <circle cx="32" cy="38" r="10" />
                            <path d="M29 32v12m0-12h5a4 4 0 0 1 0 8h-5" />
                        </>
                    ) : (
                        <>
                            <path d="M24 33h18M24 40h18M24 47h12" />
                            <text x="32" y="31" textAnchor="middle">{tipo === "WORD" ? "W" : tipo === "PDF" ? "PDF" : "DOC"}</text>
                        </>
                    )}
                </>
            )}
            {tipo === "IMAGE" && (
                <>
                    <rect x="7" y="12" width="50" height="40" rx="7" />
                    <circle cx="41" cy="24" r="5" />
                    <path d="m11 46 14-15 9 10 6-7 13 14" />
                </>
            )}
        </svg>
    );
}

function CapaMaterial({ material, corCategoria }) {
    const ref = useRef(null);
    const [imagemUrl, setImagemUrl] = useState("");
    const [imagemFalhou, setImagemFalhou] = useState(false);
    const [miniaturaFalhou, setMiniaturaFalhou] = useState(false);

    useEffect(() => {
        if (material.type !== "IMAGE") return undefined;
        let cancelado = false;
        let urlObjeto = "";
        let observer;

        async function carregarImagem() {
            try {
                const url = await criarUrlVisualizacao(material.id);
                if (cancelado) {
                    window.URL.revokeObjectURL(url);
                    return;
                }
                urlObjeto = url;
                setImagemUrl(url);
            } catch {
                if (!cancelado) setImagemFalhou(true);
            }
        }

        if ("IntersectionObserver" in window && ref.current) {
            observer = new IntersectionObserver((entradas) => {
                if (entradas.some((entrada) => entrada.isIntersecting)) {
                    observer.disconnect();
                    carregarImagem();
                }
            });
            observer.observe(ref.current);
        } else {
            carregarImagem();
        }

        return () => {
            cancelado = true;
            observer?.disconnect();
            if (urlObjeto) window.URL.revokeObjectURL(urlObjeto);
        };
    }, [material.id, material.type]);

    const youtubeId = material.type === "YOUTUBE"
        ? youtubeEmbed(material.url)?.split("/").pop()
        : "";
    const youtubeThumbnail = youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : "";
    const videoThumbnail = material.thumbnail_path || "";
    const showYoutube = youtubeThumbnail && !miniaturaFalhou;
    const showImage = material.type === "IMAGE" && imagemUrl && !imagemFalhou;
    const showVideoThumbnail = material.type === "VIDEO" && videoThumbnail && !miniaturaFalhou;
    const hasPlayablePreview = material.type === "YOUTUBE" || material.type === "VIDEO";
    const destaque = material.size_bytes
        ? tamanhoArquivo(material.size_bytes)
        : dominioUrl(material.url);

    return (
        <div
            ref={ref}
            className={`biblioteca-material-midia ${corCategoria || "biblioteca-card-azul"}`}
        >
            <div className="biblioteca-material-placeholder" aria-hidden="true">
                <IconeMaterial tipo={material.type} className="biblioteca-placeholder-icone" />
            </div>
            {showYoutube && (
                <img
                    className="biblioteca-capa-imagem"
                    src={youtubeThumbnail}
                    alt={`Miniatura do vídeo ${material.title}`}
                    loading="lazy"
                    onError={() => setMiniaturaFalhou(true)}
                />
            )}
            {showImage && (
                <img
                    className="biblioteca-capa-imagem"
                    src={imagemUrl}
                    alt={`Prévia de ${material.title}`}
                    loading="lazy"
                    onError={() => setImagemFalhou(true)}
                />
            )}
            {showVideoThumbnail && (
                <img
                    className="biblioteca-capa-imagem"
                    src={videoThumbnail}
                    alt={`Miniatura do vídeo ${material.title}`}
                    loading="lazy"
                    onError={() => setMiniaturaFalhou(true)}
                />
            )}
            {hasPlayablePreview && (
                <span className="biblioteca-botao-play" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="m9 6 10 6-10 6z" />
                    </svg>
                </span>
            )}
            <span className="biblioteca-material-tipo">{rotuloTipo(material.type)}</span>
            {destaque && <span className="biblioteca-material-destaque">{destaque}</span>}
        </div>
    );
}

function BibliotecaCategoria() {
    const { slug } = useParams();
    const { usuario } = useAuth();
    const administrador = ehAdm(usuario);
    const [dados, setDados] = useState(null);
    const [itens, setItens] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [busca, setBusca] = useState("");
    const [tipo, setTipo] = useState("");
    const [pagina, setPagina] = useState(1);
    const [paginas, setPaginas] = useState(1);
    const [modal, setModal] = useState(null);
    const [arquivo, setArquivo] = useState(null);
    const [form, setForm] = useState({ title: "", description: "", tags: "", type: "FILE", url: "" });
    const [progresso, setProgresso] = useState(0);
    const [salvando, setSalvando] = useState(false);
    const [erroModal, setErroModal] = useState("");
    const [visualizador, setVisualizador] = useState(null);
    const [menuAbertoId, setMenuAbertoId] = useState(null);
    const primeiroCampoRef = useRef(null);
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);

    useEffect(() => {
        let cancelado = false;
        listarMateriais(slug, { page: pagina, per_page: 12, type: tipo, search: busca })
            .then((resultado) => {
                if (!cancelado) {
                    setDados(resultado.category);
                    setItens(resultado.items);
                    setPaginas(resultado.pages || 1);
                    setErro("");
                }
            })
            .catch((falha) => {
                if (!cancelado) setErro(mensagemErro(falha, "Não foi possível carregar os materiais."));
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });
        return () => { cancelado = true; };
    }, [slug, pagina, tipo, busca, tentativa]);

    useEffect(() => {
        if (!modal && !visualizador) return undefined;
        primeiroCampoRef.current?.focus();
        const fechar = (evento) => {
            if (evento.key === "Escape" && !salvando) {
                setModal(null);
                setVisualizador(null);
            }
        };
        window.addEventListener("keydown", fechar);
        return () => window.removeEventListener("keydown", fechar);
    }, [modal, visualizador, salvando]);

    useEffect(() => () => {
        if (visualizador?.url) window.URL.revokeObjectURL(visualizador.url);
    }, [visualizador]);

    useEffect(() => {
        if (menuAbertoId === null) return undefined;
        menuRef.current?.querySelector('[role="menuitem"]')?.focus();

        function fecharComEscape(evento) {
            if (evento.key === "Escape") {
                evento.preventDefault();
                setMenuAbertoId(null);
                menuButtonRef.current?.focus();
            }
        }

        function fecharAoClicarFora(evento) {
            if (
                !menuRef.current?.contains(evento.target) &&
                !menuButtonRef.current?.contains(evento.target)
            ) {
                setMenuAbertoId(null);
            }
        }

        window.addEventListener("keydown", fecharComEscape);
        document.addEventListener("pointerdown", fecharAoClicarFora);
        return () => {
            window.removeEventListener("keydown", fecharComEscape);
            document.removeEventListener("pointerdown", fecharAoClicarFora);
        };
    }, [menuAbertoId]);

    function abrirCriacao() {
        setForm({ title: "", description: "", tags: "", type: "FILE", url: "" });
        setArquivo(null);
        setProgresso(0);
        setErroModal("");
        setModal({ modo: "criar" });
    }

    function abrirEdicao(material) {
        setForm({
            title: material.title,
            description: material.description || "",
            tags: material.tags || "",
            type: material.url ? (material.type === "YOUTUBE" ? "YOUTUBE" : "LINK") : "FILE",
            url: material.url || "",
            tipoPersistido: material.type,
        });
        setArquivo(null);
        setProgresso(0);
        setErroModal("");
        setModal({ modo: "editar", material });
    }

    async function salvar(evento) {
        evento.preventDefault();
        if (!form.title.trim()) {
            setErroModal("Informe o título do material.");
            return;
        }
        if (form.type !== "FILE" && !form.url.trim()) {
            setErroModal("Informe a URL do material.");
            return;
        }
        if (form.type === "FILE" && modal.modo === "criar" && !arquivo) {
            setErroModal("Selecione um arquivo.");
            return;
        }
        if (form.type === "FILE" && modal.modo === "editar" && !arquivo && !modal.material.original_filename) {
            setErroModal("Selecione um arquivo.");
            return;
        }

        const formData = new FormData();
        formData.append("title", form.title.trim());
        formData.append("description", form.description.trim());
        formData.append("tags", form.tags.trim());
        formData.append("category_id", dados.id);
        if (form.type === "FILE") {
            formData.append("type", modal.modo === "editar" ? form.tipoPersistido || "OTHER" : "OTHER");
            if (arquivo) formData.append("file", arquivo);
        } else {
            formData.append("type", form.type);
            formData.append("url", form.url.trim());
        }

        setSalvando(true);
        setErroModal("");
        try {
            if (modal.modo === "editar") await atualizarMaterial(modal.material.id, formData, setProgresso);
            else await criarMaterial(formData, setProgresso);
            setModal(null);
            setTentativa((valor) => valor + 1);
        } catch (falha) {
            setErroModal(mensagemErro(falha, "Não foi possível salvar o material."));
        } finally {
            setSalvando(false);
        }
    }

    async function excluir(material) {
        if (!window.confirm(`Excluir o material "${material.title}"?`)) return;
        try {
            await excluirMaterial(material.id);
            setTentativa((valor) => valor + 1);
        } catch (falha) {
            setErro(mensagemErro(falha, "Não foi possível excluir o material."));
        }
    }

    async function baixarMaterial(material) {
        try {
            await baixarArquivo(material.id, material.original_filename);
        } catch (falha) {
            setErro(mensagemErro(falha, "Não foi possível baixar o arquivo."));
        }
    }

    function executarAcaoPrincipal(material) {
        if (material.type === "LINK") {
            window.open(material.url, "_blank", "noopener,noreferrer");
            return;
        }
        if (acaoMaterial(material.type) === "Baixar") {
            baixarMaterial(material);
            return;
        }
        abrirVisualizador(material);
    }

    function navegarMenu(evento) {
        const botoes = Array.from(
            evento.currentTarget.querySelectorAll('[role="menuitem"]')
        );
        const indiceAtual = botoes.indexOf(document.activeElement);
        let proximoIndice;

        if (evento.key === "ArrowDown") proximoIndice = (indiceAtual + 1) % botoes.length;
        else if (evento.key === "ArrowUp") proximoIndice = (indiceAtual - 1 + botoes.length) % botoes.length;
        else if (evento.key === "Home") proximoIndice = 0;
        else if (evento.key === "End") proximoIndice = botoes.length - 1;
        else return;

        evento.preventDefault();
        botoes[proximoIndice]?.focus();
    }

    async function abrirVisualizador(material) {
        if (material.type === "YOUTUBE") {
            const embed = youtubeEmbed(material.url);
            if (embed) setVisualizador({ tipo: "youtube", embed, titulo: material.title });
            return;
        }
        try {
            const url = await criarUrlVisualizacao(material.id);
            setVisualizador({
                tipo: material.type === "IMAGE" ? "image" : material.type.toLowerCase(),
                url,
                titulo: material.title,
            });
        } catch (falha) {
            setErro(mensagemErro(falha, "Não foi possível abrir o material."));
        }
    }

    return (
        <div className="biblioteca biblioteca-categoria-pagina anim-page-enter">
            <nav className="biblioteca-breadcrumb" aria-label="Caminho">
                <Link to="/biblioteca">Biblioteca</Link><span aria-hidden="true">›</span><span>{dados?.name || "Categoria"}</span>
            </nav>
            <div className="biblioteca-top biblioteca-top-acoes">
                <div><h1>{dados?.name || "Categoria"}</h1><p>{dados?.description || "Materiais de apoio desta categoria."}</p></div>
                {administrador && <button type="button" className="biblioteca-botao-principal" onClick={abrirCriacao}>Adicionar material</button>}
            </div>

            <div className="biblioteca-filtros">
                <label><span>Buscar por título</span><input value={busca} onChange={(evento) => { setBusca(evento.target.value); setPagina(1); }} placeholder="Buscar material" /></label>
                <label><span>Tipo</span><select value={tipo} onChange={(evento) => { setTipo(evento.target.value); setPagina(1); }}>
                    {TIPOS.map((item) => <option value={item} key={item || "todos"}>{item || "Todos"}</option>)}
                </select></label>
            </div>

            {carregando && (
                <section className="biblioteca-skeletons biblioteca-materiais-skeletons" aria-label="Carregando materiais">
                    {[1, 2, 3].map((item) => (
                        <article className="biblioteca-material-skeleton" key={item} aria-hidden="true">
                            <div className="biblioteca-material-skeleton-midia" />
                            <div className="biblioteca-material-skeleton-corpo">
                                <span />
                                <span />
                                <span />
                            </div>
                        </article>
                    ))}
                </section>
            )}
            {!carregando && erro && <section className="biblioteca-estado biblioteca-estado-erro" role="alert"><p>{erro}</p><button type="button" className="biblioteca-botao-secundario" onClick={() => { setCarregando(true); setTentativa((valor) => valor + 1); }}>Tentar novamente</button></section>}
            {!carregando && !erro && itens.length === 0 && (
                <section className="biblioteca-estado biblioteca-materiais-vazio">
                    <h2>Nenhum material encontrado</h2>
                    <p>{busca || tipo ? "Tente limpar os filtros." : "Esta categoria ainda não possui materiais."}</p>
                    {administrador && (
                        <button type="button" className="biblioteca-botao-principal" onClick={abrirCriacao}>
                            Adicionar material
                        </button>
                    )}
                </section>
            )}
            {!carregando && !erro && itens.length > 0 && (
                <section className="biblioteca-materiais">
                    {itens.map((material) => {
                        const acao = acaoMaterial(material.type);
                        const tags = material.tags
                            ? material.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                            : [];
                        const temArquivo = Boolean(material.original_filename);
                        const corCategoria = dados?.color;
                        const idMenu = `material-menu-${material.id}`;

                        return (
                            <article
                                className={`biblioteca-material-card ${dados?.color || "biblioteca-card-azul"}`}
                                key={material.id}
                            >
                                {material.type === "LINK" ? (
                                    <a
                                        className="biblioteca-material-trigger"
                                        href={material.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Abrir: ${material.title}`}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        className="biblioteca-material-trigger"
                                        aria-label={`${acao}: ${material.title}`}
                                        onClick={() => executarAcaoPrincipal(material)}
                                    />
                                )}

                                <CapaMaterial material={material} corCategoria={corCategoria} />

                                <div className="biblioteca-material-corpo">
                                    <h3>{material.title}</h3>
                                    {material.description && (
                                        <p className="biblioteca-material-descricao">{material.description}</p>
                                    )}
                                    {tags.length > 0 && (
                                        <div className="biblioteca-tags" aria-label="Tags">
                                            {tags.slice(0, 3).map((tag, indice) => (
                                                <span key={`${tag}-${indice}`}>{tag}</span>
                                            ))}
                                            {tags.length > 3 && (
                                                <span className="biblioteca-tag-mais">+{tags.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                    <footer className="biblioteca-material-rodape">
                                        <span className="biblioteca-material-data">
                                            <svg viewBox="0 0 16 16" aria-hidden="true">
                                                <rect x="2.2" y="3.5" width="11.6" height="10" rx="1.5" />
                                                <path d="M5 2v3m6-3v3M2.5 6.5h11" />
                                            </svg>
                                            {formatarData(material.created_at)}
                                        </span>
                                        <div className="biblioteca-material-acoes">
                                            <span className="biblioteca-material-acao biblioteca-botao-principal" aria-hidden="true">
                                                <IconeMaterial tipo={material.type} className="biblioteca-acao-icone" />
                                                {acao}
                                            </span>
                                            {temArquivo && (
                                                <button
                                                    type="button"
                                                    className="biblioteca-baixar-icone"
                                                    aria-label={`Baixar ${material.title}`}
                                                    title={`Baixar ${material.title}`}
                                                    onClick={(evento) => {
                                                        evento.preventDefault();
                                                        evento.stopPropagation();
                                                        baixarMaterial(material);
                                                    }}
                                                >
                                                    <svg viewBox="0 0 20 20" aria-hidden="true">
                                                        <path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M3.5 13v3.5h13V13" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </footer>
                                </div>

                                {administrador && (
                                    <div
                                        className="biblioteca-material-menu-wrap"
                                        onBlur={(evento) => {
                                            if (!evento.currentTarget.contains(evento.relatedTarget)) {
                                                setMenuAbertoId(null);
                                            }
                                        }}
                                    >
                                        <button
                                            ref={menuAbertoId === material.id ? menuButtonRef : null}
                                            type="button"
                                            className="biblioteca-material-menu-botao"
                                            aria-label={`Ações do material ${material.title}`}
                                            aria-haspopup="menu"
                                            aria-expanded={menuAbertoId === material.id}
                                            aria-controls={idMenu}
                                            title="Ações do material"
                                            onClick={(evento) => {
                                                evento.stopPropagation();
                                                setMenuAbertoId((atual) => atual === material.id ? null : material.id);
                                            }}
                                        >
                                            <span aria-hidden="true">⋯</span>
                                        </button>
                                        {menuAbertoId === material.id && (
                                            <div
                                                ref={menuRef}
                                                id={idMenu}
                                                className="biblioteca-material-menu"
                                                role="menu"
                                                aria-label={`Ações do material ${material.title}`}
                                                onKeyDown={navegarMenu}
                                            >
                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                        setMenuAbertoId(null);
                                                        abrirEdicao(material);
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                        setMenuAbertoId(null);
                                                        excluir(material);
                                                    }}
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>
            )}

            {paginas > 1 && <div className="biblioteca-paginacao"><button type="button" className="biblioteca-botao-secundario" disabled={pagina <= 1} onClick={() => setPagina((valor) => valor - 1)}>Anterior</button><span>Página {pagina} de {paginas}</span><button type="button" className="biblioteca-botao-secundario" disabled={pagina >= paginas} onClick={() => setPagina((valor) => valor + 1)}>Próxima</button></div>}

            {modal && (
                <div className="biblioteca-overlay" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !salvando) setModal(null); }}>
                    <section className="biblioteca-modal" role="dialog" aria-modal="true" aria-labelledby="material-modal-titulo">
                        <div className="biblioteca-modal-topo"><h2 id="material-modal-titulo">{modal.modo === "editar" ? "Editar material" : "Adicionar material"}</h2><button type="button" className="biblioteca-fechar" aria-label="Fechar" onClick={() => setModal(null)} disabled={salvando}>×</button></div>
                        <form className="biblioteca-form" onSubmit={salvar}>
                            <label>Título<input ref={primeiroCampoRef} value={form.title} onChange={(evento) => setForm({ ...form, title: evento.target.value })} maxLength="200" /></label>
                            <label>Descrição<textarea value={form.description} onChange={(evento) => setForm({ ...form, description: evento.target.value })} rows="3" /></label>
                            <label>Tipo<select value={form.type} onChange={(evento) => setForm({ ...form, type: evento.target.value })}><option value="FILE">Arquivo</option><option value="LINK">Link</option><option value="YOUTUBE">YouTube</option></select></label>
                            {form.type === "FILE" ? (
                                <label className="biblioteca-dropzone"><span>{arquivo ? arquivo.name : "Selecione ou solte um arquivo"}</span><input type="file" onChange={(evento) => setArquivo(evento.target.files?.[0] || null)} /></label>
                            ) : (
                                <label>URL<input type="url" value={form.url} onChange={(evento) => setForm({ ...form, url: evento.target.value })} placeholder="https://" /></label>
                            )}
                            {form.type === "YOUTUBE" && form.url && youtubeEmbed(form.url) && <img className="biblioteca-youtube-preview" src={`https://i.ytimg.com/vi/${youtubeEmbed(form.url).split("/").pop()}/hqdefault.jpg`} alt="Prévia do vídeo do YouTube" />}
                            <label>Tags<input value={form.tags} onChange={(evento) => setForm({ ...form, tags: evento.target.value })} placeholder="Separe por vírgulas" /></label>
                            {salvando && <div className="biblioteca-progresso"><span style={{ width: `${progresso}%` }} /></div>}
                            {erroModal && <p className="biblioteca-erro" role="alert">{erroModal}</p>}
                            <div className="biblioteca-modal-acoes"><button type="button" className="biblioteca-botao-secundario" onClick={() => setModal(null)} disabled={salvando}>Cancelar</button><button type="submit" className="biblioteca-botao-principal" disabled={salvando}>{salvando ? `Enviando ${progresso}%` : "Salvar"}</button></div>
                        </form>
                    </section>
                </div>
            )}

            {visualizador && (
                <div className="biblioteca-overlay" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setVisualizador(null); }}>
                    <section className="biblioteca-modal biblioteca-visualizador" role="dialog" aria-modal="true" aria-label={visualizador.titulo}>
                        <div className="biblioteca-modal-topo"><h2>{visualizador.titulo}</h2><button type="button" className="biblioteca-fechar" aria-label="Fechar" onClick={() => setVisualizador(null)}>×</button></div>
                        {visualizador.tipo === "youtube" && <iframe className="biblioteca-player" src={visualizador.embed} title={visualizador.titulo} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
                        {visualizador.tipo === "image" && <img className="biblioteca-imagem-ampliada" src={visualizador.url} alt={visualizador.titulo} />}
                        {visualizador.tipo === "pdf" && <iframe className="biblioteca-player" src={visualizador.url} title={visualizador.titulo} />}
                        {visualizador.tipo === "video" && <video className="biblioteca-player" src={visualizador.url} controls><track kind="captions" /></video>}
                        {visualizador.tipo === "audio" && <audio className="biblioteca-audio" src={visualizador.url} controls />}
                    </section>
                </div>
            )}
        </div>
    );
}

export default BibliotecaCategoria;
