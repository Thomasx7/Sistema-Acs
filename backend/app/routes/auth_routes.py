from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from app.models.models import Usuarios
from app.services.auth_service import autenticar, AuthError
from app.utils.validators import normalizar_email, validar_email, validar_senha

auth_bp = Blueprint('auth_bp', __name__)


# TODO LOGIN
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    senha = data.get("senha")

    if not isinstance(email, str) or not isinstance(senha, str):
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    email = normalizar_email(email)

    erro = validar_email(email) or validar_senha(senha)
    if erro:
        return jsonify({"erro": erro}), 400

    try:
        usuario = autenticar(email, senha)
    except AuthError as e:
        resposta = jsonify({"erro": e.mensagem})
        resposta.status_code = e.status
        if e.retry_after:
            resposta.headers["Retry-After"] = str(e.retry_after)
        return resposta

    token = create_access_token(
        identity=str(usuario.id_usuario),
        additional_claims={"permissao": usuario.permissao},
    )

    return jsonify({
        "mensagem": "Login realizado com sucesso",
        "access_token": token,
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "nome": usuario.nome,
            "email": usuario.email,
            "permissao": usuario.permissao,
        },
    }), 200


# TODO DADOS DO USUÁRIO LOGADO
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    usuario = Usuarios.query.get(int(get_jwt_identity()))

    if not usuario or usuario.status != "Ativo":
        return jsonify({"erro": "Usuário não encontrado"}), 404

    return jsonify({
        "id_usuario": usuario.id_usuario,
        "nome": usuario.nome,
        "email": usuario.email,
        "permissao": usuario.permissao,
    }), 200