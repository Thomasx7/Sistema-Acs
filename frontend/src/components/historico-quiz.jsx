import QuizItem from "./quiz-item";
import { quizzes } from "../data/quizzes";
import { useAuth } from "../context/useAuth";
import { ehAdm } from "../utils/permissoes";

import "../assets/css/components_css/historico-quiz.css";

// Quantos quizzes aparecem na lista
const LIMITE = 5;

function HistoricoQuiz({ progressos = [], carregando, erro }) {
    const { usuario } = useAuth();
    const administrador = ehAdm(usuario);
    const lista = progressos
        .map((item) => ({
            ...item,
            quiz: quizzes.find((quiz) => quiz.idQuiz === item.id_quiz),
            atualizadoEm: item.atualizado,
        }))
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

            {carregando ? (
                <p role="status">Carregando progresso...</p>
            ) : erro ? (
                <p className="historico-vazio" role="alert">{erro}</p>
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