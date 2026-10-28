import { lerToken, removerToken } from "../utils/tokenStorage";

const API_URL = "http://localhost:5000"; //TODO Mudar aqui URL backend

// Erro padronizado: toda falha da API chega às telas neste formato.
export class ApiError extends Error {
    constructor(mensagem, status) {
        super(mensagem);
        this.name = "ApiError";
        this.status = status;
    }
}

// O AuthContext registra aqui o que fazer quando a sessão expira.
let aoExpirarSessao = null;

export function definirAoExpirarSessao(funcao) {
    aoExpirarSessao = funcao;
}

async function requisicao(metodo, caminho, corpo) {
    const token = lerToken();

    const headers = { Accept: "application/json" };
    if (corpo !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    let resposta;
    try {
        resposta = await fetch(`${API_URL}${caminho}`, {
            method: metodo,
            headers,
            body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
        });
    } catch {
        throw new ApiError(
            "Não foi possível conectar ao servidor. Tente novamente.",
            0
        );
    }

    // Se o corpo não for JSON, vira objeto vazio em vez de quebrar.
    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        console.warn("[API] Requisição falhou:", metodo, caminho, resposta.status);

        // Mensagem do backend: {"erro": "..."} (as rotas do JWT usam "msg")
        const mensagem =
            dados.erro || dados.msg || "Ocorreu um erro. Tente novamente.";

        // 401 com token enviado = sessão expirada ou token inválido.
        // Sem token (ex.: senha errada no login), não é expiração.
        // Respostas 403 são negadas por permissão e não encerram a sessão.
        if (resposta.status === 401 && token) {
            removerToken();
            if (aoExpirarSessao) aoExpirarSessao();
        }

        throw new ApiError(mensagem, resposta.status);
    }

    return dados;
}

export const api = {
    get: (caminho) => requisicao("GET", caminho),
    post: (caminho, corpo) => requisicao("POST", caminho, corpo ?? {}),
    put: (caminho, corpo) => requisicao("PUT", caminho, corpo ?? {}),
    delete: (caminho) => requisicao("DELETE", caminho),
};