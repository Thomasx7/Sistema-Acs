import { useEffect, useState } from "react";

import { ApiError } from "../../services/api";
import { listarQuizzes } from "../../services/quizzes";

import "../../assets/css/pages_css/biblioteca.css";

// Passos do fluxo da plataforma (para mudar um texto, edite aqui)
const passos = [
    {
        titulo: "Escolha um tema",
        texto: "Na página Início, selecione o quiz que deseja fazer.",
    },
    {
        titulo: "Responda as perguntas",
        texto: "Marque uma alternativa e confirme a sua resposta.",
    },
    {
        titulo: "Veja o resultado",
        texto: "Cada resposta mostra se está certa e o porquê. No fim, você vê sua pontuação.",
    },
    {
        titulo: "Acompanhe sua evolução",
        texto: "Início e Progresso mostram o que está em andamento e concluído, sincronizados com sua conta.",
    },
];

// Resumo das principais funções
const funcoes = [
    {
        titulo: "Início",
        texto: "Boas-vindas, escolha do quiz por tema e os últimos quizzes que você fez.",
        disponivel: true,
    },
    {
        titulo: "Quiz",
        texto: "Perguntas uma por vez, com retorno imediato de acerto ou erro e explicação.",
        disponivel: true,
    },
    {
        titulo: "Progresso",
        texto: "Resumo geral e o andamento de cada quiz, com opção de continuar ou refazer.",
        disponivel: true,
    },
    {
        titulo: "Biblioteca",
        texto: "Materiais de apoio para estudar cada tema antes e depois dos quizzes.",
        disponivel: false,
    },
];

function Biblioteca() {
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
                            : "Não foi possível carregar os temas."
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

    return (
        <div className="biblioteca anim-page-enter">
            <div className="biblioteca-top">
                <h1>Biblioteca</h1>
                <p>Materiais de apoio para os seus estudos.</p>
            </div>

            {/* Aviso */}
            <section className="biblioteca-aviso" role="note">
                <span className="aviso-icone" aria-hidden="true">
                    i
                </span>

                <div className="aviso-texto">
                    <span className="aviso-selo">Em breve</span>
                    <h2>Biblioteca de materiais</h2>
                    <p>
                        Estamos preparando um espaço com textos, guias e materiais de apoio
                        para cada tema. Por enquanto, você já pode praticar nos quizzes.
                    </p>

                    <ul className="aviso-temas anim-stagger-fade">
                        {quizzes.map((quiz) => (
                            <li key={quiz.id} className={quiz.cor || ""}>
                                {quiz.nome}
                            </li>
                        ))}
                    </ul>
                    {carregandoQuizzes && <p role="status">Carregando temas...</p>}
                    {erroQuizzes && <p role="alert">{erroQuizzes}</p>}
                </div>
            </section>

            {/* Fluxo */}
            <section className="biblioteca-bloco">
                <div className="bloco-top">
                    <h2>Como funciona a plataforma</h2>
                    <p>Do primeiro quiz ao acompanhamento do seu progresso.</p>
                </div>

                <ol className="fluxo anim-stagger">
                    {passos.map((passo, i) => (
                        <li key={passo.titulo}>
                            <span className="fluxo-numero">{i + 1}</span>
                            <h3>{passo.titulo}</h3>
                            <p>{passo.texto}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Funções */}
            <section className="biblioteca-bloco">
                <div className="bloco-top">
                    <h2>Principais funções</h2>
                    <p>O que você encontra em cada área do sistema.</p>
                </div>

                <div className="funcoes anim-stagger">
                    {funcoes.map((funcao) => (
                        <article key={funcao.titulo} className="funcao">
                            <div className="funcao-topo">
                                <h3>{funcao.titulo}</h3>
                                <span
                                    className={`funcao-status ${
                                        funcao.disponivel ? "status-ok" : "status-breve"
                                    }`}
                                >
                                    {funcao.disponivel ? "Disponível" : "Em breve"}
                                </span>
                            </div>
                            <p>{funcao.texto}</p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Biblioteca;