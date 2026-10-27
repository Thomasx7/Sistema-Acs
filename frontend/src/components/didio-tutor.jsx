import roboAcenando from "../assets/images/didio-acenando.webp";
import roboPrancheta from "../assets/images/didio-prancheta.webp";
import roboPensando from "../assets/images/didio-pensando.webp";

import "../assets/css/pages_css/didio.css";

// Qual pose do Didio aparece em cada situação do quiz
const IMAGENS = {
    inicio: roboAcenando,  // antes de confirmar: acenando
    acerto: roboPrancheta, // acertou: prancheta com itens marcados
    erro: roboPensando,    // errou: pensativo
};

// O Didio, ajudante do quiz.
// Props:
//   estado     -> "inicio", "acerto" ou "erro" (escolhe a pose e a cor)
//   titulo     -> frase curta em destaque
//   texto      -> fala do Didio
//   explicacao -> (opcional) explicação da pergunta, mostrada depois de confirmar
function DidioTutor({ estado, titulo, texto, explicacao }) {
    return (
        <aside className={`didio didio-${estado}`} aria-label="Didio, ajudante do quiz">
            <div className="didio-cabecalho">
                <span className="didio-nome">Didio</span>
                <span className="didio-papel">Ajudante do quiz</span>
            </div>

            {/* key={estado}: a imagem é recriada a cada troca de pose e toca a animação de novo */}
            <img
                key={estado}
                className="didio-imagem"
                src={IMAGENS[estado]}
                alt=""
                width="320"
                height="480"
            />

            {/* role="status": leitores de tela anunciam quando a fala muda */}
            <div className="didio-fala" role="status">
                <strong>{titulo}</strong>
                <p>{texto}</p>
                {explicacao && (
                    <p className="didio-explicacao">
                        <span className="didio-rotulo">Por quê?</span> {explicacao}
                    </p>
                )}
            </div>

            <p className="didio-aviso">Privacidade também é cuidado.</p>
        </aside>
    );
}

export default DidioTutor;