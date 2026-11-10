from flask import Blueprint, g, jsonify, request

from app import db
from app.models.models import ProgressoQuiz
from app.utils.decorators import autenticado

progresso_quiz_bp = Blueprint("progresso_quiz_bp", __name__)

STATUS_VALIDOS = ("nao_iniciado", "em_andamento", "concluido")


def _id_quiz_valido(valor):
    try:
        id_quiz = int(valor)
    except (TypeError, ValueError):
        return None
    return id_quiz if id_quiz > 0 else None


def _serializar(progresso):
    return {
        "id_progresso": progresso.id_progresso,
        "id_usuario": progresso.id_usuario,
        "id_quiz": progresso.id_quiz,
        "status": progresso.status,
        "progresso": progresso.progresso,
        "acertos": progresso.acertos,
        "total_perguntas": progresso.total_perguntas,
        "atualizado": (
            progresso.atualizado.strftime("%Y-%m-%d %H:%M:%S")
            if progresso.atualizado
            else None
        ),
    }


def _progresso_inicial(id_usuario, id_quiz):
    return {
        "id_progresso": None,
        "id_usuario": id_usuario,
        "id_quiz": id_quiz,
        "status": "nao_iniciado",
        "progresso": 0,
        "acertos": 0,
        "total_perguntas": 0,
        "atualizado": None,
    }


@progresso_quiz_bp.route("", methods=["GET"])
@autenticado
def listar_progresso():
    progressos = (
        ProgressoQuiz.query.filter_by(id_usuario=g.usuario_atual.id_usuario)
        .order_by(ProgressoQuiz.id_quiz)
        .all()
    )
    return jsonify([_serializar(item) for item in progressos]), 200


@progresso_quiz_bp.route("/<id_quiz>", methods=["GET"])
@autenticado
def obter_progresso(id_quiz):
    id_quiz = _id_quiz_valido(id_quiz)
    if id_quiz is None:
        return jsonify({"erro": "ID do quiz inválido"}), 400

    usuario = g.usuario_atual
    progresso = ProgressoQuiz.query.filter_by(
        id_usuario=usuario.id_usuario,
        id_quiz=id_quiz,
    ).first()
    if not progresso:
        return jsonify(_progresso_inicial(usuario.id_usuario, id_quiz)), 200
    return jsonify(_serializar(progresso)), 200


@progresso_quiz_bp.route("/<id_quiz>", methods=["POST", "PUT"])
@autenticado
def salvar_progresso(id_quiz):
    id_quiz = _id_quiz_valido(id_quiz)
    if id_quiz is None:
        return jsonify({"erro": "ID do quiz inválido"}), 400

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"erro": "Dados inválidos"}), 400

    status = data.get("status")
    progresso_valor = data.get("progresso")
    acertos = data.get("acertos")
    total_perguntas = data.get("total_perguntas")

    if status not in STATUS_VALIDOS:
        return jsonify({"erro": "Status inválido"}), 400
    if (
        isinstance(progresso_valor, bool)
        or not isinstance(progresso_valor, int)
        or not 0 <= progresso_valor <= 100
    ):
        return jsonify({"erro": "Progresso deve ser um inteiro entre 0 e 100"}), 400
    if (
        isinstance(acertos, bool)
        or not isinstance(acertos, int)
        or isinstance(total_perguntas, bool)
        or not isinstance(total_perguntas, int)
        or acertos > total_perguntas
    ):
        return jsonify({"erro": "Acertos e total de perguntas inválidos"}), 400

    if progresso_valor == 100 or (
        total_perguntas > 0 and acertos == total_perguntas
    ):
        status = "concluido"

    usuario = g.usuario_atual
    progresso = ProgressoQuiz.query.filter_by(
        id_usuario=usuario.id_usuario,
        id_quiz=id_quiz,
    ).first()
    if not progresso:
        progresso = ProgressoQuiz(
            id_usuario=usuario.id_usuario,
            id_quiz=id_quiz,
        )
        db.session.add(progresso)

    progresso.status = status
    progresso.progresso = progresso_valor
    progresso.acertos = acertos
    progresso.total_perguntas = total_perguntas
    db.session.commit()

    return jsonify(_serializar(progresso)), 200
