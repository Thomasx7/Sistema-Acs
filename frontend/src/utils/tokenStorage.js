// TODO Tokens 

// Aqui é lugar do projeto que sabe onde o token do login fica guardado. Ele tem três funções:

// lerToken() devolve o token salvo, ou null se não houver.
// salvarToken(token) guarda o token depois do login.
// removerToken() apaga o token no logout.


const CHAVE_TOKEN = "acs-token";

// sessionStorage: o token some quando a aba é fechada.
const storage = sessionStorage;

export function lerToken() {
    try {
        return storage.getItem(CHAVE_TOKEN);
    } catch {
        return null;
    }
}

export function salvarToken(token) {
    try {
        storage.setItem(CHAVE_TOKEN, token);
    } catch {
        // Se o navegador bloquear o armazenamento, apenas ignora.
    }
}

export function removerToken() {
    try {
        storage.removeItem(CHAVE_TOKEN);
    } catch {
        // Se o navegador bloquear o armazenamento, apenas ignora.
    }
}