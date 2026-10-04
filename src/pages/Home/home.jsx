import CardsInicio from "../../components/cards-Inicio";
import HistoricoQuiz from "../../components/historico-quiz";
import "../../assets/css/pages_css/home.css";

function Home() {
    return (
        <div className="home-dashboard">
            {/* Card de boas-vindas */}
            <div className="boas-vindas">
                <h1>Seja Bem vindo!</h1>
                <p>Aqui você vê o resumo do seu progresso, novidades e avisos.</p>
            </div>

            <CardsInicio />
            <HistoricoQuiz />
        </div>
    );
}

export default Home;