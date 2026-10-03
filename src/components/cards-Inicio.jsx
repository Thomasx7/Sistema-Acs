import { Link } from "react-router-dom";
import "../assets/css/components_css/cards-inicio.css";

const quizzes = [
    {
        id: "lgpd",
        classe: "card-lgpd",
        titulo: "LGPD",
        descricao:
            "Entenda a Lei Geral de Proteção de Dados: direitos dos titulares, deveres e boas práticas no tratamento de dados pessoais.",
    },
    {
        id: "letramento-digital",
        classe: "card-letramento",
        titulo: "Letramento Digital",
        descricao:
            "Desenvolva habilidades para usar as tecnologias digitais com autonomia, senso crítico e responsabilidade.",
    },
    {
        id: "seguranca-da-informacao",
        classe: "card-seguranca",
        titulo: "Segurança da Informação",
        descricao:
            "Aprenda a proteger dados e sistemas: senhas fortes, golpes de phishing, backups e cuidados do dia a dia.",
    },
    {
        id: "saude-digital",
        classe: "card-saude",
        titulo: "Saúde Digital",
        descricao:
            "Conheça o uso da tecnologia na saúde, como prontuário eletrônico, telessaúde e cuidados com os dados dos pacientes.",
    },
];

function CardsInicio() {
    return (

        <div className="cards">

            <div className="card-top">
                <h1>Escolha seu quiz</h1>
                <p>Selecione um dos temas abaixo para iniciar o quiz.</p>
            </div>

            {/* Card */}
            <div className="card-container">
                {quizzes.map((quiz) => (
                    <article key={quiz.id} className={`card-quiz ${quiz.classe}`}>
                        <h2>{quiz.titulo}</h2>
                        <p>{quiz.descricao}</p>
                        <Link to={`/quiz/${quiz.id}`} className="card-quiz-botao">
                            Iniciar Quiz
                        </Link>
                    </article>
                ))}

            </div>            
        </div>
    )
}

export default CardsInicio;