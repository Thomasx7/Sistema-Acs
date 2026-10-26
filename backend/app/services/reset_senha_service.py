import hashlib
import secrets
from datetime import datetime, timedelta

from app import db
from flask import current_app
from app.models.models import RedefinicoesSenha, Usuarios
from app.utils.hash import hash_password


class TokenRedefinicaoInvalido(Exception):
    """Indica que o link de redefinição não pode mais ser usado."""


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def gerar_token(usuario: Usuarios) -> str | None:
    usuario_atual = (
        Usuarios.query.filter_by(id_usuario=usuario.id_usuario)
        .with_for_update()
        .first()
    )
    if not usuario_atual:
        raise ValueError("Usuário não encontrado")
    if usuario_atual.status != "Ativo":
        db.session.commit()
        return None

    agora = datetime.utcnow()
    ultimo_token = (
        RedefinicoesSenha.query.filter_by(id_usuario=usuario_atual.id_usuario)
        .order_by(RedefinicoesSenha.criado_em.desc())
        .first()
    )
    if ultimo_token and agora - ultimo_token.criado_em < timedelta(seconds=60):
        db.session.commit()
        return None

    RedefinicoesSenha.query.filter(
        RedefinicoesSenha.id_usuario == usuario_atual.id_usuario,
        RedefinicoesSenha.usado_em.is_(None),
        RedefinicoesSenha.expira_em > agora,
    ).update(
        {RedefinicoesSenha.usado_em: agora},
        synchronize_session=False,
    )

    token = secrets.token_urlsafe(32)
    registro = RedefinicoesSenha(
        id_usuario=usuario_atual.id_usuario,
        token_hash=_hash_token(token),
        criado_em=agora,
        expira_em=agora
        + timedelta(minutes=current_app.config["RESET_SENHA_EXPIRA_MINUTOS"]),
    )
    db.session.add(registro)
    db.session.commit()
    return token


def buscar_token_valido(token: str) -> RedefinicoesSenha | None:
    registro = RedefinicoesSenha.query.filter_by(
        token_hash=_hash_token(token)
    ).first()
    if (
        not registro
        or registro.usado_em is not None
        or registro.expira_em <= datetime.utcnow()
    ):
        return None
    return registro


def redefinir(token: str, nova_senha: str) -> None:
    hash_token = _hash_token(token)
    candidato = RedefinicoesSenha.query.filter_by(token_hash=hash_token).first()
    if not candidato:
        raise TokenRedefinicaoInvalido

    usuario = (
        Usuarios.query.filter_by(id_usuario=candidato.id_usuario)
        .with_for_update()
        .first()
    )
    if not usuario:
        raise TokenRedefinicaoInvalido

    registro = (
        RedefinicoesSenha.query.filter_by(
            id=candidato.id,
            token_hash=hash_token,
        )
        .with_for_update()
        .first()
    )
    agora = datetime.utcnow()
    if (
        not registro
        or registro.usado_em is not None
        or registro.expira_em <= agora
    ):
        raise TokenRedefinicaoInvalido

    usuario.senha = hash_password(nova_senha)
    usuario.tentativas_falhas = 0
    usuario.bloqueado_ate = None
    registro.usado_em = agora
    RedefinicoesSenha.query.filter(
        RedefinicoesSenha.id_usuario == usuario.id_usuario,
        RedefinicoesSenha.id != registro.id,
        RedefinicoesSenha.usado_em.is_(None),
    ).update(
        {RedefinicoesSenha.usado_em: agora},
        synchronize_session=False,
    )
    db.session.commit()
