from datetime import datetime

from flask import Blueprint, current_app, g, jsonify, request
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app import db
from app.models.models import Alternativa, Pergunta, Quiz
from app.utils.decorators import apenas_adm, autenticado, eh_adm

quiz_bp = Blueprint("quiz_bp", __name__)
pergunta_bp = Blueprint("pergunta_bp", __name__)

CORES_PALETA = tuple(f"card-cor-{indice}" for indice in range(1, 7))
CORES_SEED = (
    "card-lgpd",
    "card-letramento",
    "card-seguranca",
    "card-saude",
)


def _id_valido(valor):
    if isinstance(valor, bool):
        return None
    try:
        identificador = int(valor)
    except (TypeError, ValueError):
        return None
    return identificador if identificador > 0 else None


def _validar_alternativas(alternativas):
    if not isinstance(alternativas, list) or len(alternativas) < 2:
        return "Cada pergunta deve ter pelo menos 2 alternativas"

    corretas = 0
    for alternativa in alternativas:
        if not isinstance(alternativa, dict):
            return "Cada alternativa deve ser um objeto válido"
        texto = alternativa.get("texto")
        correta = alternativa.get("correta", False)
        if not isinstance(texto, str) or not texto.strip():
            return "O texto de cada alternativa é obrigatório"
        if not isinstance(correta, bool):
            return "O campo correta deve ser verdadeiro ou falso"
        corretas += int(correta)

    if corretas != 1:
        return "Cada pergunta deve ter exatamente uma alternativa correta"
    return None


def _validar_pergunta(dados):
    if not isinstance(dados, dict):
        return "Cada pergunta deve ser um objeto válido"
    enunciado = dados.get("enunciado")
    if not isinstance(enunciado, str) or not enunciado.strip():
        return "O enunciado da pergunta é obrigatório"
    explicacao = dados.get("explicacao")
    if explicacao is not None and not isinstance(explicacao, str):
        return "A explicação deve ser um texto"
    return _validar_alternativas(dados.get("alternativas"))


def _validar_perguntas(perguntas):
    if not isinstance(perguntas, list):
        return "O campo perguntas deve ser uma lista"
    for pergunta in perguntas:
        erro = _validar_pergunta(pergunta)
        if erro:
            return erro
    return None


def _proxima_cor():
    quantidade = Quiz.query.count()
    return CORES_PALETA[quantidade % len(CORES_PALETA)]


def _serializar_alternativa(alternativa, incluir_correta=False):
    dados = {
        "id": alternativa.id,
        "texto": alternativa.texto,
    }
    if incluir_correta:
        dados["correta"] = alternativa.correta
    return dados


def _serializar_pergunta(pergunta, incluir_correta=False):
    return {
        "id": pergunta.id,
        "id_quiz": pergunta.id_quiz,
        "enunciado": pergunta.enunciado,
        "explicacao": pergunta.explicacao,
        "ordem": pergunta.ordem,
        "alternativas": [
            _serializar_alternativa(alternativa, incluir_correta)
            for alternativa in pergunta.alternativas
        ],
    }


def _serializar_quiz(quiz, incluir_perguntas=False, incluir_correta=False):
    dados = {
        "id": quiz.id,
        "nome": quiz.nome,
        "descricao": quiz.descricao,
        "cor": quiz.cor,
        "quantidade_perguntas": quiz.quantidade_perguntas,
        "quantidade_acessos": quiz.quantidade_acessos,
        "criado_em": (
            quiz.criado_em.isoformat() if isinstance(quiz.criado_em, datetime) else None
        ),
    }
    if incluir_perguntas:
        dados["perguntas"] = [
            _serializar_pergunta(pergunta, incluir_correta)
            for pergunta in quiz.perguntas
        ]
    return dados


def _atualizar_quantidade_perguntas(quiz):
    quiz.quantidade_perguntas = db.session.query(func.count(Pergunta.id)).filter_by(
        id_quiz=quiz.id
    ).scalar()


def _commit():
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"erro": "Os dados violam uma regra de integridade"}), 400
    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception("Não foi possível salvar os dados do quiz")
        return jsonify({"erro": "Não foi possível salvar os dados do quiz"}), 500
    return None


def _flush():
    try:
        db.session.flush()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"erro": "Os dados violam uma regra de integridade"}), 400
    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception("Não foi possível salvar os dados do quiz")
        return jsonify({"erro": "Não foi possível salvar os dados do quiz"}), 500
    return None


def _criar_pergunta(quiz, dados, ordem):
    pergunta = Pergunta(
        quiz=quiz,
        enunciado=dados["enunciado"].strip(),
        explicacao=(dados.get("explicacao") or "").strip() or None,
        ordem=ordem,
        alternativas=[
            Alternativa(texto=item["texto"].strip(), correta=item.get("correta", False))
            for item in dados["alternativas"]
        ],
    )
    db.session.add(pergunta)


@quiz_bp.route("", methods=["GET"])
@autenticado
def listar_quizzes():
    quizzes = Quiz.query.order_by(Quiz.id).all()
    return jsonify([_serializar_quiz(quiz) for quiz in quizzes]), 200


@quiz_bp.route("/<id_quiz>", methods=["GET"])
@autenticado
def obter_quiz(id_quiz):
    id_quiz = _id_valido(id_quiz)
    if id_quiz is None:
        return jsonify({"erro": "ID do quiz inválido"}), 400

    quiz = Quiz.query.get(id_quiz)
    if not quiz:
        return jsonify({"erro": "Quiz não encontrado"}), 404

    incluir_correta = eh_adm(g.usuario_atual)
    return jsonify(
        _serializar_quiz(quiz, incluir_perguntas=True, incluir_correta=incluir_correta)
    ), 200


@quiz_bp.route("", methods=["POST"])
@apenas_adm
def criar_quiz():
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos"}), 400

    nome = dados.get("nome")
    descricao = dados.get("descricao", "")
    perguntas = dados.get("perguntas", [])
    cor = dados.get("cor")

    if not isinstance(nome, str) or not nome.strip():
        return jsonify({"erro": "O nome do quiz é obrigatório"}), 400
    if len(nome.strip()) > 150:
        return jsonify({"erro": "O nome deve ter no máximo 150 caracteres"}), 400
    if not isinstance(descricao, str):
        return jsonify({"erro": "A descrição deve ser um texto"}), 400
    erro = _validar_perguntas(perguntas)
    if erro:
        return jsonify({"erro": erro}), 400
    if cor is not None and cor not in (*CORES_SEED, *CORES_PALETA):
        return jsonify({"erro": "Cor do quiz inválida"}), 400
    if Quiz.query.filter(func.lower(Quiz.nome) == nome.strip().lower()).first():
        return jsonify({"erro": "Já existe um quiz com esse nome"}), 400

    quiz = Quiz(
        nome=nome.strip(),
        descricao=descricao.strip(),
        cor=cor or _proxima_cor(),
    )
    db.session.add(quiz)
    erro_flush = _flush()
    if erro_flush:
        return erro_flush
    for indice, pergunta in enumerate(perguntas, start=1):
        _criar_pergunta(quiz, pergunta, indice)
    erro_flush = _flush()
    if erro_flush:
        return erro_flush
    _atualizar_quantidade_perguntas(quiz)

    erro_commit = _commit()
    if erro_commit:
        return erro_commit
    return jsonify(_serializar_quiz(quiz, incluir_perguntas=True, incluir_correta=True)), 201


@quiz_bp.route("/<id_quiz>", methods=["PUT"])
@apenas_adm
def editar_quiz(id_quiz):
    id_quiz = _id_valido(id_quiz)
    if id_quiz is None:
        return jsonify({"erro": "ID do quiz inválido"}), 400
    quiz = Quiz.query.get(id_quiz)
    if not quiz:
        return jsonify({"erro": "Quiz não encontrado"}), 404

    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos"}), 400
    if "nome" in dados:
        nome = dados["nome"]
        if not isinstance(nome, str) or not nome.strip():
            return jsonify({"erro": "O nome do quiz é obrigatório"}), 400
        if len(nome.strip()) > 150:
            return jsonify({"erro": "O nome deve ter no máximo 150 caracteres"}), 400
        duplicado = Quiz.query.filter(
            func.lower(Quiz.nome) == nome.strip().lower(),
            Quiz.id != quiz.id,
        ).first()
        if duplicado:
            return jsonify({"erro": "Já existe um quiz com esse nome"}), 400
        quiz.nome = nome.strip()
    if "descricao" in dados:
        if not isinstance(dados["descricao"], str):
            return jsonify({"erro": "A descrição deve ser um texto"}), 400
        quiz.descricao = dados["descricao"].strip()

    erro_commit = _commit()
    if erro_commit:
        return erro_commit
    return jsonify(_serializar_quiz(quiz)), 200


@quiz_bp.route("/<id_quiz>", methods=["DELETE"])
@apenas_adm
def excluir_quiz(id_quiz):
    id_quiz = _id_valido(id_quiz)
    if id_quiz is None:
        return jsonify({"erro": "ID do quiz inválido"}), 400
    quiz = Quiz.query.get(id_quiz)
    if not quiz:
        return jsonify({"erro": "Quiz não encontrado"}), 404

    db.session.delete(quiz)
    erro_commit = _commit()
    if erro_commit:
        return erro_commit
    return jsonify({"mensagem": "Quiz removido com sucesso"}), 200


@quiz_bp.route("/<id_quiz>/perguntas", methods=["POST"])
@apenas_adm
def adicionar_pergunta(id_quiz):
    id_quiz = _id_valido(id_quiz)
    if id_quiz is None:
        return jsonify({"erro": "ID do quiz inválido"}), 400
    quiz = Quiz.query.get(id_quiz)
    if not quiz:
        return jsonify({"erro": "Quiz não encontrado"}), 404

    dados = request.get_json(silent=True)
    erro = _validar_pergunta(dados)
    if erro:
        return jsonify({"erro": erro}), 400
    ordem = dados.get("ordem")
    if ordem is None:
        ordem = db.session.query(func.max(Pergunta.ordem)).filter_by(
            id_quiz=quiz.id
        ).scalar() or 0
        ordem += 1
    elif isinstance(ordem, bool) or not isinstance(ordem, int) or ordem < 1:
        return jsonify({"erro": "A ordem deve ser um inteiro positivo"}), 400

    _criar_pergunta(quiz, dados, ordem)
    erro_flush = _flush()
    if erro_flush:
        return erro_flush
    _atualizar_quantidade_perguntas(quiz)
    erro_commit = _commit()
    if erro_commit:
        return erro_commit
    return jsonify(_serializar_pergunta(quiz.perguntas[-1], incluir_correta=True)), 201


@pergunta_bp.route("/perguntas/<id_pergunta>", methods=["PUT"])
@apenas_adm
def editar_pergunta(id_pergunta):
    id_pergunta = _id_valido(id_pergunta)
    if id_pergunta is None:
        return jsonify({"erro": "ID da pergunta inválido"}), 400
    pergunta = Pergunta.query.get(id_pergunta)
    if not pergunta:
        return jsonify({"erro": "Pergunta não encontrada"}), 404

    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos"}), 400
    if "enunciado" in dados:
        enunciado = dados["enunciado"]
        if not isinstance(enunciado, str) or not enunciado.strip():
            return jsonify({"erro": "O enunciado da pergunta é obrigatório"}), 400
        pergunta.enunciado = enunciado.strip()
    if "explicacao" in dados:
        explicacao = dados["explicacao"]
        if explicacao is not None and not isinstance(explicacao, str):
            return jsonify({"erro": "A explicação deve ser um texto"}), 400
        pergunta.explicacao = explicacao.strip() or None if explicacao else None
    if "alternativas" in dados:
        erro = _validar_alternativas(dados["alternativas"])
        if erro:
            return jsonify({"erro": erro}), 400
        pergunta.alternativas = [
            Alternativa(texto=item["texto"].strip(), correta=item["correta"])
            for item in dados["alternativas"]
        ]

    erro_commit = _commit()
    if erro_commit:
        return erro_commit
    return jsonify(_serializar_pergunta(pergunta, incluir_correta=True)), 200


@pergunta_bp.route("/perguntas/<id_pergunta>", methods=["DELETE"])
@apenas_adm
def excluir_pergunta(id_pergunta):
    id_pergunta = _id_valido(id_pergunta)
    if id_pergunta is None:
        return jsonify({"erro": "ID da pergunta inválido"}), 400
    pergunta = Pergunta.query.get(id_pergunta)
    if not pergunta:
        return jsonify({"erro": "Pergunta não encontrada"}), 404
    quiz = pergunta.quiz
    db.session.delete(pergunta)
    erro_flush = _flush()
    if erro_flush:
        return erro_flush
    _atualizar_quantidade_perguntas(quiz)
    erro_commit = _commit()
    if erro_commit:
        return erro_commit
    return jsonify({"mensagem": "Pergunta removida com sucesso"}), 200


@quiz_bp.route("/<id_quiz>/acesso", methods=["POST"])
@autenticado
def registrar_acesso(id_quiz):
    id_quiz = _id_valido(id_quiz)
    if id_quiz is None:
        return jsonify({"erro": "ID do quiz inválido"}), 400
    quiz = Quiz.query.get(id_quiz)
    if not quiz:
        return jsonify({"erro": "Quiz não encontrado"}), 404

    db.session.query(Quiz).filter_by(id=id_quiz).update(
        {Quiz.quantidade_acessos: Quiz.quantidade_acessos + 1},
        synchronize_session=False,
    )
    erro_commit = _commit()
    if erro_commit:
        return erro_commit
    db.session.refresh(quiz)
    return jsonify({"id": quiz.id, "quantidade_acessos": quiz.quantidade_acessos}), 200


@quiz_bp.route("/<id_quiz>/admin", methods=["GET"])
@apenas_adm
def obter_quiz_admin(id_quiz):
    id_quiz = _id_valido(id_quiz)
    if id_quiz is None:
        return jsonify({"erro": "ID do quiz inválido"}), 400
    quiz = Quiz.query.get(id_quiz)
    if not quiz:
        return jsonify({"erro": "Quiz não encontrado"}), 404
    return jsonify(_serializar_quiz(quiz, incluir_perguntas=True, incluir_correta=True)), 200


@quiz_bp.route("/<id_quiz>/responder", methods=["POST"])
@autenticado
def responder_pergunta(id_quiz):
    id_quiz = _id_valido(id_quiz)
    if id_quiz is None:
        return jsonify({"erro": "ID do quiz inválido"}), 400
    quiz = Quiz.query.get(id_quiz)
    if not quiz:
        return jsonify({"erro": "Quiz não encontrado"}), 404

    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos"}), 400
    id_pergunta = _id_valido(dados.get("id_pergunta"))
    id_alternativa = _id_valido(dados.get("id_alternativa"))
    if id_pergunta is None or id_alternativa is None:
        return jsonify({"erro": "Informe IDs válidos para pergunta e alternativa"}), 400

    pergunta = Pergunta.query.filter_by(id=id_pergunta, id_quiz=quiz.id).first()
    if not pergunta:
        return jsonify({"erro": "Pergunta não encontrada neste quiz"}), 404
    alternativa = Alternativa.query.filter_by(
        id=id_alternativa,
        id_pergunta=pergunta.id,
    ).first()
    if not alternativa:
        return jsonify({"erro": "Alternativa não encontrada nesta pergunta"}), 404

    correta = next(item for item in pergunta.alternativas if item.correta)
    return jsonify({
        "acertou": alternativa.id == correta.id,
        "alternativa_correta": {
            "id": correta.id,
            "texto": correta.texto,
        },
        "explicacao": pergunta.explicacao,
    }), 200
