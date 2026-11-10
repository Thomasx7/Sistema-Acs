import { API_URL } from "../services/api";

export function montarUrlFoto(fotoPerfil) {
    if (!fotoPerfil) return "";

    const base = API_URL.replace(/\/+$/, "");
    const caminho = String(fotoPerfil).replace(/^\/+/, "");
    const versao = caminho.split("/").pop();
    return `${base}/${caminho}?v=${encodeURIComponent(versao)}`;
}