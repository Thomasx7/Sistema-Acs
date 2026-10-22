from flask import Blueprint, request, jsonify, g

from app import db
from app.models.models import Usuarios
from app.utils.decorators import autenticado, apenas_adm, eh_adm
from app.utils.hash import hash_password, check_password
from app.utils.validators import normalizar_email, validar_email, validar_senha

user_bp = Blueprint('user_bp', __name__)

PERMISSOES = ("Adm", "Comum")
STATUS = ("Ativo", "Inativo")
NOME_MAX = 100  


def serializar(usuario):
    return {
        'id_usuario': usuario.id_usuario,
        'nome': usuario.nome,
        'email': usuario.email,
        'permissao': usuario.permissao,
        'status': usuario.status,
        'data_cadastro': usuario.data_cadastro.strftime('%Y-%m-%d %H:%M:%S')
    }


def validar_nome(nome):
    """Retorna a mensagem de erro, ou None se o nome for válido."""
    if not isinstance(nome, str) or not nome.strip():
        return "Nome é obrigatório"
    if len(nome.strip()) > NOME_MAX:
        return f"O nome deve ter no máximo {NOME_MAX} caracteres"
    return None


# TODO LISTAR TODOS OS USUÁRIOS (só Adm)
@user_bp.route('/', methods=['GET'])
@apenas_adm
def get_users():
    usuarios = Usuarios.query.order_by(Usuarios.id_usuario).all()
    return jsonify([serializar(user) for user in usuarios]), 200


# TODO BUSCAR UM USUÁRIO POR ID (Adm ou o próprio usuário)
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


# TODO EDITAR UM USUÁRIO (Adm ou o próprio usuário)
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

    # Permissão e status: só Adm, e nunca nos próprios dados
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


# TODO DELETAR UM USUÁRIO (só Adm)
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