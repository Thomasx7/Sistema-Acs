import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "../services/api";
import { registrarAcessoQuiz } from "../services/quizzes";
import "../assets/css/components_css/historico-quiz.css";

function formatarData(iso) {
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function QuizItem({ quiz, status = "nao_iniciado", progresso = 0, atualizadoEm }) {
    const navigate = useNavigate();
    const [iniciando, setIniciando] = useState(false);
    const [erroAcesso, setErroAcesso] = useState("");
    const concluido = status === "concluido";
    const novo = status === "nao_iniciado";
    const idQuiz = quiz.id ?? quiz.idQuiz;
    const titulo = quiz.nome ?? quiz.titulo;
    const classe = quiz.cor ?? quiz.classe;

    const textoStatus = concluido ? "Concluído" : novo ? "Não iniciado" : "Em andamento";
    const classeStatus = concluido ? "status-concluido" : novo ? "status-novo" : "status-andamento";
    const textoBotao = concluido ? "Refazer" : novo ? "Iniciar" : "Continuar";

    async function iniciarQuiz() {
        setIniciando(true);
        setErroAcesso("");
        try {
            await registrarAcessoQuiz(idQuiz);
            navigate(`/quiz/${idQuiz}`);
        } catch (falha) {
            setErroAcesso(
                falha instanceof ApiError
                    ? falha.message
                    : "Não foi possível iniciar o quiz."
            );
        } finally {
            setIniciando(false);
        }
    }

    return (
        <li className={`historico-item ${classe}`}>
            <span className="historico-icone" aria-hidden="true">
                {titulo.charAt(0)}
            </span>

            <div className="historico-info">
                <h3>{titulo}</h3>
                <span>{atualizadoEm ? formatarData(atualizadoEm) : "Ainda não iniciado"}</span>
            </div>

            <div className="historico-progresso">
                <div
                    className="historico-barra"
                    role="progressbar"
                    aria-valuenow={progresso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progresso em ${titulo}`}
                >
                    <div className="historico-barra-fill" style={{ width: `${progresso}%` }} />
                </div>
                <span>{progresso}%</span>
            </div>

            <span className={`historico-status ${classeStatus}`}>{textoStatus}</span>

            <button
                type="button"
                className="historico-botao"
                onClick={iniciarQuiz}
                disabled={iniciando}
            >
                {iniciando ? "Iniciando..." : textoBotao}
            </button>
            {erroAcesso && (
                <span className="historico-erro-acesso" role="alert">
                    {erroAcesso}
                </span>
            )}
        </li>
    );
}

export default QuizItem;