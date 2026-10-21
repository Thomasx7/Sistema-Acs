// Foto de perfil: fica neste navegador, separada por usuário.

function chaveDaFoto(idUsuario) {
    return `acs-foto-${idUsuario}`;
}

export function lerFoto(idUsuario) {
    try {
        const foto = localStorage.getItem(chaveDaFoto(idUsuario));
        return foto && foto.startsWith("data:image/") ? foto : "";
    } catch {
        return "";
    }
}

// Devolve true se salvou, false se o navegador não deixou (ex.: sem espaço).
export function salvarFoto(idUsuario, foto) {
    try {
        if (foto) {
            localStorage.setItem(chaveDaFoto(idUsuario), foto);
        } else {
            localStorage.removeItem(chaveDaFoto(idUsuario));
        }
        return true;
    } catch {
        return false;
    }
}