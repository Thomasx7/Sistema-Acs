import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { calcularRecorteFoto, gerarFotoRecortada } from "../utils/recorteFoto";
import "../assets/css/components_css/recorte-foto.css";

const limitar = (valor) => Math.max(0, Math.min(100, valor));

export default function RecorteFotoModal({ origem, focoRetornoRef, aoCancelar, aoConfirmar }) {
    const [dimensoes, setDimensoes] = useState(null);
    const [posicao, setPosicao] = useState({ horizontal: 50, vertical: 50 });
    const [zoom, setZoom] = useState(1);
    const [erro, setErro] = useState("");
    const [preparando, setPreparando] = useState(false);
    const imagemRef = useRef(null);
    const modalRef = useRef(null);
    const arrastoRef = useRef(null);
    const montadoRef = useRef(false);

    useEffect(() => {
        montadoRef.current = true;
        return () => {
            montadoRef.current = false;
        };
    }, []);

    useEffect(() => {
        const focoAnterior = focoRetornoRef.current || document.activeElement;
        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        modalRef.current?.focus();
        return () => {
            document.body.style.overflow = overflowAnterior;
            focoAnterior?.focus();
        };
    }, [focoRetornoRef]);

    const recorte = dimensoes && calcularRecorteFoto(dimensoes.largura, dimensoes.altura, zoom, posicao.horizontal, posicao.vertical);

    function aoPressionar(evento) {
        if (evento.key === "Escape") {
            evento.preventDefault();
            if (!preparando) aoCancelar();
        }
        if (evento.key !== "Tab") return;
        const controles = [...modalRef.current.querySelectorAll("button:not(:disabled), input:not(:disabled), [tabindex='0']")];
        const primeiro = controles[0];
        const ultimo = controles.at(-1);
        if (evento.shiftKey && (document.activeElement === primeiro || document.activeElement === modalRef.current)) {
            evento.preventDefault();
            ultimo?.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro?.focus();
        }
    }

    function iniciarArrasto(evento) {
        if (!recorte || preparando || evento.button !== 0) return;
        evento.currentTarget.focus();
        evento.currentTarget.setPointerCapture(evento.pointerId);
        arrastoRef.current = { x: evento.clientX, y: evento.clientY, ...posicao };
    }

    function mover(evento) {
        const inicio = arrastoRef.current;
        if (!inicio || !recorte) return;
        const lado = evento.currentTarget.getBoundingClientRect().width;
        const deslocamentoX = (dimensoes.largura / recorte.tamanho - 1) * lado;
        const deslocamentoY = (dimensoes.altura / recorte.tamanho - 1) * lado;
        setPosicao({
            horizontal: deslocamentoX > 0 ? limitar(inicio.horizontal - (evento.clientX - inicio.x) / deslocamentoX * 100) : 50,
            vertical: deslocamentoY > 0 ? limitar(inicio.vertical - (evento.clientY - inicio.y) / deslocamentoY * 100) : 50,
        });
    }

    async function confirmar() {
        if (!recorte || preparando) return;
        setPreparando(true);
        setErro("");
        try {
            const foto = await gerarFotoRecortada(imagemRef.current, recorte);
            if (montadoRef.current) aoConfirmar(foto);
        } catch (falha) {
            if (montadoRef.current) setErro(falha.message || "Não foi possível recortar a foto.");
        } finally {
            if (montadoRef.current) setPreparando(false);
        }
    }

    return createPortal(
        <div className="recorte-foto-overlay" onKeyDown={aoPressionar}>
            <section className="recorte-foto-modal" role="dialog" aria-modal="true" aria-labelledby="recorte-foto-titulo"
                aria-describedby="recorte-foto-ajuda" ref={modalRef} tabIndex={-1}>
                <h2 id="recorte-foto-titulo">Ajustar foto de perfil</h2>
                <p id="recorte-foto-ajuda">Arraste a imagem e ajuste o zoom. A área circular mostra como sua foto aparecerá.</p>
                <div className="recorte-foto-area" role="group" tabIndex={0}
                    aria-label="Enquadramento da foto. Use as setas para reposicionar."
                    onPointerDown={iniciarArrasto} onPointerMove={mover}
                    onPointerUp={() => { arrastoRef.current = null; }}
                    onPointerCancel={() => { arrastoRef.current = null; }}
                    onLostPointerCapture={() => { arrastoRef.current = null; }}
                    onKeyDown={(evento) => {
                        const direcoes = { ArrowLeft: [2, 0], ArrowRight: [-2, 0], ArrowUp: [0, 2], ArrowDown: [0, -2] };
                        if (!direcoes[evento.key] || preparando) return;
                        evento.preventDefault();
                        const [x, y] = direcoes[evento.key];
                        setPosicao((atual) => ({ horizontal: limitar(atual.horizontal + x), vertical: limitar(atual.vertical + y) }));
                    }}>
                    {origem && <img src={origem} ref={imagemRef} alt="Imagem escolhida para enquadramento" draggable={false}
                        onLoad={(evento) => setDimensoes({ largura: evento.currentTarget.naturalWidth, altura: evento.currentTarget.naturalHeight })}
                        onError={() => { setDimensoes(null); setErro("Não foi possível abrir a imagem. Escolha outro arquivo."); }}
                        style={recorte ? {
                            width: `${dimensoes.largura / recorte.tamanho * 100}%`,
                            height: `${dimensoes.altura / recorte.tamanho * 100}%`,
                            left: `${-recorte.x / recorte.tamanho * 100}%`,
                            top: `${-recorte.y / recorte.tamanho * 100}%`,
                        } : { visibility: "hidden" }} />}
                    <span className="recorte-foto-mascara" aria-hidden="true" />
                </div>
                {!dimensoes && !erro && <p role="status">Carregando imagem…</p>}
                <div className="recorte-foto-controles">
                    <label>Zoom <input type="range" min="1" max="3" step="0.05" value={zoom}
                        disabled={!dimensoes || preparando} onChange={(evento) => setZoom(Number(evento.target.value))} /></label>
                    <label>Posição horizontal <input type="range" min="0" max="100" value={posicao.horizontal}
                        disabled={!dimensoes || preparando} onChange={(evento) => setPosicao({ ...posicao, horizontal: Number(evento.target.value) })} /></label>
                    <label>Posição vertical <input type="range" min="0" max="100" value={posicao.vertical}
                        disabled={!dimensoes || preparando} onChange={(evento) => setPosicao({ ...posicao, vertical: Number(evento.target.value) })} /></label>
                </div>
                {erro && <p className="recorte-foto-erro" role="alert">{erro}</p>}
                <p>Depois de confirmar, clique em “Salvar alterações” no perfil.</p>
                <div className="recorte-foto-acoes">
                    <button type="button" onClick={aoCancelar} disabled={preparando}>Cancelar</button>
                    <button type="button" onClick={confirmar} disabled={!dimensoes || preparando}>{preparando ? "Preparando…" : "Usar foto"}</button>
                </div>
            </section>
        </div>, document.body
    );
}
