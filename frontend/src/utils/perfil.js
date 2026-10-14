export const CHAVE_PERFIL = "acs-perfil-usuario";

export const PERFIL_PADRAO = {
    nome: "Mateus",
    email: "mateus@example.com",
    foto: "",
    tema: "claro",
};

export function lerPerfil() {
    const salvo = localStorage.getItem(CHAVE_PERFIL);
    if (!salvo) return { ...PERFIL_PADRAO };

    const perfil = JSON.parse(salvo);
    if (!perfil || typeof perfil !== "object" || Array.isArray(perfil)) {
        throw new Error("Os dados de perfil salvos estão inválidos.");
    }

    return {
        nome: typeof perfil.nome === "string" ? perfil.nome : PERFIL_PADRAO.nome,
        email: typeof perfil.email === "string" ? perfil.email : PERFIL_PADRAO.email,
        foto: typeof perfil.foto === "string" ? perfil.foto : "",
        tema: perfil.tema === "escuro" || perfil.tema === "dark" ? "escuro" : "claro",
    };
}

export function salvarPerfil(perfil) {
    const dadosPersistidos = {
        nome: perfil.nome,
        email: perfil.email,
        foto: perfil.foto,
        tema: perfil.tema,
    };

    localStorage.setItem(CHAVE_PERFIL, JSON.stringify(dadosPersistidos));
}

export function lerPreferenciaTema() {
    const salvo = localStorage.getItem(CHAVE_PERFIL);
    if (!salvo) return null;

    const perfil = JSON.parse(salvo);
    if (!perfil || typeof perfil !== "object" || Array.isArray(perfil)) {
        throw new Error("Os dados de perfil salvos estão inválidos.");
    }

    if (perfil.tema === "escuro" || perfil.tema === "dark") return "dark";
    if (perfil.tema === "claro" || perfil.tema === "light") return "light";
    return null;
}

export function salvarPreferenciaTema(tema) {
    const perfil = lerPerfil();
    salvarPerfil({ ...perfil, tema: tema === "dark" ? "escuro" : "claro" });
}
