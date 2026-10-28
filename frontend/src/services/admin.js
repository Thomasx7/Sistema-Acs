import { api } from "./api";

export function buscarDashboard() {
    return api.get("/admin/dashboard");
}

export function listarUsuarios() {
    return api.get("/usuarios/");
}

export function buscarUsuario(id, options) {
    return api.get(`/usuarios/${id}`, options);
}

export function criarUsuario(dados) {
    return api.post("/admin/usuarios", dados);
}

export function atualizarUsuario(id, dados) {
    return api.put(`/usuarios/${id}`, dados);
}

export function excluirUsuario(id) {
    return api.delete(`/usuarios/${id}`);
}
