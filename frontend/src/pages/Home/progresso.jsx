import { useState } from "react";

import QuizItem from "../../components/quiz-item";
import { quizzes } from "../../data/quizzes";
import { lerHistorico } from "../../utils/progresso";

import "../../assets/css/components_css/progresso.css";

function Progresso() {
    // Lê o andamento salvo uma vez, quando a página abre
    const [historico] = useState(() => lerHistorico());

    const lista = quizzes.map((quiz) => {
        const item = historico.find((h) => h.id === quiz.id);

        return {
            quiz,
            status: item ? item.status : "novo",
            progresso: item ? item.progresso : 0,
            atualizadoEm: item ? item.atualizadoEm : undefined,
        };
    });

    const total = lista.length;
    const concluidos = lista.filter((i) => i.status === "concluido").length;
    const emAndamento = lista.filter((i) => i.status === "andamento").length;
    const naoIniciados = lista.filter((i) => i.status === "novo").length;
    const progressoGeral = Math.round(
        lista.reduce((soma, i) => soma + i.progresso, 0) / total
    );

    return (
        <div className="progresso anim-page-enter">
            <div className="progresso-top">
                <h1>Meu progresso</h1>
                <p>Acompanhe o andamento de cada quiz em um só lugar.</p>
            </div>

            {/* Resumo */}
            <div className="progresso-resumo anim-stagger">
                <div className="resumo-card resumo-geral">
                    <span>Progresso geral</span>
                    <strong>{progressoGeral}%</strong>
                    <small>média de todos os quizzes</small>
                </div>

                <div className="resumo-card resumo-ok">
                    <span>Concluídos</span>
                    <strong>{concluidos}</strong>
                    <small>de {total} quizzes</small>
                </div>

                <div className="resumo-card resumo-andamento">
                    <span>Em andamento</span>
                    <strong>{emAndamento}</strong>
                    <small>de {total} quizzes</small>
                </div>

                <div className="resumo-card resumo-novo">
                    <span>Não iniciados</span>
                    <strong>{naoIniciados}</strong>
                    <small>de {total} quizzes</small>
                </div>
            </div>

            <section className="historico">
                <div className="historico-top">
                    <h2>Progresso por quiz</h2>
                    <p>Veja onde você parou e continue de onde quiser.</p>
                </div>

                <ul className="historico-lista anim-stagger">
                    {lista.map(({ quiz, status, progresso, atualizadoEm }) => (
                        <QuizItem
                            key={quiz.id}
                            quiz={quiz}
                            status={status}
                            progresso={progresso}
                            atualizadoEm={atualizadoEm}
                        />
                    ))}
                </ul>
            </section>
        </div>
    );
}

export default Progresso;