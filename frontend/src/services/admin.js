import { api } from "./api";

export function buscarDashboard() {
    return api.get("/admin/dashboard");
}

export function listarUsuarios() {
    return api.get("/usuarios/");
}

export function criarUsuario(dados) {
    return api.post("/usuarios/admin", dados);
}

export function atualizarUsuario(idUsuario, dados) {
    return api.put(`/usuarios/admin/${idUsuario}`, dados);
}

export function excluirUsuario(idUsuario) {
    return api.delete(`/usuarios/${idUsuario}`);
}
