export const CHAVE_PERFIL = "acs-perfil-usuario";

export const PERFIL_PADRAO = {
    nome: "Thomas",
    email: "thomas@example.com",
    foto: "",
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
    };
}

export function salvarPerfil(perfil) {
    const dadosPersistidos = {
        nome: perfil.nome,
        email: perfil.email,
        foto: perfil.foto,
    };

    localStorage.setItem(CHAVE_PERFIL, JSON.stringify(dadosPersistidos));
}
