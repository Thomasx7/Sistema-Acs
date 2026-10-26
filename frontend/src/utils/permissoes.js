export const PERMISSAO_ADM = "ADM";

export function ehAdm(usuario) {
    return usuario?.permissao === PERMISSAO_ADM;
}
