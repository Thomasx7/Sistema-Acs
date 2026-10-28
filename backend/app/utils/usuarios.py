from app.utils.permissoes import PERMISSAO_ADM, PERMISSAO_COMUM

PERMISSOES = (PERMISSAO_ADM, PERMISSAO_COMUM)
STATUS = ("Ativo", "Inativo")
NOME_MAX = 100


def serializar(usuario):
    return {
        "id_usuario": usuario.id_usuario,
        "nome": usuario.nome,
        "email": usuario.email,
        "permissao": usuario.permissao,
        "status": usuario.status,
        "data_cadastro": usuario.data_cadastro.strftime("%Y-%m-%d %H:%M:%S"),
    }


def validar_nome(nome):
    """Retorna a mensagem de erro, ou None se o nome for válido."""
    if not isinstance(nome, str) or not nome.strip():
        return "Nome é obrigatório"
    if len(nome.strip()) > NOME_MAX:
        return f"O nome deve ter no máximo {NOME_MAX} caracteres"
    return None
