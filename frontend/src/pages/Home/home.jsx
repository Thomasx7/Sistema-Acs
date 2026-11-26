import { useEffect, useState } from "react";
import CardsInicio from "../../components/cards-Inicio";
import DashboardAdmin from "../../components/DashboardAdmin";
import HistoricoQuiz from "../../components/historico-quiz";
import { useAuth } from "../../context/useAuth";
import { ApiError } from "../../services/api";
import { listarProgressos } from "../../services/progressoQuiz";
import "../../assets/css/pages_css/home.css";
import { ehAdm } from "../../utils/permissoes";

function Home() {
    const { usuario } = useAuth();
    const administrador = ehAdm(usuario);
    const [progressos, setProgressos] = useState([]);
    const [carregandoProgresso, setCarregandoProgresso] = useState(true);
    const [erroProgresso, setErroProgresso] = useState("");

    useEffect(() => {
        let cancelado = false;

        listarProgressos()
            .then((dados) => {
                if (!cancelado) setProgressos(dados);
            })
            .catch((falha) => {
                if (!cancelado) {
                    setErroProgresso(
                        falha instanceof ApiError
                            ? falha.message
                            : "Não foi possível carregar o progresso."
                    );
                }
            })
            .finally(() => {
                if (!cancelado) setCarregandoProgresso(false);
            });

        return () => {
            cancelado = true;
        };
    }, []);

    return (
        <div className="home-dashboard anim-page-enter">
            {/* Card de boas-vindas */}
            <div className="boas-vindas">
                <h1>{administrador ? "Painel administrativo" : "Seja Bem vindo!"}</h1>
                <p>
                    {administrador
                        ? "Acompanhe os principais indicadores do sistema."
                        : "Aqui você vê o resumo do seu progresso, novidades e avisos."}
                </p>
            </div>

            {administrador ? (
                <DashboardAdmin />
            ) : (
                <CardsInicio
                    progressos={progressos}
                    carregando={carregandoProgresso}
                    erro={erroProgresso}
                />
            )}
            <HistoricoQuiz
                progressos={progressos}
                carregando={carregandoProgresso}
                erro={erroProgresso}
            />
        </div>
    );
}

export default Home;