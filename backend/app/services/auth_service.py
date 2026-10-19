import math
from datetime import datetime, timedelta

from app import db
from app.models.models import Usuarios
from app.utils.hash import check_password

MAX_TENTATIVAS = 5
BLOQUEIO_SEGUNDOS = 60

MSG_CREDENCIAIS_INVALIDAS = "Email ou senha inválidos"


class AuthError(Exception):
    def __init__(self, mensagem: str, status: int, retry_after: int | None = None):
        super().__init__(mensagem)
        self.mensagem = mensagem
        self.status = status
        self.retry_after = retry_after


def _bloqueio_error(segundos: int) -> AuthError:
    return AuthError(
        f"Muitas tentativas. Tente novamente em {segundos}s",
        429,
        retry_after=segundos,
    )


def autenticar(email: str, senha: str) -> Usuarios:
    """Valida credenciais aplicando bloqueio por tentativas falhas.

    Levanta AuthError em qualquer falha. Retorna o usuário se tudo der certo.
    """
    # with_for_update: evita que requisições simultâneas furem o contador
    usuario = Usuarios.query.filter_by(email=email).with_for_update().first()

    # Mesma mensagem para "email não existe" e "senha errada" (evita enumeração)
    if not usuario:
        raise AuthError(MSG_CREDENCIAIS_INVALIDAS, 401)

    agora = datetime.utcnow()

    # Ainda está bloqueado?
    if usuario.bloqueado_ate:
        if usuario.bloqueado_ate > agora:
            restante = math.ceil((usuario.bloqueado_ate - agora).total_seconds())
            raise _bloqueio_error(restante)
        # bloqueio expirou: zera tudo
        usuario.bloqueado_ate = None
        usuario.tentativas_falhas = 0

    # Confere a senha
    if not check_password(senha, usuario.senha):
        usuario.tentativas_falhas += 1

        if usuario.tentativas_falhas >= MAX_TENTATIVAS:
            usuario.bloqueado_ate = agora + timedelta(seconds=BLOQUEIO_SEGUNDOS)
            usuario.tentativas_falhas = 0
            db.session.commit()
            raise _bloqueio_error(BLOQUEIO_SEGUNDOS)

        db.session.commit()
        raise AuthError(MSG_CREDENCIAIS_INVALIDAS, 401)

    #Senha correta: zera o contador
    usuario.tentativas_falhas = 0
    usuario.bloqueado_ate = None
    db.session.commit()

    # Conta inativa
    if usuario.status != "Ativo":
        raise AuthError("Usuário inativo", 403)

    return usuario