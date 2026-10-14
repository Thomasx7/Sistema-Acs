from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from ..extensions import db
from ..models.model_user import User

bp = Blueprint("auth", __name__)


# LOGIN
@bp.post("/login")
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Envie um JSON válido."}), 400

    email = (data.get("email") or "").strip().lower()
    senha = data.get("senha") or ""

    erros = {}
    if not email:
        erros["email"] = "E-mail é obrigatório."
    if not senha:
        erros["senha"] = "Senha é obrigatória."
    if erros:
        return jsonify({"errors": erros}), 400

    user = db.session.execute(
        db.select(User).filter_by(email=email)
    ).scalar_one_or_none()

    # Mensagem dizendo que senha ou e-mail estão incorretos
    if user is None or not user.check_password(senha):
        return jsonify({"error": "E-mail ou senha inválidos."}), 401

    token = create_access_token(identity=str(user.id_user))

    return jsonify({
        "access_token": token,
        "user": user.to_dict(),
    }), 200


# USUÁRIO LOGADO (rota protegida, serve para validar o token)
@bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.get_or_404(User, user_id)
    return jsonify(user.to_dict()), 200