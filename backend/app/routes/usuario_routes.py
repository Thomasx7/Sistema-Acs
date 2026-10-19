from flask import Blueprint, request, jsonify
from app import db
from app.models.models import Usuarios
from app.utils.hash import hash_password

user_bp = Blueprint('user_bp', __name__)

# TODO LISTAR TODOS OS USUÁRIOS
@user_bp.route('/', methods=['GET'])
def get_users():
    usuarios = Usuarios.query.order_by(Usuarios.id_usuario).all()
    output = []
    for user in usuarios:
        output.append({
            'id_usuario': user.id_usuario,
            'nome': user.nome,
            'email': user.email,
            'permissao': user.permissao,
            'status': user.status,
            'data_cadastro': user.data_cadastro.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    response = jsonify(output)
    return response, 200

# TODO BUSCAR UM USUÁRIO POR ID
@user_bp.route('/<int:id_usuario>', methods=['GET'])
def get_user_by_id(id_usuario):

    usuario = Usuarios.query.get(id_usuario)

    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado"
        }), 404
        
    return jsonify({
        'id_usuario': usuario.id_usuario,
        'nome': usuario.nome,
        'email': usuario.email,
        'permissao': usuario.permissao,
        'status': usuario.status,
        'data_cadastro': usuario.data_cadastro.strftime('%Y-%m-%d %H:%M:%S')
    }), 200
    
#TODO CRIA UM USUÁRIO
@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.json
    
    # Verifica se os campos estão preenchido
    if not data.get("nome") or not data.get("email") or not data.get("senha"):
        return jsonify({"erro": "Campos obrigatórios faltando"}), 400
    
    # verifica se já existe email
    usuario_existente = Usuarios.query.filter_by(email=data["email"]).first()
    if usuario_existente:
        return jsonify({"erro": "Email já cadastrado"}), 400

    # Hash da senha
    senha_hash = hash_password(data["senha"])

    # Cria o novo usuário
    novo_usuario = Usuarios(
        nome=data["nome"],
        email=data["email"],
        senha=senha_hash
    )

    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({
        "mensagem": "Usuário criado com sucesso",
        "id_usuario": novo_usuario.id_usuario
    }), 201
    

# TODO EDITAR UM USUÁRIO
@user_bp.route('/<int:id_usuario>', methods=['PUT'])
def update_user(id_usuario):

    data = request.json

    # Procura o usuário pelo ID
    usuario = Usuarios.query.get(id_usuario)

    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado"
        }), 404

    # Verifica se o email está sendo alterado
    if "email" in data and data["email"] != usuario.email:

        usuario_existente = Usuarios.query.filter_by(
            email=data["email"]
        ).first()

        if usuario_existente:
            return jsonify({
                "erro": "Email já cadastrado"
            }), 400
            
    # Atualiza os campos do usuário
    usuario.nome = data.get("nome", usuario.nome)
    usuario.email = data.get("email", usuario.email)
    usuario.permissao = data.get("permissao", usuario.permissao)
    usuario.status = data.get("status", usuario.status)
    senha = data.get("senha")
    if senha:
        usuario.senha = hash_password(senha)
    
    db.session.commit()

    return jsonify({
        "mensagem": "Usuário atualizado com sucesso"
    }), 200
    
# TODO DELETAR UM USUÁRIO
@user_bp.route('/<int:id_usuario>', methods=['DELETE'])
def delete_user(id_usuario):

    # Procura o usuário pelo ID
    usuario = Usuarios.query.get(id_usuario)

    # Verifica se o usuário existe
    if not usuario:
        return jsonify({
            "erro": "Usuário não encontrado"
        }), 404

    # Remove o usuário
    db.session.delete(usuario)
    db.session.commit()

    return jsonify({
        "mensagem": "Usuário excluído com sucesso"
    }), 200