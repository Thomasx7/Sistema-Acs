import { api } from "./api";

export async function listarProgresso() {
    const dados = await api.get("/progresso/");

    return (Array.isArray(dados) ? dados : []).map((item) => ({
        id: item.id_quiz,
        status: item.status,
        progresso: Number(item.progresso) || 0,
        acertos: Number(item.acertos) || 0,
        totalPerguntas: Number(item.total_perguntas) || 0,
        atualizadoEm: item.atualizado_em,
    }));
}

export async function salvarProgresso(idQuiz, { status, progresso, acertos, totalPerguntas }) {
    const dados = await api.put(`/progresso/${idQuiz}`, {
        status,
        progresso,
        acertos,
        total_perguntas: totalPerguntas,
    });

    return {
        id: dados.id_quiz,
        status: dados.status,
        progresso: Number(dados.progresso) || 0,
        acertos: Number(dados.acertos) || 0,
        totalPerguntas: Number(dados.total_perguntas) || 0,
        atualizadoEm: dados.atualizado_em,
    };
}
