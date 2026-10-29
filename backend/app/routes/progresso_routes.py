from datetime import datetime, timezone

from flask import Blueprint, g, jsonify, request
from sqlalchemy.exc import IntegrityError

from app import db
from app.models.models import ProgressoQuiz
from app.utils.decorators import autenticado

progresso_bp = Blueprint('progresso_bp', __name__)


def _agora_utc():
    return datetime.now(timezone.utc)


def _iso_utc(dt):
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt.strftime('%Y-%m-%dT%H:%M:%SZ')


def _serializar(registro):
    return {
        'id_quiz': registro.id_quiz,
        'status': registro.status,
        'progresso': registro.progresso,
        'acertos': registro.acertos,
        'total_perguntas': registro.total_perguntas,
        'atualizado_em': _iso_utc(registro.atualizado_em),
    }


def _eh_id_quiz_valido(valor):
    return (
        isinstance(valor, str)
        and 1 <= len(valor) <= 50
        and all(caractere.islower() or caractere.isdigit() or caractere == '-' for caractere in valor)
    )


@progresso_bp.route('/', methods=['GET'])
@autenticado
def listar_progresso():
    registros = (
        ProgressoQuiz.query
        .filter_by(id_usuario=g.usuario_atual.id_usuario)
        .order_by(ProgressoQuiz.atualizado_em.desc(), ProgressoQuiz.id_progresso.desc())
        .all()
    )

    return jsonify([_serializar(registro) for registro in registros]), 200


@progresso_bp.route('/<id_quiz>', methods=['PUT'])
@autenticado
def salvar_progresso(id_quiz):
    if not _eh_id_quiz_valido(id_quiz):
        return jsonify({'erro': 'id_quiz inválido'}), 400

    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({'erro': 'O corpo da requisição deve ser um objeto JSON'}), 400

    status = dados.get('status')
    progresso = dados.get('progresso')
    acertos = dados.get('acertos')
    total_perguntas = dados.get('total_perguntas')

    if status not in ('andamento', 'concluido'):
        return jsonify({'erro': 'status inválido'}), 400

    if type(progresso) is not int or isinstance(progresso, bool) or not 0 <= progresso <= 100:
        return jsonify({'erro': 'progresso deve ser um inteiro entre 0 e 100'}), 400

    if type(acertos) is not int or isinstance(acertos, bool) or acertos < 0:
        return jsonify({'erro': 'acertos deve ser um inteiro maior ou igual a 0'}), 400

    if type(total_perguntas) is not int or isinstance(total_perguntas, bool) or total_perguntas < 0:
        return jsonify({'erro': 'total_perguntas deve ser um inteiro maior ou igual a 0'}), 400

    if acertos > total_perguntas:
        return jsonify({'erro': 'acertos não pode ser maior que total_perguntas'}), 400

    usuario_id = g.usuario_atual.id_usuario
    agora = _agora_utc()

    registro = ProgressoQuiz.query.filter_by(id_usuario=usuario_id, id_quiz=id_quiz).first()
    if registro and registro.status == 'concluido' and status == 'andamento':
        registro.atualizado_em = agora
        db.session.commit()
        return jsonify(_serializar(registro)), 200

    try:
        if registro is None:
            registro = ProgressoQuiz(
                id_usuario=usuario_id,
                id_quiz=id_quiz,
                status=status,
                progresso=progresso,
                acertos=acertos,
                total_perguntas=total_perguntas,
                atualizado_em=agora,
            )
            db.session.add(registro)
        else:
            registro.status = status
            registro.progresso = progresso
            registro.acertos = acertos
            registro.total_perguntas = total_perguntas
            registro.atualizado_em = agora

        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        registro = ProgressoQuiz.query.filter_by(id_usuario=usuario_id, id_quiz=id_quiz).first()
        if registro is None:
            registro = ProgressoQuiz(
                id_usuario=usuario_id,
                id_quiz=id_quiz,
                status=status,
                progresso=progresso,
                acertos=acertos,
                total_perguntas=total_perguntas,
                atualizado_em=agora,
            )
            db.session.add(registro)
        else:
            if registro.status == 'concluido' and status == 'andamento':
                registro.atualizado_em = agora
            else:
                registro.status = status
                registro.progresso = progresso
                registro.acertos = acertos
                registro.total_perguntas = total_perguntas
                registro.atualizado_em = agora
        db.session.commit()

    return jsonify(_serializar(registro)), 200
