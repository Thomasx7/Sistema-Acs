import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { perguntasPorQuiz } from "../data/perguntas";
import { quizzes } from "../data/quizzes";
import { buscarDashboard } from "../services/admin";
import { ApiError } from "../services/api";

import "../assets/css/components_css/dashboard-admin.css";

const totalPerguntas = Object.values(perguntasPorQuiz).reduce(
    (total, perguntas) => total + perguntas.length,
    0
);

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

        return () => {
            cancelado = true;
        };
    }, [tentativa]);

    function tentarNovamente() {
        setCarregando(true);
        setErro("");
        setTentativa((atual) => atual + 1);
    }

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
                        <strong>{quizzes.length}</strong>
                        <small>Conteúdos disponíveis</small>
                    </article>

                    <article className="dashboard-admin-card resumo-andamento">
                        <span>Total de perguntas</span>
                        <strong>{totalPerguntas}</strong>
                        <small>Somadas em todos os quizzes</small>
                    </article>

                    <article className="dashboard-admin-card resumo-novo">
                        <span>Novos usuários</span>
                        <strong>{indicadores.novos_ultimos_7_dias}</strong>
                        <small>Nos últimos 7 dias</small>
                    </article>
                </div>
            )}
            {/* TODO: virá do backend quando os quizzes forem para o banco. */}
        </section>
    );
}

export default DashboardAdmin;
