import { useState } from "react";

import QuizItem from "./quiz-item";
import { quizzes } from "../data/quizzes";
import { lerHistorico } from "../utils/progresso";

import "../assets/css/components_css/historico-quiz.css";

// Quantos quizzes aparecem na lista
const LIMITE = 5;

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