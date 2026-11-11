import { api } from "./api";

export function listarQuizzes() {
    return api.get("/quizzes");
}

export function obterQuiz(idQuiz) {
    return api.get(`/quizzes/${idQuiz}`);
}

export function obterQuizAdmin(idQuiz) {
    return api.get(`/quizzes/${idQuiz}/admin`);
}

export function criarQuiz(dados) {
    return api.post("/quizzes", dados);
}

export function atualizarQuiz(idQuiz, dados) {
    return api.put(`/quizzes/${idQuiz}`, dados);
}

export function excluirQuiz(idQuiz) {
    return api.delete(`/quizzes/${idQuiz}`);
}

export function adicionarPergunta(idQuiz, dados) {
    return api.post(`/quizzes/${idQuiz}/perguntas`, dados);
}

export function atualizarPergunta(idPergunta, dados) {
    return api.put(`/perguntas/${idPergunta}`, dados);
}

export function excluirPergunta(idPergunta) {
    return api.delete(`/perguntas/${idPergunta}`);
}

export function registrarAcessoQuiz(idQuiz) {
    return api.post(`/quizzes/${idQuiz}/acesso`);
}

export function responderPergunta(idQuiz, dados) {
    return api.post(`/quizzes/${idQuiz}/responder`, dados);
}
