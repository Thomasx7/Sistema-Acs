// Regras de validação do front. Espelham as do backend (validators.py).

export const SENHA_MIN = 6;

// texto@dominio.tld (aceita .com, .br, .com.br, .org etc.)
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Tira espaços e deixa minúsculo (igual ao backend).
export function normalizarEmail(email) {
    return email.trim().toLowerCase();
}

// Devolve a mensagem de erro, ou null se estiver tudo certo.
export function validarEmail(email) {
    if (!email) return "Informe seu e-mail.";
    if (email.length > 100) return "O e-mail é muito longo.";
    if (!EMAIL_REGEX.test(email)) return "Informe um e-mail válido.";
    return null;
}

// Devolve a mensagem de erro, ou null se estiver tudo certo.
export function validarSenha(senha) {
    if (!senha) return "Informe sua senha.";
    if (senha.length < SENHA_MIN) {
        return `A senha deve ter no mínimo ${SENHA_MIN} caracteres.`;
    }
    return null;
}