import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import QuizAdminModal from "./QuizAdminModal";
import { useAuth } from "../context/useAuth";
import { ApiError } from "../services/api";
import { listarProgressos } from "../services/progressoQuiz";
import {
    excluirQuiz,
    listarQuizzes,
    registrarAcessoQuiz,
} from "../services/quizzes";
import { ehAdm } from "../utils/permissoes";

import "../assets/css/components_css/cards-inicio.css";

const CORES_PALETA = Array.from({ length: 6 }, (_, indice) => `card-cor-${indice + 1}`);

function CardsInicio({ progressos: progressosRecebidos, carregando, erro }) {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const administrador = ehAdm(usuario);
    const [quizzes, setQuizzes] = useState([]);
    const [quizEditando, setQuizEditando] = useState(null);
    const [criandoQuiz, setCriandoQuiz] = useState(false);
    const [carregandoQuizzes, setCarregandoQuizzes] = useState(true);
    const [erroQuizzes, setErroQuizzes] = useState("");
    const [mensagemAdmin, setMensagemAdmin] = useState("");
    const [idExcluindo, setIdExcluindo] = useState(null);
    const [erroAdmin, setErroAdmin] = useState("");
    const [progressosProprios, setProgressosProprios] = useState([]);
    const [carregandoProprio, setCarregandoProprio] = useState(
        progressosRecebidos === undefined
    );
    const [erroProprio, setErroProprio] = useState("");
    const [idIniciando, setIdIniciando] = useState(null);
    const [erroAcesso, setErroAcesso] = useState("");

    useEffect(() => {
        let cancelado = false;

        listarQuizzes()
            .then((dados) => {
                if (!cancelado) {
                    setQuizzes(dados);
                    setErroQuizzes("");
                }
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

    async function atualizarLista() {
        setCarregandoQuizzes(true);
        try {
            setQuizzes(await listarQuizzes());
            setErroQuizzes("");
        } catch (falha) {
            setErroQuizzes(
                falha instanceof ApiError
                    ? falha.message
                    : "Não foi possível carregar os quizzes."
            );
        } finally {
            setCarregandoQuizzes(false);
        }
    }

    async function removerQuiz(quiz) {
        const confirmado = window.confirm(
            `Excluir "${quiz.nome}"? As perguntas e o progresso relacionado também serão removidos.`
        );
        if (!confirmado) return;

        setIdExcluindo(quiz.id);
        setErroAdmin("");
        setMensagemAdmin("");
        try {
            await excluirQuiz(quiz.id);
            setQuizzes((atuais) => atuais.filter((item) => item.id !== quiz.id));
            setMensagemAdmin(`Quiz "${quiz.nome}" excluído.`);
        } catch (falha) {
            setErroAdmin(
                falha instanceof ApiError
                    ? falha.message
                    : "Não foi possível excluir o quiz."
            );
        } finally {
            setIdExcluindo(null);
        }
    }

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
    const quizzesCarregando = carregandoQuizzes || Boolean(estaCarregando);

    async function iniciarQuiz(idQuiz) {
        setIdIniciando(idQuiz);
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
            setIdIniciando(null);
        }
    }

    return (
        <div className="cards anim-page-enter">
            <div className="card-top">
                <div>
                    <h1>Escolha seu quiz</h1>
                    <p>Selecione um dos temas abaixo para iniciar o quiz.</p>
                </div>
                {administrador && (
                    <button
                        type="button"
                        className="card-quiz-admin-criar"
                        onClick={() => {
                            setErroAdmin("");
                            setMensagemAdmin("");
                            setCriandoQuiz(true);
                        }}
                    >
                        Criar quiz
                    </button>
                )}
            </div>

            <div className="card-container anim-stagger-fade">
                {quizzes.map((quiz, indice) => {
                    const progressoQuiz = dadosProgresso.find(
                        (item) => Number(item.id_quiz) === Number(quiz.id)
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
                    const classe = quiz.cor || CORES_PALETA[indice % CORES_PALETA.length];
                    const titulo = quiz.nome;
                    const progresso = progressoQuiz?.progresso ?? 0;

                    return (
                        <article key={quiz.id} className={`card-quiz ${classe}`}>
                            <h2>{titulo}</h2>
                            <p>{quiz.descricao}</p>

                            {quizzesCarregando ? (
                                <span className="card-quiz-status">Carregando progresso...</span>
                            ) : mensagemErro ? (
                                <span className="card-quiz-status">Progresso indisponível</span>
                            ) : (
                                <div className="card-quiz-progresso">
                                    <span>{textoStatus}</span>
                                    <div
                                        className="card-quiz-barra"
                                        role="progressbar"
                                        aria-valuenow={progresso}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`Progresso em ${titulo}`}
                                    >
                                        <span
                                            style={{
                                                width: `${progresso}%`,
                                            }}
                                        />
                                    </div>
                                    <span>{progresso}%</span>
                                </div>
                            )}

                            <div className="card-quiz-acoes">
                                {administrador && (
                                    <>
                                        <button
                                            type="button"
                                            className="card-quiz-admin-botao"
                                            onClick={() => {
                                                setErroAdmin("");
                                                setMensagemAdmin("");
                                                setQuizEditando(quiz.id);
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="card-quiz-admin-botao card-quiz-admin-excluir"
                                            onClick={() => removerQuiz(quiz)}
                                            disabled={idExcluindo !== null}
                                        >
                                            {idExcluindo === quiz.id
                                                ? "Excluindo..."
                                                : "Excluir"}
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    className="card-quiz-botao"
                                    onClick={() => iniciarQuiz(quiz.id)}
                                    disabled={idIniciando !== null || idExcluindo !== null}
                                >
                                    {idIniciando === quiz.id ? "Iniciando..." : textoBotao}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
            {carregandoQuizzes && <p role="status">Carregando quizzes...</p>}
            {!carregandoQuizzes && !erroQuizzes && quizzes.length === 0 && (
                <p className="card-quiz-status">Nenhum quiz disponível no momento.</p>
            )}
            {erroQuizzes && (
                <p className="card-quiz-erro" role="alert">
                    {erroQuizzes}
                </p>
            )}
            {erroAcesso && (
                <p className="card-quiz-erro" role="alert">
                    {erroAcesso}
                </p>
            )}
            {mensagemErro && !carregandoQuizzes && (
                <p className="card-quiz-erro" role="alert">
                    {mensagemErro}
                </p>
            )}
            {erroAdmin && <p className="card-quiz-erro" role="alert">{erroAdmin}</p>}
            {mensagemAdmin && <p className="card-quiz-admin-sucesso" role="status">{mensagemAdmin}</p>}
            {administrador && (criandoQuiz || quizEditando !== null) && (
                <QuizAdminModal
                    quizId={quizEditando}
                    onClose={() => {
                        setCriandoQuiz(false);
                        setQuizEditando(null);
                    }}
                    onSaved={async (quiz) => {
                        await atualizarLista();
                        setMensagemAdmin(
                            quiz?.nome ? `Quiz "${quiz.nome}" salvo.` : "Quiz atualizado."
                        );
                    }}
                />
            )}
        </div>
    );
}

export default CardsInicio;