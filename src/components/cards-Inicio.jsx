import { useState } from "react";
import { Link } from "react-router-dom";

import { quizzes } from "../data/quizzes";
import { lerHistorico } from "../utils/progresso";

import "../assets/css/components_css/cards-inicio.css";

function CardsInicio() {
    // Lê o andamento salvo uma vez, quando a Home abre
    const [historico] = useState(() => lerHistorico());

    function textoDoBotao(id) {
        const item = historico.find((h) => h.id === id);

        if (!item) return "Iniciar Quiz";
        return item.status === "concluido" ? "Quiz concluído" : "Quiz em andamento";
    }

    return (
        <div className="cards">
            <div className="card-top">
                <h1>Escolha seu quiz</h1>
                <p>Selecione um dos temas abaixo para iniciar o quiz.</p>
            </div>

            <div className="card-container">
                {quizzes.map((quiz) => (
                    <article key={quiz.id} className={`card-quiz ${quiz.classe}`}>
                        <h2>{quiz.titulo}</h2>
                        <p>{quiz.descricao}</p>

                        <Link to={`/quiz/${quiz.id}`} className="card-quiz-botao">
                            {textoDoBotao(quiz.id)}
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default CardsInicio;