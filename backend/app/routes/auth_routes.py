from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)

from app.models.models import Usuarios
from app.services.auth_service import autenticar, AuthError
from app.services.email_service import enviar_email_reset
from app.services.reset_senha_service import (
    TokenRedefinicaoInvalido,
    buscar_token_valido,
    gerar_token,
    redefinir,
)
from app.utils.validators import normalizar_email, validar_email, validar_senha

auth_bp = Blueprint('auth_bp', __name__)

MSG_REDEFINICAO_SOLICITADA = (
    "Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha."
)
MSG_LINK_INVALIDO = "Link inválido ou expirado"


@auth_bp.route('/esqueci-senha', methods=['POST'])
def esqueci_senha():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"erro": "Email inválido"}), 400
    email = data.get("email")
    if not isinstance(email, str):
        return jsonify({"erro": "Email inválido"}), 400

    email = normalizar_email(email)
    if validar_email(email):
        return jsonify({"erro": "Email inválido"}), 400

    usuario = Usuarios.query.filter_by(email=email, status="Ativo").first()
    if usuario:
        token = gerar_token(usuario)
        if token:
            enviar_email_reset(usuario, token)

    return jsonify({"mensagem": MSG_REDEFINICAO_SOLICITADA}), 200


@auth_bp.route('/redefinir-senha/validar', methods=['POST'])
def validar_token_redefinicao():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"erro": MSG_LINK_INVALIDO}), 400
    token = data.get("token")
    if not isinstance(token, str) or not token:
        return jsonify({"erro": MSG_LINK_INVALIDO}), 400

    if not buscar_token_valido(token):
        return jsonify({"erro": MSG_LINK_INVALIDO}), 400

    return jsonify({"valido": True}), 200


@auth_bp.route('/redefinir-senha', methods=['POST'])
def redefinir_senha():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"erro": MSG_LINK_INVALIDO}), 400
    token = data.get("token")
    senha = data.get("senha")

    if not isinstance(token, str) or not token:
        return jsonify({"erro": MSG_LINK_INVALIDO}), 400
    if not isinstance(senha, str):
        return jsonify({"erro": "Senha é obrigatória"}), 400

    erro_senha = validar_senha(senha)
    if erro_senha:
        return jsonify({"erro": erro_senha}), 400

    try:
        redefinir(token, senha)
    except TokenRedefinicaoInvalido:
        return jsonify({"erro": MSG_LINK_INVALIDO}), 400

    return jsonify({"mensagem": "Senha redefinida com sucesso"}), 200


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