import { Link } from "react-router-dom";

import "../assets/css/components_css/historico-quiz.css";

function formatarData(iso) {
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function QuizItem({ quiz, status = "novo", progresso = 0, atualizadoEm }) {
    const concluido = status === "concluido";
    const novo = status === "novo";

    const textoStatus = concluido ? "Concluído" : novo ? "Não iniciado" : "Em andamento";
    const classeStatus = concluido ? "status-concluido" : novo ? "status-novo" : "status-andamento";
    const textoBotao = concluido ? "Refazer" : novo ? "Iniciar" : "Continuar";

    return (
        <li className={`historico-item ${quiz.classe}`}>
            <span className="historico-icone" aria-hidden="true">
                {quiz.titulo.charAt(0)}
            </span>

            <div className="historico-info">
                <h3>{quiz.titulo}</h3>
                <span>{atualizadoEm ? formatarData(atualizadoEm) : "Ainda não iniciado"}</span>
            </div>

            <div className="historico-progresso">
                <div
                    className="historico-barra"
                    role="progressbar"
                    aria-valuenow={progresso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progresso em ${quiz.titulo}`}
                >
                    <div className="historico-barra-fill" style={{ width: `${progresso}%` }} />
                </div>
                <span>{progresso}%</span>
            </div>

            <span className={`historico-status ${classeStatus}`}>{textoStatus}</span>

            <Link to={`/quiz/${quiz.id}`} className="historico-botao">
                {textoBotao}
            </Link>
        </li>
    );
}

export default QuizItem;