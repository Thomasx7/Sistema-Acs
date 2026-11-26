import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import CardsInicio from "../../components/cards-Inicio";
import DidioTutor from "../../components/didio-tutor";
import { falasDidio } from "../../data/didio";
import { ApiError } from "../../services/api";
import { obterProgresso, salvarProgresso } from "../../services/progressoQuiz";
import { obterQuiz, responderPergunta } from "../../services/quizzes";

import "../../assets/css/pages_css/quiz.css";

const CORES_PALETA = Array.from({ length: 6 }, (_, indice) => `card-cor-${indice + 1}`);

function classeQuiz(quiz) {
    return quiz.cor || CORES_PALETA[(quiz.id - 1) % CORES_PALETA.length];
}

function mensagemFalha(falha, alternativa) {
    if (falha instanceof ApiError) return falha.message;
    return alternativa;
}

function EstadoQuiz({ classe, titulo, mensagem }) {
    return (
        <div className={`quiz ${classe || ""} anim-page-enter`}>
            <div className="quiz-resultado">
                <h1>{titulo}</h1>
                <p className="quiz-resultado-texto">{mensagem}</p>
                <div className="quiz-acoes quiz-acoes-centro">
                    <Link to="/quiz" className="quiz-botao">
                        Voltar à lista de quizzes
                    </Link>
                </div>
            </div>
        </div>
    );
}

function rotuloAlternativa(indice) {
    return indice < 26
        ? String.fromCharCode(65 + indice)
        : String(indice + 1);
}

function QuizJogo({ quiz }) {
    const perguntas = quiz.perguntas || [];
    const total = perguntas.length;
    const classe = classeQuiz(quiz);

    const [carregandoProgresso, setCarregandoProgresso] = useState(true);
    const [erroProgresso, setErroProgresso] = useState("");
    const [erroResposta, setErroResposta] = useState("");
    const [erroSalvar, setErroSalvar] = useState("");
    const [indice, setIndice] = useState(0);
    const [selecionada, setSelecionada] = useState(null);
    const [confirmada, setConfirmada] = useState(false);
    const [respondendo, setRespondendo] = useState(false);
    const [resposta, setResposta] = useState(null);
    const [acertos, setAcertos] = useState(0);
    const [totalResultado, setTotalResultado] = useState(total);
    const [finalizado, setFinalizado] = useState(false);
    const filaSalvamento = useRef(Promise.resolve());
    const respostaEmAndamento = useRef(false);
    const perguntaRespondida = useRef(false);

    useEffect(() => {
        let cancelado = false;

        obterProgresso(quiz.id)
            .then((progressoSalvo) => {
                if (cancelado) return;

                if (progressoSalvo.status === "em_andamento" && total > 0) {
                    const respondidas = progressoSalvo.perguntas_respondidas;
                    setIndice(Math.min(respondidas, total - 1));
                    setAcertos(progressoSalvo.acertos);
                } else if (progressoSalvo.status === "concluido") {
                    setAcertos(progressoSalvo.acertos);
                    setTotalResultado(progressoSalvo.total_perguntas || total);
                    setFinalizado(true);
                }
            })
            .catch((falha) => {
                if (!cancelado) {
                    setErroProgresso(
                        mensagemFalha(
                            falha,
                            "Não foi possível carregar o progresso."
                        )
                    );
                }
            })
            .finally(() => {
                if (!cancelado) setCarregandoProgresso(false);
            });

        return () => {
            cancelado = true;
        };
    }, [quiz.id, total]);

    const pergunta = perguntas[indice];
    const ultima = indice === total - 1;
    const acertou = resposta?.acertou === true;
    const estadoDidio = !confirmada ? "inicio" : acertou ? "acerto" : "erro";
    const falas = falasDidio[estadoDidio];
    const fala = falas[indice % falas.length];

    function escolher(idAlternativa) {
        if (!confirmada && !respondendo) setSelecionada(idAlternativa);
    }

    function salvarSemBloquear(dados) {
        filaSalvamento.current = filaSalvamento.current
            .then(() => salvarProgresso(quiz.id, dados))
            .then(() => setErroSalvar(""))
            .catch((falha) => {
                setErroSalvar(
                    mensagemFalha(falha, "Não foi possível salvar o progresso.")
                );
            });
    }

    async function confirmar() {
        if (
            selecionada === null ||
            respostaEmAndamento.current ||
            perguntaRespondida.current
        ) {
            return;
        }

        respostaEmAndamento.current = true;
        setRespondendo(true);
        setErroResposta("");

        try {
            const resultado = await responderPergunta(quiz.id, {
                id_pergunta: pergunta.id,
                id_alternativa: selecionada,
            });
            perguntaRespondida.current = true;
            setResposta(resultado);
            setConfirmada(true);
            setErroResposta("");
            setErroSalvar("");

            const novosAcertos = acertos + (resultado.acertou ? 1 : 0);
            const novoProgresso = Math.round(((indice + 1) / total) * 100);
            setAcertos(novosAcertos);
            salvarSemBloquear({
                status: ultima ? "concluido" : "em_andamento",
                progresso: ultima ? 100 : novoProgresso,
                acertos: novosAcertos,
                perguntas_respondidas: indice + 1,
                total_perguntas: total,
            });
        } catch (falha) {
            setErroResposta(
                mensagemFalha(falha, "Não foi possível validar sua resposta.")
            );
        } finally {
            respostaEmAndamento.current = false;
            setRespondendo(false);
        }
    }

    function continuar() {
        if (ultima) {
            setFinalizado(true);
            return;
        }
        perguntaRespondida.current = false;
        setIndice((atual) => atual + 1);
        setSelecionada(null);
        setConfirmada(false);
        setResposta(null);
        setErroResposta("");
    }

    function refazer() {
        perguntaRespondida.current = false;
        setIndice(0);
        setSelecionada(null);
        setConfirmada(false);
        setResposta(null);
        setAcertos(0);
        setTotalResultado(total);
        setFinalizado(false);
        setErroResposta("");
        setErroSalvar("");
        salvarSemBloquear({
            status: "em_andamento",
            progresso: 0,
            acertos: 0,
            perguntas_respondidas: 0,
            total_perguntas: total,
        });
    }

    if (carregandoProgresso) {
        return (
            <div className={`quiz ${classe} anim-page-enter`}>
                <p role="status">Carregando progresso...</p>
            </div>
        );
    }

    if (total === 0) {
        return (
            <EstadoQuiz
                classe={classe}
                titulo="Quiz sem perguntas"
                mensagem="Este quiz ainda não tem perguntas disponíveis. Volte à lista e escolha outro quiz."
            />
        );
    }

    if (finalizado) {
        const porcentagem = totalResultado
            ? Math.round((acertos / totalResultado) * 100)
            : 0;
        let mensagem = "Continue praticando, você vai chegar lá!";
        if (porcentagem >= 75) mensagem = "Excelente! Você domina este tema.";
        else if (porcentagem >= 50) mensagem = "Bom trabalho! Vale revisar alguns pontos.";

        return (
            <div className={`quiz ${classe} anim-page-enter`}>
                <div className="quiz-resultado">
                    <div className="quiz-anel" style={{ "--pct": porcentagem }}>
                        <span>{porcentagem}%</span>
                    </div>
                    <p className="quiz-descricao">{quiz.nome}</p>
                    <h1>Quiz finalizado!</h1>
                    <p className="quiz-resultado-texto">
                        Você acertou {acertos} de {totalResultado}{" "}
                        {totalResultado === 1 ? "pergunta" : "perguntas"}.
                        <br />
                        {mensagem}
                    </p>
                    {(erroProgresso || erroSalvar) && (
                        <p role="alert">{erroSalvar || erroProgresso}</p>
                    )}
                    <div className="quiz-acoes quiz-acoes-centro">
                        <button
                            type="button"
                            className="quiz-botao quiz-botao-sec"
                            onClick={refazer}
                        >
                            Refazer quiz
                        </button>
                        <Link to="/quiz" className="quiz-botao">
                            Voltar à lista
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const progressoBarra = ((indice + (confirmada ? 1 : 0)) / total) * 100;
    const alternativaCorretaId = resposta?.alternativa_correta?.id;
    const alternativaCorreta = pergunta.alternativas.find(
        (alternativa) => alternativa.id === alternativaCorretaId
    );

    return (
        <div className="quiz-layout anim-page-enter">
            <div className={`quiz ${classe}`}>
                {(erroProgresso || erroSalvar || erroResposta) && (
                    <p role="alert">{erroResposta || erroSalvar || erroProgresso}</p>
                )}
                <div className="quiz-topo">
                    <Link
                        to="/quiz"
                        className="quiz-voltar"
                        aria-label="Voltar para a lista de quizzes"
                    >
                        ←
                    </Link>
                    <div className="quiz-progresso">
                        <span>
                            Questão {indice + 1} de {total}
                        </span>
                        <div className="quiz-barra">
                            <div
                                className="quiz-barra-fill"
                                style={{ width: `${progressoBarra}%` }}
                            />
                        </div>
                    </div>
                    <span className="quiz-tema">{quiz.nome}</span>
                </div>

                <div className="quiz-enunciado">
                    <p className="quiz-descricao">Pergunta {indice + 1}</p>
                    <h1 className="quiz-pergunta">{pergunta.enunciado}</h1>
                </div>

                <div
                    className="quiz-opcoes anim-stagger"
                    role="group"
                    aria-label="Alternativas"
                >
                    {pergunta.alternativas.map((alternativa, indiceAlternativa) => {
                        const escolhida = selecionada === alternativa.id;
                        const ehCorreta = alternativa.id === alternativaCorretaId;
                        let estado = "";

                        if (!confirmada) {
                            if (escolhida) estado = "selecionada";
                        } else if (ehCorreta) {
                            estado = "correta";
                        } else if (escolhida) {
                            estado = "errada";
                        } else {
                            estado = "apagada";
                        }

                        let marcador = rotuloAlternativa(indiceAlternativa);
                        if (estado === "correta") marcador = "✓";
                        if (estado === "errada") marcador = "✕";

                        return (
                            <button
                                key={alternativa.id}
                                type="button"
                                className={`quiz-opcao ${estado}`}
                                onClick={() => escolher(alternativa.id)}
                                disabled={confirmada || respondendo}
                                aria-pressed={escolhida}
                            >
                                <span className="quiz-letra">{marcador}</span>
                                <span>{alternativa.texto}</span>
                            </button>
                        );
                    })}
                </div>

                {confirmada && resposta && (
                    <div
                        className={`quiz-feedback ${
                            acertou ? "feedback-certo" : "feedback-erro"
                        }`}
                        role="status"
                    >
                        <strong>
                            {acertou ? "Resposta correta!" : "Resposta incorreta."}
                        </strong>
                        {alternativaCorreta && (
                            <p>
                                Alternativa correta: {alternativaCorreta.texto}
                            </p>
                        )}
                        {resposta.explicacao && <p>{resposta.explicacao}</p>}
                    </div>
                )}

                <div className="quiz-acoes">
                    {!confirmada ? (
                        <button
                            type="button"
                            className="quiz-botao"
                            onClick={confirmar}
                            disabled={selecionada === null || respondendo}
                        >
                            {respondendo ? "Verificando..." : "Confirmar resposta"}
                        </button>
                    ) : (
                        <button type="button" className="quiz-botao" onClick={continuar}>
                            {ultima ? "Finalizar" : "Continuar"}
                        </button>
                    )}
                </div>
            </div>

            <aside className="quiz-lateral">
                <DidioTutor
                    estado={estadoDidio}
                    titulo={fala.titulo}
                    texto={
                        confirmada && !acertou && alternativaCorreta
                            ? `${fala.texto} A alternativa correta é: ${alternativaCorreta.texto}`
                            : fala.texto
                    }
                    explicacao={confirmada ? resposta?.explicacao : null}
                />
            </aside>
        </div>
    );
}

function Quiz() {
    const { id } = useParams();
    const [resultadoQuiz, setResultadoQuiz] = useState({
        id: null,
        quiz: null,
        erro: null,
        carregando: false,
    });

    useEffect(() => {
        if (!id) return undefined;

        let cancelado = false;

        obterQuiz(id)
            .then((dados) => {
                if (!cancelado) {
                    setResultadoQuiz({
                        id,
                        quiz: dados,
                        erro: null,
                        carregando: false,
                    });
                }
            })
            .catch((falha) => {
                if (!cancelado) {
                    setResultadoQuiz({
                        id,
                        quiz: null,
                        erro: {
                            titulo: falha instanceof ApiError && falha.status === 404
                                ? "Quiz não encontrado"
                                : "Não foi possível carregar o quiz",
                            mensagem: mensagemFalha(
                                falha,
                                "Verifique sua conexão e tente novamente."
                            ),
                        },
                        carregando: false,
                    });
                }
            });

        return () => {
            cancelado = true;
        };
    }, [id]);

    if (!id) return <CardsInicio />;
    const carregando =
        resultadoQuiz.id !== id || resultadoQuiz.carregando;
    const quiz = resultadoQuiz.id === id ? resultadoQuiz.quiz : null;
    const erro = resultadoQuiz.id === id ? resultadoQuiz.erro : null;

    if (carregando) {
        return (
            <div className="quiz anim-page-enter">
                <p role="status">Carregando quiz...</p>
            </div>
        );
    }
    if (erro) {
        return (
            <EstadoQuiz
                titulo={erro.titulo}
                mensagem={erro.mensagem}
            />
        );
    }
    if (!quiz) {
        return (
            <EstadoQuiz
                titulo="Quiz não encontrado"
                mensagem="Não encontramos esse quiz. Volte à lista e escolha outro."
            />
        );
    }

    return <QuizJogo key={quiz.id} quiz={quiz} />;
}

export default Quiz;
