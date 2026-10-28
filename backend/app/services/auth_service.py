from app.models.models import Usuarios
from app.utils.hash import check_password

MSG_CREDENCIAIS_INVALIDAS = "Email ou senha inválidos"


class AuthError(Exception):
    def __init__(self, mensagem: str, status: int):
        super().__init__(mensagem)
        self.mensagem = mensagem
        self.status = status


def autenticar(email: str, senha: str) -> Usuarios:
    """Valida as credenciais e retorna o usuário autenticado.

    Levanta AuthError em qualquer falha. Retorna o usuário se tudo der certo.
    """
    usuario = Usuarios.query.filter_by(email=email).first()

    # Mesma mensagem para "email não existe" e "senha errada" (evita enumeração)
    if not usuario:
        raise AuthError(MSG_CREDENCIAIS_INVALIDAS, 401)

    if not check_password(senha, usuario.senha):
        raise AuthError(MSG_CREDENCIAIS_INVALIDAS, 401)

    if usuario.status != "Ativo":
        raise AuthError("Usuário inativo", 403)

    return usuario