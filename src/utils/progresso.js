// TODO Guarda o andamento dos quizzes no navegador (localStorage).
const CHAVE = "acs-historico-quiz";

// Devolve a lista: [{ id, status, progresso, atualizadoEm }]
export function lerHistorico() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

// status: "andamento" | "concluido"   progresso: 0 a 100
export function salvarProgresso(id, { status = "andamento", progresso = 0 } = {}) {
    const outros = lerHistorico().filter((item) => item.id !== id);
    const atual = {
        id,
        status,
        progresso,
        atualizadoEm: new Date().toISOString(),
    };

    try {
        localStorage.setItem(CHAVE, JSON.stringify([atual, ...outros]));
    } catch {
        // Se o navegador bloquear o armazenamento, apenas ignora.
    }
}