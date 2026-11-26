from flask import Blueprint, jsonify
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app import db


health_bp = Blueprint("health_bp", __name__)


@health_bp.get("/health")
def verificar_saude():
    try:
        db.session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"status": "indisponivel"}), 503

    return jsonify({"status": "ok"}), 200
