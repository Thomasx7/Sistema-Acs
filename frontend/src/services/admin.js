import { api } from "./api";

export function buscarDashboard() {
    return api.get("/admin/dashboard");
}

export function listarUsuarios() {
    return api.get("/usuarios/");
}
