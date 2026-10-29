import { useMemo } from "react";

import QuizItem from "./quiz-item";
import { quizzes } from "../data/quizzes";
import { useAuth } from "../context/useAuth";
import { ehAdm } from "../utils/permissoes";
import { useProgresso } from "../hooks/useProgresso";

import "../assets/css/components_css/historico-quiz.css";

const LIMITE = 5;

function HistoricoQuiz() {
    const { usuario } = useAuth();
    const administrador = ehAdm(usuario);
    const { historico, carregando, erro, recarregar } = useProgresso();

    const lista = useMemo(
        () =>
            historico
                .map((item) => ({
                    ...item,
                    quiz: quizzes.find((q) => q.id === item.id),
                }))
                .filter((item) => item.quiz)
                .sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm))
                .slice(0, LIMITE),
        [historico]
    );

    return (
        <section className="historico">
            <div className="historico-top">
                <h2>Últimos quizzes</h2>
                <p>Seus quizzes mais recentes aparecem aqui.</p>
            </div>

            {carregando ? (
                <div role="status">Carregando seus quizzes...</div>
            ) : erro ? (
                <div role="alert">
                    Não foi possível carregar seu histórico de quizzes.
                    <button type="button" onClick={recarregar}>Tentar novamente</button>
                </div>
            ) : lista.length === 0 ? (
                <div className="historico-vazio">
                    {administrador
                        ? "Você ainda não iniciou nenhum quiz. Acesse o menu Quiz para começar."
                        : "Você ainda não iniciou nenhum quiz. Escolha um tema acima para começar."}
                </div>
            ) : (
                <ul className="historico-lista anim-stagger">
                    {lista.map(({ id, status, progresso, atualizadoEm, quiz }) => (
                        <QuizItem
                            key={id}
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