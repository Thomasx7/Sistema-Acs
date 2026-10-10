import re

from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models.model_user import User

bp = Blueprint("users", __name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_PASSWORD_LENGTH = 6


# VALIDAÇÃO 
def validate_user_data(data, partial=False):
    """Valida o JSON recebido. Retorna um dict de erros (vazio = ok).

    partial=True (PATCH): só valida os campos que vieram.
    partial=False (POST): name, email e password são obrigatórios.
    """
    errors = {}

    if "name" in data or not partial:
        name = (data.get("name") or "").strip()
        if not name:
            errors["name"] = "Nome é obrigatório."
        elif len(name) > 120:
            errors["name"] = "Nome deve ter no máximo 120 caracteres."

    if "email" in data or not partial:
        email = (data.get("email") or "").strip()
        if not email:
            errors["email"] = "E-mail é obrigatório."
        elif not EMAIL_REGEX.match(email):
            errors["email"] = "E-mail inválido."

    if "password" in data or not partial:
        password = data.get("password") or ""
        if len(password) < MIN_PASSWORD_LENGTH:
            errors["password"] = (
                f"Senha deve ter no mínimo {MIN_PASSWORD_LENGTH} caracteres."
            )

    return errors

# Função auxiliar para checar se o email já está em uso
def email_in_use(email, ignore_id=None):
    query = db.select(User).filter_by(email=email)
    if ignore_id is not None:
        query = query.where(User.id != ignore_id)
    return db.session.execute(query).first() is not None


# CREATE
@bp.post("/")
def create_user():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Envie um JSON válido."}), 400

    errors = validate_user_data(data)
    if errors:
        return jsonify({"errors": errors}), 400

    email = data["email"].strip().lower()
    if email_in_use(email):
        return jsonify({"errors": {"email": "E-mail já cadastrado."}}), 409

    user = User(name=data["name"].strip(), email=email)
    user.set_password(data["password"])

    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        # Corrida: dois cadastros simultâneos passaram pelo email_in_use
        db.session.rollback()
        return jsonify({"errors": {"email": "E-mail já cadastrado."}}), 409

    return jsonify(user.to_dict()), 201


# LISTA
@bp.get("/")
def list_users():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 10, type=int), 100)
    search = request.args.get("search", "").strip()

    query = db.select(User).order_by(User.id)
    if search:
        like = f"%{search}%"
        query = query.where(User.name.ilike(like) | User.email.ilike(like))

    pagination = db.paginate(query, page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [u.to_dict() for u in pagination.items],
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total": pagination.total,
        "pages": pagination.pages,
    }), 200


# LISTA UM EM ESPECIFICO
@bp.get("/<int:user_id>")
def get_user(user_id):
    user = db.get_or_404(User, user_id)
    return jsonify(user.to_dict()), 200


# ATUALIZA OS ITENS DO USUARIO
@bp.patch("/<int:user_id>")
def update_user(user_id):
    user = db.get_or_404(User, user_id)

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Envie um JSON válido."}), 400

    errors = validate_user_data(data, partial=True)
    if errors:
        return jsonify({"errors": errors}), 400

    if "name" in data:
        user.name = data["name"].strip()

    if "email" in data:
        email = data["email"].strip().lower()
        if email_in_use(email, ignore_id=user.id):
            return jsonify({"errors": {"email": "E-mail já cadastrado."}}), 409
        user.email = email

    if "password" in data:
        user.set_password(data["password"])

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"errors": {"email": "E-mail já cadastrado."}}), 409

    return jsonify(user.to_dict()), 200


#DELETE
@bp.delete("/<int:user_id>")
def delete_user(user_id):
    user = db.get_or_404(User, user_id)
    db.session.delete(user)
    db.session.commit()
    return "", 204