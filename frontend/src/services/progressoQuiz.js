import { api } from "./api";

export function listarProgressos() {
    return api.get("/progresso-quiz");
}

export function obterProgresso(idQuiz) {
    return api.get(`/progresso-quiz/${idQuiz}`);
}

export function salvarProgresso(idQuiz, dados) {
    return api.put(`/progresso-quiz/${idQuiz}`, dados);
}
