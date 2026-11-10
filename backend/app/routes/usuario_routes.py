from pathlib import Path
from uuid import uuid4

from flask import Blueprint, request, jsonify, g, current_app

from app import db
from app.models.models import Usuarios
from app.utils.decorators import autenticado, apenas_adm, eh_adm
from app.utils.foto_perfil import PASTA_FOTOS_PERFIL, excluir_foto_perfil
from app.utils.hash import hash_password, check_password
from app.utils.permissoes import PERMISSAO_ADM, PERMISSAO_COMUM
from app.utils.validators import normalizar_email, validar_email, validar_senha
from sqlalchemy.exc import SQLAlchemyError

user_bp = Blueprint('user_bp', __name__)

PERMISSOES = (PERMISSAO_ADM, PERMISSAO_COMUM)
STATUS = ("Ativo", "Inativo")
NOME_MAX = 100  
TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024
EXTENSOES_FOTO = {".png", ".jpg", ".jpeg", ".webp"}


def serializar(usuario):
    return {
        'id_usuario': usuario.id_usuario,
        'nome': usuario.nome,
        'email': usuario.email,
        'permissao': usuario.permissao,
        'status': usuario.status,
        'foto_perfil': usuario.foto_perfil,
        'data_cadastro': usuario.data_cadastro.strftime('%Y-%m-%d %H:%M:%S')
    }


def validar_nome(nome):
    """Retorna a mensagem de erro, ou None se o nome for válido."""
    if not isinstance(nome, str) or not nome.strip():
        return "Nome é obrigatório"
    if len(nome.strip()) > NOME_MAX:
        return f"O nome deve ter no máximo {NOME_MAX} caracteres"
    return None


def detectar_formato_foto(conteudo):
    if conteudo.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if conteudo.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if (
        len(conteudo) >= 12
        and conteudo[:4] == b"RIFF"
        and conteudo[8:12] == b"WEBP"
    ):
        return "webp"
    return None


@user_bp.route('/foto-perfil', methods=['POST'])
@autenticado
def salvar_foto_perfil():
    arquivo = request.files.get("foto")
    if not arquivo or not arquivo.filename:
        return jsonify({"erro": "Envie uma imagem no campo foto"}), 400

    extensao = Path(arquivo.filename).suffix.lower()
    if extensao not in EXTENSOES_FOTO:
        return jsonify({"erro": "Formato inválido. Use PNG, JPG, JPEG ou WEBP"}), 400

    conteudo = arquivo.stream.read(TAMANHO_MAXIMO_FOTO + 1)
    if not conteudo:
        return jsonify({"erro": "O arquivo de imagem está vazio"}), 400
    if len(conteudo) > TAMANHO_MAXIMO_FOTO:
        return jsonify({"erro": "A imagem deve ter no máximo 2 MB"}), 413

    formato = detectar_formato_foto(conteudo)
    extensao_compativel = (
        (formato == "png" and extensao == ".png")
        or (formato == "jpeg" and extensao in {".jpg", ".jpeg"})
        or (formato == "webp" and extensao == ".webp")
    )
    if not extensao_compativel:
        return jsonify({
            "erro": "O conteúdo não corresponde a uma imagem PNG, JPG, JPEG ou WEBP válida"
        }), 400

    usuario = g.usuario_atual
    foto_anterior = usuario.foto_perfil
    nome_arquivo = f"{uuid4().hex}{extensao}"
    caminho_novo = PASTA_FOTOS_PERFIL / nome_arquivo
    caminho_relativo = f"uploads/perfil/{nome_arquivo}"

    try:
        PASTA_FOTOS_PERFIL.mkdir(parents=True, exist_ok=True)
        caminho_novo.write_bytes(conteudo)
    except OSError:
        db.session.rollback()
        current_app.logger.exception("Não foi possível gravar a foto de perfil")
        return jsonify({"erro": "Não foi possível salvar a foto de perfil"}), 500

    usuario.foto_perfil = caminho_relativo
    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        try:
            caminho_novo.unlink()
        except FileNotFoundError:
            pass
        except OSError:
            current_app.logger.exception("Não foi possível remover a foto não confirmada")
        current_app.logger.exception("Não foi possível atualizar a foto de perfil no banco")
        return jsonify({"erro": "Não foi possível salvar a foto de perfil"}), 500

    try:
        excluir_foto_perfil(foto_anterior)
    except OSError:
        current_app.logger.exception("Não foi possível remover a foto de perfil anterior")
        return jsonify({
            "erro": "A foto foi atualizada, mas não foi possível remover a foto anterior"
        }), 500

    return jsonify({
        "mensagem": "Foto de perfil atualizada com sucesso",
        "usuario": serializar(usuario),
    }), 200


@user_bp.route('/foto-perfil', methods=['DELETE'])
@autenticado
def remover_foto_perfil():
    usuario = g.usuario_atual
    foto_anterior = usuario.foto_perfil
    usuario.foto_perfil = None

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        current_app.logger.exception("Não foi possível remover a foto de perfil do banco")
        return jsonify({"erro": "Não foi possível remover a foto de perfil"}), 500

    try:
        excluir_foto_perfil(foto_anterior)
    except OSError:
        current_app.logger.exception("Não foi possível excluir o arquivo da foto de perfil")
        return jsonify({
            "erro": "A foto foi removida do perfil, mas não foi possível excluir o arquivo"
        }), 500

    return jsonify({
        "mensagem": "Foto de perfil removida com sucesso",
        "usuario": serializar(usuario),
    }), 200


# TODO LISTAR TODOS OS USUÁRIOS (só administradores)
@user_bp.route('/', methods=['GET'])
@apenas_adm
def get_users():
    usuarios = Usuarios.query.order_by(Usuarios.id_usuario).all()
    return jsonify([serializar(user) for user in usuarios]), 200


# TODO BUSCAR UM USUÁRIO POR ID (administrador ou o próprio usuário)
@user_bp.route('/<int:id_usuario>', methods=['GET'])
@autenticado
def get_user_by_id(id_usuario):
    logado = g.usuario_atual

    if not eh_adm(logado) and logado.id_usuario != id_usuario:
        return jsonify({"erro": "Acesso negado"}), 403

    usuario = Usuarios.query.get(id_usuario)

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    return jsonify(serializar(usuario)), 200


# TODO CRIA UM USUÁRIO (público: é o cadastro)
@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json(silent=True) or {}

    nome = data.get("nome")
    email = data.get("email")
    senha = data.get("senha")

    # Verifica se os campos estão preenchidos (e são texto)
    if not all(isinstance(campo, str) and campo.strip() for campo in (nome, email, senha)):
        return jsonify({"erro": "Campos obrigatórios faltando"}), 400

    email = normalizar_email(email)

    # Valida nome, formato do email e tamanho da senha
    erro = validar_nome(nome) or validar_email(email) or validar_senha(senha)
    if erro:
        return jsonify({"erro": erro}), 400

    # Verifica se já existe email
    if Usuarios.query.filter_by(email=email).first():
        return jsonify({"erro": "Email já cadastrado"}), 400

    # Cria o novo usuário (permissão e status ficam nos valores padrão)
    novo_usuario = Usuarios(
        nome=nome.strip(),
        email=email,
        senha=hash_password(senha)
    )

    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({
        "mensagem": "Usuário criado com sucesso",
        "id_usuario": novo_usuario.id_usuario
    }), 201


# TODO EDITAR UM USUÁRIO (administrador ou o próprio usuário)
@user_bp.route('/<int:id_usuario>', methods=['PUT'])
@autenticado
def update_user(id_usuario):
    logado = g.usuario_atual
    adm = eh_adm(logado)
    editando_a_si_mesmo = logado.id_usuario == id_usuario

    # Usuário comum só mexe nos próprios dados
    if not adm and not editando_a_si_mesmo:
        return jsonify({"erro": "Acesso negado"}), 403

    usuario = logado if editando_a_si_mesmo else Usuarios.query.get(id_usuario)
    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    data = request.get_json(silent=True) or {}
    mudancas = {}

    # Nome 
    if "nome" in data:
        erro = validar_nome(data["nome"])
        if erro:
            return jsonify({"erro": erro}), 400
        mudancas["nome"] = data["nome"].strip()

    # Email 
    if "email" in data:
        if not isinstance(data["email"], str):
            return jsonify({"erro": "Email inválido"}), 400

        novo_email = normalizar_email(data["email"])
        erro = validar_email(novo_email)
        if erro:
            return jsonify({"erro": erro}), 400

        if novo_email != usuario.email:
            if Usuarios.query.filter_by(email=novo_email).first():
                return jsonify({"erro": "Email já cadastrado"}), 400
            mudancas["email"] = novo_email

    # Permissão e status: só administradores, e nunca nos próprios dados
    for campo, validos in (("permissao", PERMISSOES), ("status", STATUS)):
        if campo not in data or data[campo] == getattr(usuario, campo):
            continue  # não enviou, ou enviou o mesmo valor: nada a fazer

        if not adm:
            return jsonify({
                "erro": "Apenas administradores podem alterar permissão ou status"
            }), 403

        if data[campo] not in validos:
            return jsonify({"erro": f"Valor inválido para {campo}"}), 400

        if editando_a_si_mesmo:
            return jsonify({
                "erro": "Você não pode alterar a sua própria permissão ou status"
            }), 403

        mudancas[campo] = data[campo]

    #Senha 
    senha = data.get("senha")
    if senha:
        if not isinstance(senha, str):
            return jsonify({"erro": "Senha inválida"}), 400

        erro = validar_senha(senha)
        if erro:
            return jsonify({"erro": erro}), 400

        # Para trocar a PRÓPRIA senha, é preciso confirmar a senha atual.
        # (Retorna 400, não 401, para o front não encerrar a sessão.)
        if editando_a_si_mesmo:
            senha_atual = data.get("senha_atual")
            if not isinstance(senha_atual, str) or not check_password(senha_atual, usuario.senha):
                return jsonify({"erro": "Senha atual incorreta"}), 400

        mudancas["senha"] = hash_password(senha)

    # Tudo validado: aplica e salva
    for campo, valor in mudancas.items():
        setattr(usuario, campo, valor)

    db.session.commit()

    return jsonify({
        "mensagem": "Usuário atualizado com sucesso",
        "usuario": serializar(usuario)
    }), 200


# TODO DELETAR UM USUÁRIO (só administradores)
@user_bp.route('/<int:id_usuario>', methods=['DELETE'])
@apenas_adm
def delete_user(id_usuario):
    if g.usuario_atual.id_usuario == id_usuario:
        return jsonify({"erro": "Você não pode excluir a sua própria conta"}), 400

    usuario = Usuarios.query.get(id_usuario)

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    db.session.delete(usuario)
    db.session.commit()

    return jsonify({"mensagem": "Usuário excluído com sucesso"}), 200