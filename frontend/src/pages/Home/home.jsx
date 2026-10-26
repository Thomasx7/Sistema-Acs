import CardsInicio from "../../components/cards-Inicio";
import DashboardAdmin from "../../components/DashboardAdmin";
import HistoricoQuiz from "../../components/historico-quiz";
import { useAuth } from "../../context/useAuth";
import "../../assets/css/pages_css/home.css";
import { ehAdm } from "../../utils/permissoes";

function Home() {
    const { usuario } = useAuth();
    const administrador = ehAdm(usuario);

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

            {administrador ? <DashboardAdmin /> : <CardsInicio />}
            <HistoricoQuiz />
        </div>
    );
}

export default Home;