export const PERMISSAO_ADM = "ADM";
export const PERMISSAO_COMUM = "Comum";
export const PERMISSOES_USUARIO = [PERMISSAO_ADM, PERMISSAO_COMUM];
export const STATUS_USUARIO = ["Ativo", "Inativo"];

export function ehAdm(usuario) {
    return usuario?.permissao === PERMISSAO_ADM;
}
