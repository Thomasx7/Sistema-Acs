import re

from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models.model_user import User

bp = Blueprint("users", __name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_SENHA_LENGTH = 6


# VALIDAÇÃO
def validar_usuario(data, parcial=False):
    """Retorna um dict de erros (vazio = ok).

    parcial=True (PATCH): valida só os campos enviados.
    parcial=False (POST): nome, email e senha são obrigatórios.
    """
    erros = {}

    if "nome" in data or not parcial:
        nome = (data.get("nome") or "").strip()
        if not nome:
            erros["nome"] = "Nome é obrigatório."
        elif len(nome) > 120:
            erros["nome"] = "Nome deve ter no máximo 120 caracteres."

    if "email" in data or not parcial:
        email = (data.get("email") or "").strip()
        if not email:
            erros["email"] = "E-mail é obrigatório."
        elif not EMAIL_REGEX.match(email):
            erros["email"] = "E-mail inválido."

    if "senha" in data or not parcial:
        senha = data.get("senha") or ""
        if len(senha) < MIN_SENHA_LENGTH:
            erros["senha"] = f"Senha deve ter no mínimo {MIN_SENHA_LENGTH} caracteres."

    return erros


# Checa se o e-mail já está em uso
def email_em_uso(email, ignore_id=None):
    query = db.select(User).filter_by(email=email)
    if ignore_id is not None:
        query = query.where(User.id_user != ignore_id)
    return db.session.execute(query).first() is not None


# CREATE
@bp.post("/")
def criar_usuario():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Envie um JSON válido."}), 400

    erros = validar_usuario(data)
    if erros:
        return jsonify({"errors": erros}), 400

    email = data["email"].strip().lower()
    if email_em_uso(email):
        return jsonify({"errors": {"email": "E-mail já cadastrado."}}), 409

    user = User(nome=data["nome"].strip(), email=email)
    user.set_password(data["senha"])

    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"errors": {"email": "E-mail já cadastrado."}}), 409

    return jsonify(user.to_dict()), 201


# LISTA
@bp.get("/")
def listar_usuarios():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 10, type=int), 100)
    busca = request.args.get("search", "").strip()

    query = db.select(User).order_by(User.id_user)
    if busca:
        like = f"%{busca}%"
        query = query.where(User.nome.ilike(like) | User.email.ilike(like))

    pagination = db.paginate(query, page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [u.to_dict() for u in pagination.items],
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    }), 200


# BUSCA UM
@bp.get("/<int:user_id>")
def buscar_usuario(user_id):
    user = db.get_or_404(User, user_id)
    return jsonify(user.to_dict()), 200


# ATUALIZA
@bp.patch("/<int:user_id>")
def editar_usuario(user_id):
    user = db.get_or_404(User, user_id)

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Envie um JSON válido."}), 400

    erros = validar_usuario(data, parcial=True)
    if erros:
        return jsonify({"errors": erros}), 400

    if "nome" in data:
        user.nome = data["nome"].strip()

    if "email" in data:
        email = data["email"].strip().lower()
        if email_em_uso(email, ignore_id=user.id_user):
            return jsonify({"errors": {"email": "E-mail já cadastrado."}}), 409
        user.email = email

    if "senha" in data:
        user.set_password(data["senha"])

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"errors": {"email": "E-mail já cadastrado."}}), 409

    return jsonify(user.to_dict()), 200


# DELETE
@bp.delete("/<int:user_id>")
def remover_usuario(user_id):
    user = db.get_or_404(User, user_id)
    db.session.delete(user)
    db.session.commit()
    return "", 204