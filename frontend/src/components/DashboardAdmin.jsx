import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { buscarDashboard } from "../services/admin";
import { ApiError } from "../services/api";
import { listarQuizzes } from "../services/quizzes";

import "../assets/css/components_css/dashboard-admin.css";

function mensagemDoErro(erro) {
    if (erro instanceof ApiError) {
        if (erro.status === 0) {
            return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
        }
        return erro.message;
    }

    return "Não foi possível carregar os indicadores. Tente novamente.";
}

function DashboardAdmin() {
    const [indicadores, setIndicadores] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [carregandoQuizzes, setCarregandoQuizzes] = useState(true);
    const [erroQuizzes, setErroQuizzes] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        let cancelado = false;

        buscarDashboard()
            .then((dados) => {
                if (!cancelado) setIndicadores(dados);
            })
            .catch((erroDaApi) => {
                if (!cancelado) setErro(mensagemDoErro(erroDaApi));
            })
            .finally(() => {
                if (!cancelado) setCarregando(false);
            });

        listarQuizzes()
            .then((dados) => {
                if (!cancelado) {
                    setQuizzes(dados);
                    setErroQuizzes("");
                }
            })
            .catch((erroDaApi) => {
                if (!cancelado) setErroQuizzes(mensagemDoErro(erroDaApi));
            })
            .finally(() => {
                if (!cancelado) setCarregandoQuizzes(false);
            });

        return () => {
            cancelado = true;
        };
    }, [tentativa]);

    function tentarNovamente() {
        setCarregando(true);
        setCarregandoQuizzes(true);
        setErro("");
        setErroQuizzes("");
        setTentativa((atual) => atual + 1);
    }

    const totalPerguntas = quizzes.reduce(
        (total, quiz) => total + (quiz.quantidade_perguntas || 0),
        0
    );

    return (
        <section className="dashboard-admin" aria-labelledby="dashboard-admin-titulo">
            <div className="dashboard-admin-top">
                <h2 id="dashboard-admin-titulo">Indicadores do sistema</h2>
                <p>Resumo da atividade e dos conteúdos disponíveis.</p>
            </div>

            {carregando && (
                <p className="dashboard-admin-status" role="status">
                    Carregando indicadores...
                </p>
            )}

            {!carregando && erro && (
                <div className="dashboard-admin-erro" role="alert">
                    <p>{erro}</p>
                    <button
                        type="button"
                        className="dashboard-admin-tentar"
                        onClick={tentarNovamente}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {!carregando && !erro && indicadores && (
                <div className="dashboard-admin-resumo anim-stagger">
                    <Link
                        to="/usuarios"
                        className="dashboard-admin-card-link"
                        aria-label={`Total de usuários cadastrados: ${indicadores.total_usuarios}. Ver lista de usuários`}
                    >
                        <article className="dashboard-admin-card resumo-geral">
                            <span>Total de usuários cadastrados</span>
                            <strong>{indicadores.total_usuarios}</strong>
                            <small>
                                {indicadores.usuarios_ativos} ativos ·{" "}
                                {indicadores.usuarios_inativos} inativos
                            </small>
                            <small className="dashboard-admin-link-indicador">
                                Ver usuários →
                            </small>
                        </article>
                    </Link>

                    <article className="dashboard-admin-card resumo-ok">
                        <span>Total de quizzes</span>
                        <strong>
                            {carregandoQuizzes ? "..." : erroQuizzes ? "—" : quizzes.length}
                        </strong>
                        <small>
                            {erroQuizzes || (carregandoQuizzes ? "Carregando conteúdos" : "Conteúdos disponíveis")}
                        </small>
                    </article>

                    <article className="dashboard-admin-card resumo-andamento">
                        <span>Total de perguntas</span>
                        <strong>
                            {carregandoQuizzes ? "..." : erroQuizzes ? "—" : totalPerguntas}
                        </strong>
                        <small>
                            {erroQuizzes || (carregandoQuizzes ? "Carregando perguntas" : "Somadas em todos os quizzes")}
                        </small>
                    </article>

                    <article className="dashboard-admin-card resumo-novo">
                        <span>Novos usuários</span>
                        <strong>{indicadores.novos_ultimos_7_dias}</strong>
                        <small>Nos últimos 7 dias</small>
                    </article>
                </div>
            )}
        </section>
    );
}

export default DashboardAdmin;
