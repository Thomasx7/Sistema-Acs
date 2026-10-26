from datetime import datetime, timedelta

from flask import Blueprint, jsonify
from sqlalchemy import case, func

from app import db
from app.models.models import Usuarios
from app.utils.decorators import apenas_adm
from app.utils.permissoes import PERMISSAO_ADM

admin_bp = Blueprint("admin_bp", __name__)


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
