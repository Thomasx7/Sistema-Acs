from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from sqlalchemy import case, func

from app import db
from app.models.models import Usuarios
from app.utils.decorators import apenas_adm
from app.utils.hash import hash_password
from app.utils.permissoes import PERMISSAO_ADM, PERMISSAO_COMUM
from app.utils.usuarios import PERMISSOES, STATUS, serializar, validar_nome
from app.utils.validators import normalizar_email, validar_email, validar_senha

admin_bp = Blueprint("admin_bp", __name__)


@admin_bp.route("/usuarios", methods=["POST"])
@apenas_adm
def criar_usuario():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}

    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")

    if not all(
        isinstance(campo, str) and campo.strip()
        for campo in (nome, email, senha)
    ):
        return jsonify({"erro": "Campos obrigatórios faltando"}), 400

    permissao = data.get("permissao", PERMISSAO_COMUM)
    status = data.get("status", "Ativo")
    if permissao not in PERMISSOES or status not in STATUS:
        return jsonify({"erro": "Valor inválido para permissao/status"}), 400

    email = normalizar_email(email)
    erro = validar_nome(nome) or validar_email(email) or validar_senha(senha)
    if erro:
        return jsonify({"erro": erro}), 400

    if Usuarios.query.filter_by(email=email).first():
        return jsonify({"erro": "Email já cadastrado"}), 400

    novo_usuario = Usuarios(
        nome=nome.strip(),
        email=email,
        senha=hash_password(senha),
        permissao=permissao,
        status=status,
    )
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({
        "mensagem": "Usuário criado com sucesso",
        "usuario": serializar(novo_usuario),
    }), 201


@admin_bp.route("/dashboard", methods=["GET"])
@apenas_adm
def buscar_dashboard():
    sete_dias_atras = datetime.utcnow() - timedelta(days=7)
    indicadores = db.session.query(
        func.count(Usuarios.id_usuario).label("total_usuarios"),
        func.count(
            case((Usuarios.status == "Ativo", Usuarios.id_usuario))
        ).label("usuarios_ativos"),
        func.count(
            case((Usuarios.status == "Inativo", Usuarios.id_usuario))
        ).label("usuarios_inativos"),
        func.count(
            case((Usuarios.permissao == PERMISSAO_ADM, Usuarios.id_usuario))
        ).label("total_administradores"),
        func.count(
            case((Usuarios.data_cadastro >= sete_dias_atras, Usuarios.id_usuario))
        ).label("novos_ultimos_7_dias"),
    ).one()

    return jsonify({
        "total_usuarios": indicadores.total_usuarios,
        "usuarios_ativos": indicadores.usuarios_ativos,
        "usuarios_inativos": indicadores.usuarios_inativos,
        "total_administradores": indicadores.total_administradores,
        "novos_ultimos_7_dias": indicadores.novos_ultimos_7_dias,
    }), 200
