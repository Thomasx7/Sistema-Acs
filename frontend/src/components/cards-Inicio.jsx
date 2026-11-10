import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { quizzes } from "../data/quizzes";
import { ApiError } from "../services/api";
import { listarProgressos } from "../services/progressoQuiz";

import "../assets/css/components_css/cards-inicio.css";

function CardsInicio({ progressos: progressosRecebidos, carregando, erro }) {
    const [progressosProprios, setProgressosProprios] = useState([]);
    const [carregandoProprio, setCarregandoProprio] = useState(
        progressosRecebidos === undefined
    );
    const [erroProprio, setErroProprio] = useState("");

    useEffect(() => {
        if (progressosRecebidos !== undefined) return;

        let cancelado = false;
        listarProgressos()
            .then((dados) => {
                if (!cancelado) setProgressosProprios(dados);
            })
            .catch((falha) => {
                if (!cancelado) {
                    setErroProprio(
                        falha instanceof ApiError
                            ? falha.message
                            : "Não foi possível carregar o progresso."
                    );
                }
            })
            .finally(() => {
                if (!cancelado) setCarregandoProprio(false);
            });

        return () => {
            cancelado = true;
        };
    }, [progressosRecebidos]);

    const dadosProgresso = progressosRecebidos ?? progressosProprios;
    const estaCarregando =
        progressosRecebidos === undefined ? carregandoProprio : carregando;
    const mensagemErro =
        progressosRecebidos === undefined ? erroProprio : erro;

    return (
        <div className="cards anim-page-enter">
            <div className="card-top">
                <h1>Escolha seu quiz</h1>
                <p>Selecione um dos temas abaixo para iniciar o quiz.</p>
            </div>

            <div className="card-container anim-stagger-fade">
                {quizzes.map((quiz) => {
                    const progressoQuiz = dadosProgresso.find(
                        (item) => item.id_quiz === quiz.idQuiz
                    );
                    const status = progressoQuiz?.status ?? "nao_iniciado";
                    const textoStatus =
                        status === "concluido"
                            ? "Concluído"
                            : status === "em_andamento"
                                ? "Em andamento"
                                : "Não iniciado";
                    const textoBotao =
                        status === "concluido"
                            ? "Refazer Quiz"
                            : status === "em_andamento"
                                ? "Continuar Quiz"
                                : "Iniciar Quiz";

                    return (
                        <article key={quiz.id} className={`card-quiz ${quiz.classe}`}>
                            <h2>{quiz.titulo}</h2>
                            <p>{quiz.descricao}</p>

                            {estaCarregando ? (
                                <span className="card-quiz-status">Carregando progresso...</span>
                            ) : mensagemErro ? (
                                <span className="card-quiz-status">Progresso indisponível</span>
                            ) : (
                                <div className="card-quiz-progresso">
                                    <span>{textoStatus}</span>
                                    <div
                                        className="card-quiz-barra"
                                        role="progressbar"
                                        aria-valuenow={progressoQuiz?.progresso ?? 0}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`Progresso em ${quiz.titulo}`}
                                    >
                                        <span
                                            style={{
                                                width: `${progressoQuiz?.progresso ?? 0}%`,
                                            }}
                                        />
                                    </div>
                                    <span>{progressoQuiz?.progresso ?? 0}%</span>
                                </div>
                            )}

                            <Link to={`/quiz/${quiz.id}`} className="card-quiz-botao">
                                {textoBotao}
                            </Link>
                        </article>
                    );
                })}
            </div>
            {mensagemErro && (
                <p className="card-quiz-erro" role="alert">
                    {mensagemErro}
                </p>
            )}
        </div>
    );
}

export default CardsInicio;