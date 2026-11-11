import { useEffect, useState } from "react";

import QuizItem from "../../components/quiz-item";
import { ApiError } from "../../services/api";
import { listarProgressos } from "../../services/progressoQuiz";
import { listarQuizzes } from "../../services/quizzes";

import "../../assets/css/components_css/progresso.css";

function Progresso() {
    const [progressos, setProgressos] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let cancelado = false;

        Promise.all([listarProgressos(), listarQuizzes()])
            .then(([dadosProgresso, dadosQuizzes]) => {
                if (!cancelado) {
                    setProgressos(dadosProgresso);
                    setQuizzes(dadosQuizzes);
                }
            })
            .catch((falha) => {
                if (!cancelado) {
                    setErro(
                        falha instanceof ApiError
                            ? falha.message
                            : "Não foi possível carregar o progresso."
                    );
                }
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });

        return () => {
            cancelado = true;
        };
    }, []);

    const lista = quizzes.map((quiz) => {
        const item = progressos.find(
            (registro) => Number(registro.id_quiz) === Number(quiz.id)
        );

        return {
            quiz,
            status: item ? item.status : "nao_iniciado",
            progresso: item ? item.progresso : 0,
            atualizadoEm: item ? item.atualizado : undefined,
        };
    });

    const total = lista.length;
    const concluidos = lista.filter((i) => i.status === "concluido").length;
    const emAndamento = lista.filter((i) => i.status === "em_andamento").length;
    const naoIniciados = lista.filter((i) => i.status === "nao_iniciado").length;
    const progressoGeral = total
        ? Math.round(lista.reduce((soma, item) => soma + item.progresso, 0) / total)
        : 0;

    return (
        <div className="progresso anim-page-enter">
            <div className="progresso-top">
                <h1>Meu progresso</h1>
                <p>Acompanhe o andamento de cada quiz em um só lugar.</p>
            </div>

            {carregando ? (
                <p role="status">Carregando progresso...</p>
            ) : erro ? (
                <p role="alert">{erro}</p>
            ) : (
                <>
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
                </>
            )}
        </div>
    );
}

export default Progresso;