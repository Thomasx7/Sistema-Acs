import { api, API_URL, ApiError } from "./api";
import { lerToken } from "../utils/tokenStorage";

export function listarCategorias() {
    return api.get("/library/categories");
}

export function criarCategoria(dados) {
    return api.post("/library/categories", dados);
}

export function atualizarCategoria(id, dados) {
    return api.patch(`/library/categories/${id}`, dados);
}

export function excluirCategoria(id) {
    return api.delete(`/library/categories/${id}`);
}

export function listarMateriais(categoria, parametros = {}) {
    const busca = new URLSearchParams();
    if (parametros.page) busca.set("page", parametros.page);
    if (parametros.per_page) busca.set("per_page", parametros.per_page);
    if (parametros.type) busca.set("type", parametros.type);
    if (parametros.search) busca.set("search", parametros.search);
    const query = busca.toString();
    return api.get(`/library/categories/${encodeURIComponent(categoria)}/materials${query ? `?${query}` : ""}`);
}

export function criarMaterial(formData, aoProgredir) {
    return enviarMultipart("/library/materials", "POST", formData, aoProgredir);
}

export function atualizarMaterial(id, formData, aoProgredir) {
    return enviarMultipart(`/library/materials/${id}`, "PUT", formData, aoProgredir);
}

export function excluirMaterial(id) {
    return api.delete(`/library/materials/${id}`);
}

export async function baixarArquivo(id, nome) {
    const token = lerToken();
    const resposta = await fetch(`${API_URL}/library/materials/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resposta.ok) {
        let mensagem = "Não foi possível baixar o arquivo.";
        try {
            const dados = await resposta.json();
            mensagem = dados.erro || mensagem;
        } catch {
            // Mantém a mensagem padrão.
        }
        throw new ApiError(mensagem, resposta.status);
    }
    const blob = await resposta.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nome || "material";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export async function criarUrlVisualizacao(id) {
    const token = lerToken();
    const resposta = await fetch(`${API_URL}/library/materials/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resposta.ok) {
        throw new ApiError("Não foi possível abrir o arquivo.", resposta.status);
    }
    const blob = await resposta.blob();
    return window.URL.createObjectURL(blob);
}

function enviarMultipart(caminho, metodo, formData, aoProgredir) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(metodo, `${API_URL}${caminho}`);
        const token = lerToken();
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.upload.onprogress = (evento) => {
            if (evento.lengthComputable && aoProgredir) {
                aoProgredir(Math.round((evento.loaded / evento.total) * 100));
            }
        };
        xhr.onload = () => {
            let dados;
            try {
                dados = JSON.parse(xhr.responseText);
            } catch {
                dados = {};
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(dados);
            } else {
                reject(new ApiError(dados.erro || dados.msg || "Não foi possível salvar o material.", xhr.status));
            }
        };
        xhr.onerror = () => reject(new ApiError("Não foi possível conectar ao servidor.", 0));
        xhr.send(formData);
    });
}
