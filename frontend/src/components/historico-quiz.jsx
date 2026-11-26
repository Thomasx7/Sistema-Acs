import { useEffect, useState } from "react";

import QuizItem from "./quiz-item";
import { useAuth } from "../context/useAuth";
import { ApiError } from "../services/api";
import { listarQuizzes } from "../services/quizzes";
import { ehAdm } from "../utils/permissoes";

import "../assets/css/components_css/historico-quiz.css";

// Quantos quizzes aparecem na lista
const LIMITE = 5;

function HistoricoQuiz({ progressos = [], carregando, erro }) {
    const { usuario } = useAuth();
    const administrador = ehAdm(usuario);
    const [quizzes, setQuizzes] = useState([]);
    const [carregandoQuizzes, setCarregandoQuizzes] = useState(true);
    const [erroQuizzes, setErroQuizzes] = useState("");

    useEffect(() => {
        let cancelado = false;

        listarQuizzes()
            .then((dados) => {
                if (!cancelado) setQuizzes(dados);
            })
            .catch((falha) => {
                if (!cancelado) {
                    setErroQuizzes(
                        falha instanceof ApiError
                            ? falha.message
                            : "Não foi possível carregar os quizzes."
                    );
                }
            })
            .finally(() => {
                if (!cancelado) setCarregandoQuizzes(false);
            });

        return () => {
            cancelado = true;
        };
    }, []);

    const lista = progressos
        .map((item) => {
            const quiz = quizzes.find(
                (itemQuiz) => Number(itemQuiz.id) === Number(item.id_quiz)
            );
            return {
                ...item,
                quiz,
                atualizadoEm: item.atualizado,
            };
        })
        .filter((item) => item.quiz)
        .sort(
            (a, b) =>
                new Date(b.atualizadoEm || 0) - new Date(a.atualizadoEm || 0)
        )
        .slice(0, LIMITE);

    return (
        <section className="historico">
            <div className="historico-top">
                <h2>Últimos quizzes</h2>
                <p>Seus quizzes mais recentes aparecem aqui.</p>
            </div>

            {carregando || carregandoQuizzes ? (
                <p role="status">Carregando progresso...</p>
            ) : erro || erroQuizzes ? (
                <p className="historico-vazio" role="alert">
                    {erro || erroQuizzes}
                </p>
            ) : lista.length === 0 ? (
                <div className="historico-vazio">
                    {administrador
                        ? "Você ainda não iniciou nenhum quiz. Acesse o menu Quiz para começar."
                        : "Você ainda não iniciou nenhum quiz. Escolha um tema acima para começar."}
                </div>
            ) : (
                <ul className="historico-lista anim-stagger">
                    {lista.map(({ id_quiz, status, progresso, atualizadoEm, quiz }) => (
                        <QuizItem
                            key={id_quiz}
                            quiz={quiz}
                            status={status}
                            progresso={progresso}
                            atualizadoEm={atualizadoEm}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

export default HistoricoQuiz;