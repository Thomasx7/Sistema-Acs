import { Link } from "react-router-dom";
import { contarMateriais } from "../data/pastasBiblioteca";
import "../assets/css/components_css/card-pasta.css";

export default function CardPasta({ nome, quantidade, icone, cor, texto, intensidade, tipo, destino, descricao }) {
    return (
        <Link className="card-pasta" to={destino} style={{ "--pasta-cor": cor, "--pasta-texto": texto, "--pasta-intensidade": intensidade }}
            aria-label={`${nome}, ${contarMateriais(quantidade)}. ${tipo}. ${descricao || "Explore os conteúdos desta categoria."} Ver materiais.`}>
            <span className="card-pasta-fundo" aria-hidden="true" />
            <span className="card-pasta-folha card-pasta-folha-extra" aria-hidden="true" />
            <span className="card-pasta-folha card-pasta-previa" aria-hidden="true">
                <span className="card-pasta-previa-topo">
                    <span className="card-pasta-icone"><svg viewBox="0 0 24 24"><path d={icone} /></svg></span>
                    <span className="card-pasta-tipo">{tipo}</span>
                </span>
                <strong className="card-pasta-previa-titulo">Sobre esta pasta</strong>
                <span className="card-pasta-previa-descricao">{descricao || `Explore os conteúdos de ${nome}.`}</span>
                <span className="card-pasta-previa-info">{quantidade === 0 ? "Novos materiais em breve" : `${contarMateriais(quantidade)} nesta categoria`}</span>
            </span>
            <span className="card-pasta-capa" aria-hidden="true">
                <span className="card-pasta-cabecalho">
                    <span><span className="card-pasta-nome">{nome}</span><span className="card-pasta-quantidade">{contarMateriais(quantidade)}</span></span>
                    <svg className="card-pasta-simbolo" viewBox="0 0 24 24"><path d={icone} /></svg>
                </span>
                <span className="card-pasta-convite">Explorar materiais <span>↗</span></span>
            </span>
        </Link>
    );
}
