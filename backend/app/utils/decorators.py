from functools import wraps

from flask import g, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.models import Usuarios
from app.utils.permissoes import PERMISSAO_ADM


def eh_adm(usuario):
    return usuario.permissao == PERMISSAO_ADM


def autenticado(funcao):
    """Exige login. Deixa o usuário do token em g.usuario_atual."""

    @wraps(funcao)
    @jwt_required()
    def wrapper(*args, **kwargs):
        # A permissão vem SEMPRE do banco, nunca do que está dentro do token
        usuario = Usuarios.query.get(int(get_jwt_identity()))

        if not usuario or usuario.status != "Ativo":
            return jsonify({"erro": "Sessão inválida. Faça login novamente"}), 401

        g.usuario_atual = usuario
        return funcao(*args, **kwargs)

    return wrapper


def apenas_adm(funcao):
    """Exige login e permissão administrativa."""

    @wraps(funcao)
    @autenticado
    def wrapper(*args, **kwargs):
        if not eh_adm(g.usuario_atual):
            return jsonify({"erro": "Acesso negado"}), 403
        return funcao(*args, **kwargs)

    return wrapper