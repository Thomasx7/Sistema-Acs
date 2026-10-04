import { useState } from "react";
import { Link } from "react-router-dom";

import { quizzes } from "../data/quizzes";
import { lerHistorico } from "../utils/progresso";

import "../assets/css/components_css/historico-quiz.css";

const LIMITE = 5;

function formatarData(iso) {
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function HistoricoQuiz() {

    const [lista] = useState(() =>
        lerHistorico()
            .map((item) => ({
                ...item,
                quiz: quizzes.find((q) => q.id === item.id),
            }))
            .filter((item) => item.quiz)
            .sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm))
            .slice(0, LIMITE)
    );

    return (
        <section className="historico">
            <div className="historico-top">
                <h2>Últimos quiz</h2>
                <p>Seus quizzes mais recentes aparecem aqui.</p>
            </div>

            {lista.length === 0 ? (
                <div className="historico-vazio">
                    Você ainda não iniciou nenhum quiz. Escolha um tema acima para começar.
                </div>
            ) : (
                <ul className="historico-lista">
                    {lista.map(({ id, status, progresso, atualizadoEm, quiz }) => {
                        const concluido = status === "concluido";

                        return (
                            <li key={id} className={`historico-item ${quiz.classe}`}>
                                <span className="historico-icone" aria-hidden="true">
                                    {quiz.titulo.charAt(0)}
                                </span>

                                <div className="historico-info">
                                    <h3>{quiz.titulo}</h3>
                                    <span>{formatarData(atualizadoEm)}</span>
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
                                        <div
                                            className="historico-barra-fill"
                                            style={{ width: `${progresso}%` }}
                                        />
                                    </div>
                                    <span>{progresso}%</span>
                                </div>

                                <span
                                    className={`historico-status ${
                                        concluido ? "status-concluido" : "status-andamento"
                                    }`}
                                >
                                    {concluido ? "Concluído" : "Em andamento"}
                                </span>

                                <Link to={`/quiz/${id}`} className="historico-botao">
                                    {concluido ? "Refazer" : "Continuar"}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

export default HistoricoQuiz;