import CardsInicio from "../../components/cards-Inicio";
import "../../assets/css/pages_css/home.css";

function Home() {
    return (
        <div className="home-dashboard">
            <div className="fundo" >
                <h1 className="boas-vindas">Seja Bem vindo!</h1>
                <p>Aqui você vê o resumo do seu progresso, novidades e avisos.</p>
            
                <CardsInicio />
            </div>
        </div>
    );
}

export default Home;
