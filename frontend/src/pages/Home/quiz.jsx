import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import CardsInicio from "../../components/cards-Inicio";
import { quizzes } from "../../data/quizzes";
import { perguntasPorQuiz } from "../../data/perguntas";
import { salvarProgresso } from "../../services/progresso";

import DidioTutor from "../../components/didio-tutor";
import { falasDidio } from "../../data/didio";

import "../../assets/css/pages_css/quiz.css";

const LETRAS = ["A", "B", "C", "D"];


function QuizJogo({ quiz, perguntas }) {
    const total = perguntas.length;

    const [indice, setIndice] = useState(0);            // pergunta atual
    const [selecionada, setSelecionada] = useState(null); // alternativa marcada (azul)
    const [confirmada, setConfirmada] = useState(false);  
    const [acertos, setAcertos] = useState(0);
    const [finalizado, setFinalizado] = useState(false);

    const pergunta = perguntas[indice];
    const ultima = indice === total - 1;
    const acertou = selecionada === pergunta.correta;

    // O que o Didio mostra agora: "inicio" (antes de confirmar), "acerto" ou "erro"
    const estadoDidio = !confirmada ? "inicio" : acertou ? "acerto" : "erro";
    const falas = falasDidio[estadoDidio];
    const fala = falas[indice % falas.length]; // uma fala diferente a cada pergunta

    // Só dá para trocar de alternativa antes de confirmar
    function escolher(i) {
        if (!confirmada) setSelecionada(i);
    }

    // Mostra verde/vermelho e registra o andamento para o histórico da Home
    function confirmar() {
        const proximoAcertos = acertou ? acertos + 1 : acertos;
        setConfirmada(true);
        if (acertou) setAcertos(proximoAcertos);

        const payload = ultima
            ? { status: "concluido", progresso: 100, acertos: proximoAcertos, totalPerguntas: total }
            : {
                status: "andamento",
                progresso: Math.round(((indice + 1) / total) * 100),
                acertos: proximoAcertos,
                totalPerguntas: total,
            };

        salvarProgresso(quiz.id, payload);
    }

    function continuar() {
        if (ultima) {
            setFinalizado(true);
            return;
        }
        setIndice(indice + 1);
        setSelecionada(null);
        setConfirmada(false);
    }

    function refazer() {
        setIndice(0);
        setSelecionada(null);
        setConfirmada(false);
        setAcertos(0);
        setFinalizado(false);
    }

    /* Tela final */
    if (finalizado) {
        const porcentagem = Math.round((acertos / total) * 100);

        let mensagem = "Continue praticando, você vai chegar lá!";
        if (porcentagem >= 75) mensagem = "Excelente! Você domina este tema.";
        else if (porcentagem >= 50) mensagem = "Bom trabalho! Vale revisar alguns pontos.";

        return (
            <div className={`quiz ${quiz.classe} anim-page-enter`}>
                <div className="quiz-resultado">
                    <div className="quiz-anel" style={{ "--pct": porcentagem }}>
                        <span>{porcentagem}%</span>
                    </div>

                    <p className="quiz-descricao">{quiz.titulo}</p>
                    <h1>Quiz finalizado!</h1>
                    <p className="quiz-resultado-texto">
                        Você acertou {acertos} de {total} {total === 1 ? "pergunta" : "perguntas"}.
                        <br />
                        {mensagem}
                    </p>

                    <div className="quiz-acoes quiz-acoes-centro">
                        <button type="button" className="quiz-botao quiz-botao-sec" onClick={refazer}>
                            Refazer quiz
                        </button>
                        <Link to="/home" className="quiz-botao">
                            Voltar ao início
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    /* Pergunta */
    const progressoBarra = ((indice + (confirmada ? 1 : 0)) / total) * 100;

        return (
        <div className="quiz-layout anim-page-enter">
            <div className={`quiz ${quiz.classe}`}>
                {/* Topo: voltar, progresso e tema */}
                <div className="quiz-topo">
                    <Link to="/quiz" className="quiz-voltar" aria-label="Voltar para o início">
                        ←
                    </Link>

                    <div className="quiz-progresso">
                        <span>
                            Questão {indice + 1} de {total}
                        </span>
                        <div className="quiz-barra">
                            <div className="quiz-barra-fill" style={{ width: `${progressoBarra}%` }} />
                        </div>
                    </div>

                    <span className="quiz-tema">{quiz.titulo}</span>
                </div>

                {/* Enunciado */}
                <div className="quiz-enunciado">
                    <p className="quiz-descricao">{pergunta.descricao}</p>
                    <h1 className="quiz-pergunta">{pergunta.titulo}</h1>
                </div>

                {/* Alternativas */}
                <div className="quiz-opcoes anim-stagger" role="group" aria-label="Alternativas">
                    {pergunta.alternativas.map((texto, i) => {
                        const escolhida = selecionada === i;
                        const ehCorreta = i === pergunta.correta;

                        // Define o visual de cada alternativa
                        let estado = "";
                        if (!confirmada) {
                            if (escolhida) estado = "selecionada";   // azul
                        } else if (ehCorreta) {
                            estado = "correta";                      // verde
                        } else if (escolhida) {
                            estado = "errada";                       // vermelho
                        } else {
                            estado = "apagada";
                        }

                        let marcador = LETRAS[i];
                        if (estado === "correta") marcador = "✓";
                        if (estado === "errada") marcador = "✕";

                        return (
                            <button
                                key={i}
                                type="button"
                                className={`quiz-opcao ${estado}`}
                                onClick={() => escolher(i)}
                                disabled={confirmada}
                                aria-pressed={escolhida}
                            >
                                <span className="quiz-letra">{marcador}</span>
                                <span>{texto}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Botão: primeiro confirma, depois continua */}
                <div className="quiz-acoes">
                    {!confirmada ? (
                        <button
                            type="button"
                            className="quiz-botao"
                            onClick={confirmar}
                            disabled={selecionada === null}
                        >
                            Confirmar resposta
                        </button>
                    ) : (
                        <button type="button" className="quiz-botao" onClick={continuar}>
                            {ultima ? "Finalizar" : "Continuar"}
                        </button>
                    )}
                </div>
            </div>

            {/* Didio: agora fica ao lado do card */}
            <aside className="quiz-lateral">
                <DidioTutor
                    estado={estadoDidio}
                    titulo={fala.titulo}
                    texto={
                        estadoDidio === "erro"
                            ? `${fala.texto} A alternativa certa é a ${LETRAS[pergunta.correta]}.`
                            : fala.texto
                    }
                    explicacao={confirmada ? pergunta.explicacao : null}
                />
            </aside>
        </div>
    );
}

function Quiz() {
    const { id } = useParams();

    // /quiz (sem tema): mostra os cards para escolher
    if (!id) return <CardsInicio />;

    const quiz = quizzes.find((q) => q.id === id);
    const perguntas = perguntasPorQuiz[id];

    // /quiz/algo-inexistente
    if (!quiz || !perguntas) {
        return (
            <div className="quiz anim-page-enter">
                <div className="quiz-resultado">
                    <h1>Quiz não encontrado</h1>
                    <p className="quiz-resultado-texto">
                        Não encontramos esse tema. Volte ao início e escolha um dos quizzes.
                    </p>
                    <div className="quiz-acoes quiz-acoes-centro">
                        <Link to="/home" className="quiz-botao">
                            Voltar ao início
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // "key" zera o quiz sempre que o tema mudar
    return <QuizJogo key={id} quiz={quiz} perguntas={perguntas} />;
}

export default Quiz;