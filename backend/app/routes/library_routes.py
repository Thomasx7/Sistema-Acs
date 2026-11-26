import re
from datetime import datetime
from urllib.parse import urlparse

from flask import Blueprint, current_app, g, jsonify, request
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app import db
from app.models.models import LibraryCategory, LibraryMaterial
from app.services.library_storage import (
    remover_arquivo,
    calcular_checksum,
    enviar_arquivo,
    salvar_arquivo,
    validar_arquivo,
)
from app.utils.decorators import apenas_adm, autenticado


library_bp = Blueprint("library_bp", __name__)

TIPOS_MATERIAIS = {
    "PDF", "WORD", "EXCEL", "POWERPOINT", "IMAGE", "VIDEO",
    "AUDIO", "LINK", "YOUTUBE", "OTHER",
}


def gerar_slug(nome):
    slug = (
        nome.strip().lower()
        .replace("ã", "a").replace("á", "a").replace("à", "a")
        .replace("â", "a").replace("é", "e").replace("ê", "e")
        .replace("í", "i").replace("ó", "o").replace("ô", "o")
        .replace("õ", "o").replace("ú", "u").replace("ç", "c")
    )
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    return slug or "categoria"


def slug_unico(nome, ignorar_id=None):
    base = gerar_slug(nome)
    slug = base
    numero = 2
    while True:
        consulta = LibraryCategory.query.filter(func.lower(LibraryCategory.slug) == slug.lower())
        if ignorar_id:
            consulta = consulta.filter(LibraryCategory.id != ignorar_id)
        if not consulta.first():
            return slug
        slug = f"{base}-{numero}"
        numero += 1


def validar_url(valor, youtube=False):
    if not isinstance(valor, str) or not valor.strip():
        return None, "Informe uma URL válida."
    url = valor.strip()
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return None, "A URL deve começar com http:// ou https://."
    if youtube:
        video_id = extrair_youtube_id(url)
        if not video_id:
            return None, "Informe uma URL válida do YouTube."
        return f"https://www.youtube.com/watch?v={video_id}", None
    return url, None


def extrair_youtube_id(url):
    parsed = urlparse(url)
    host = parsed.netloc.lower().replace("www.", "")
    if host == "youtu.be":
        return parsed.path.lstrip("/").split("/")[0] or None
    if host in ("youtube.com", "m.youtube.com", "music.youtube.com"):
        if parsed.path == "/watch":
            match = re.search(r"(?:^|&)v=([^&]+)", parsed.query)
            return match.group(1) if match else None
        match = re.match(r"/(?:embed|shorts)/([A-Za-z0-9_-]+)", parsed.path)
        if match:
            return match.group(1)
    return None


def serializar_categoria(categoria):
    quantidade = db.session.query(func.count(LibraryMaterial.id)).filter(
        LibraryMaterial.category_id == categoria.id,
        LibraryMaterial.is_published.is_(True),
    ).scalar()
    return {
        "id": categoria.id,
        "name": categoria.name,
        "slug": categoria.slug,
        "description": categoria.description,
        "icon": categoria.icon,
        "color": categoria.color,
        "position": categoria.position,
        "is_active": categoria.is_active,
        "material_count": quantidade or 0,
    }


def serializar_material(material):
    return {
        "id": material.id,
        "category_id": material.category_id,
        "title": material.title,
        "description": material.description,
        "type": material.type,
        "url": material.url,
        "original_filename": material.original_filename,
        "mime_type": material.mime_type,
        "size_bytes": material.size_bytes,
        "thumbnail_path": material.thumbnail_path,
        "tags": material.tags,
        "position": material.position,
        "is_published": material.is_published,
        "created_at": material.created_at.isoformat() if isinstance(material.created_at, datetime) else None,
        "updated_at": material.updated_at.isoformat() if isinstance(material.updated_at, datetime) else None,
    }


def dados_do_corpo():
    if request.content_type and request.content_type.startswith("multipart/form-data"):
        return request.form.to_dict(flat=True)
    return request.get_json(silent=True) or {}


def commit_ou_erro(mensagem):
    try:
        db.session.commit()
        return None
    except IntegrityError:
        db.session.rollback()
        return jsonify({"erro": "Os dados informados já existem ou violam uma regra."}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": mensagem}), 500


@library_bp.route("/categories", methods=["GET"])
@autenticado
def listar_categorias():
    categorias = LibraryCategory.query.filter_by(is_active=True).order_by(
        LibraryCategory.position, LibraryCategory.name
    ).all()
    return jsonify([serializar_categoria(categoria) for categoria in categorias]), 200


@library_bp.route("/categories", methods=["POST"])
@apenas_adm
def criar_categoria():
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos."}), 400
    nome = (dados.get("name") or "").strip()
    if not nome:
        return jsonify({"erro": "O nome da categoria é obrigatório."}), 400
    if len(nome) > 150:
        return jsonify({"erro": "O nome deve ter no máximo 150 caracteres."}), 400
    if LibraryCategory.query.filter(func.lower(LibraryCategory.name) == nome.lower()).first():
        return jsonify({"erro": "Já existe uma categoria com esse nome."}), 400

    descricao = dados.get("description")
    if descricao is not None and not isinstance(descricao, str):
        return jsonify({"erro": "A descrição deve ser um texto."}), 400
    categoria = LibraryCategory(
        name=nome,
        slug=slug_unico(nome),
        description=descricao.strip() if isinstance(descricao, str) else None,
        icon=(dados.get("icon") or "").strip() or None,
        color=(dados.get("color") or "").strip() or None,
        position=int(dados.get("position") or 0),
        is_active=dados.get("is_active", True),
        created_by=g.usuario_atual.id_usuario,
    )
    db.session.add(categoria)
    erro = commit_ou_erro("Não foi possível criar a categoria.")
    if erro:
        return erro
    return jsonify(serializar_categoria(categoria)), 201


@library_bp.route("/categories/<int:categoria_id>", methods=["PUT", "PATCH"])
@apenas_adm
def atualizar_categoria(categoria_id):
    categoria = LibraryCategory.query.get(categoria_id)
    if not categoria:
        return jsonify({"erro": "Categoria não encontrada."}), 404
    dados = request.get_json(silent=True)
    if not isinstance(dados, dict):
        return jsonify({"erro": "Dados inválidos."}), 400
    if "name" in dados:
        nome = (dados["name"] or "").strip()
        if not nome:
            return jsonify({"erro": "O nome da categoria é obrigatório."}), 400
        existente = LibraryCategory.query.filter(
            func.lower(LibraryCategory.name) == nome.lower(),
            LibraryCategory.id != categoria.id,
        ).first()
        if existente:
            return jsonify({"erro": "Já existe uma categoria com esse nome."}), 400
        categoria.name = nome
        categoria.slug = slug_unico(nome, categoria.id)
    if "description" in dados:
        categoria.description = dados["description"]
    if "icon" in dados:
        categoria.icon = dados["icon"] or None
    if "color" in dados:
        categoria.color = dados["color"] or None
    if "position" in dados:
        categoria.position = int(dados["position"] or 0)
    if "is_active" in dados:
        categoria.is_active = bool(dados["is_active"])
    erro = commit_ou_erro("Não foi possível atualizar a categoria.")
    if erro:
        return erro
    return jsonify(serializar_categoria(categoria)), 200


@library_bp.route("/categories/<int:categoria_id>", methods=["DELETE"])
@apenas_adm
def excluir_categoria(categoria_id):
    categoria = LibraryCategory.query.get(categoria_id)
    if not categoria:
        return jsonify({"erro": "Categoria não encontrada."}), 404
    if categoria.materials:
        return jsonify({"erro": "Não é possível excluir uma categoria que possui materiais."}), 409
    db.session.delete(categoria)
    erro = commit_ou_erro("Não foi possível excluir a categoria.")
    if erro:
        return erro
    return jsonify({"mensagem": "Categoria excluída."}), 200


def obter_categoria_por_id_ou_slug(valor):
    try:
        categoria_id = int(valor)
        return LibraryCategory.query.get(categoria_id)
    except (TypeError, ValueError):
        return LibraryCategory.query.filter(func.lower(LibraryCategory.slug) == valor.lower()).first()


@library_bp.route("/categories/<valor>/materials", methods=["GET"])
@autenticado
def listar_materiais(valor):
    categoria = obter_categoria_por_id_ou_slug(valor)
    if not categoria:
        return jsonify({"erro": "Categoria não encontrada."}), 404
    pagina = max(int(request.args.get("page", 1)), 1)
    por_pagina = min(max(int(request.args.get("per_page", 12)), 1), 100)
    tipo = (request.args.get("type") or "").strip().upper()
    busca = (request.args.get("search") or "").strip()

    consulta = LibraryMaterial.query.filter_by(category_id=categoria.id, is_published=True)
    if tipo:
        if tipo not in TIPOS_MATERIAIS:
            return jsonify({"erro": "Filtro de tipo inválido."}), 400
        consulta = consulta.filter(LibraryMaterial.type == tipo)
    if busca:
        consulta = consulta.filter(LibraryMaterial.title.ilike(f"%{busca}%"))
    consulta = consulta.order_by(LibraryMaterial.position, LibraryMaterial.title)
    paginacao = consulta.paginate(page=pagina, per_page=por_pagina, error_out=False)
    return jsonify({
        "category": serializar_categoria(categoria),
        "items": [serializar_material(item) for item in paginacao.items],
        "page": paginacao.page,
        "pages": paginacao.pages,
        "total": paginacao.total,
    }), 200


@library_bp.route("/materials", methods=["POST"])
@apenas_adm
def criar_material():
    dados = dados_do_corpo()
    category_id = int(dados.get("category_id") or 0)
    categoria = LibraryCategory.query.get(category_id)
    if not categoria:
        return jsonify({"erro": "Categoria inválida."}), 400
    titulo = (dados.get("title") or "").strip()
    if not titulo:
        return jsonify({"erro": "O título do material é obrigatório."}), 400
    tipo = (dados.get("type") or "").strip().upper()
    if tipo not in TIPOS_MATERIAIS:
        return jsonify({"erro": "Tipo de material inválido."}), 400

    material = LibraryMaterial(
        category_id=categoria.id,
        title=titulo,
        description=(dados.get("description") or "").strip() or None,
        type=tipo,
        tags=(dados.get("tags") or "").strip() or None,
        position=int(dados.get("position") or 0),
        is_published=str(dados.get("is_published", "true")).lower() not in ("false", "0"),
        uploaded_by=g.usuario_atual.id_usuario,
    )

    arquivo = request.files.get("file")
    if tipo in ("LINK", "YOUTUBE"):
        if arquivo:
            return jsonify({"erro": "Materiais de link não devem conter arquivo."}), 400
        url, erro = validar_url(dados.get("url"), youtube=(tipo == "YOUTUBE"))
        if erro:
            return jsonify({"erro": erro}), 400
        material.url = url
    else:
        if not arquivo:
            return jsonify({"erro": "Envie um arquivo para este material."}), 400
        validacao, erro = validar_arquivo(arquivo)
        if erro:
            return jsonify({"erro": erro}), 400
        material.type = validacao["tipo"]
        material.checksum = calcular_checksum(arquivo)
        material.file_path = salvar_arquivo(arquivo, categoria.id, validacao)
        material.original_filename = arquivo.filename
        material.mime_type = validacao["mime"]
        material.size_bytes = validacao["tamanho"]

    db.session.add(material)
    erro = commit_ou_erro("Não foi possível cadastrar o material.")
    if erro:
        remover_arquivo(material.file_path)
        return erro
    return jsonify(serializar_material(material)), 201


@library_bp.route("/materials/<int:material_id>", methods=["PUT", "PATCH"])
@apenas_adm
def atualizar_material(material_id):
    material = LibraryMaterial.query.get(material_id)
    if not material:
        return jsonify({"erro": "Material não encontrado."}), 404
    caminho_antigo = material.file_path
    caminho_novo = None
    dados = dados_do_corpo()

    if "category_id" in dados:
        categoria = LibraryCategory.query.get(int(dados["category_id"] or 0))
        if not categoria:
            return jsonify({"erro": "Categoria inválida."}), 400
        material.category_id = categoria.id
    if "title" in dados:
        titulo = (dados["title"] or "").strip()
        if not titulo:
            return jsonify({"erro": "O título do material é obrigatório."}), 400
        material.title = titulo
    if "description" in dados:
        material.description = (dados["description"] or "").strip() or None
    if "tags" in dados:
        material.tags = (dados["tags"] or "").strip() or None
    if "position" in dados:
        material.position = int(dados["position"] or 0)
    if "is_published" in dados:
        valor = dados["is_published"]
        material.is_published = valor is True or str(valor).lower() not in ("false", "0")

    arquivo = request.files.get("file")
    tipo_informado = (dados.get("type") or material.type).strip().upper()
    if tipo_informado not in TIPOS_MATERIAIS:
        return jsonify({"erro": "Tipo de material inválido."}), 400
    material.type = tipo_informado
    if tipo_informado in ("LINK", "YOUTUBE"):
        if arquivo:
            return jsonify({"erro": "Materiais de link não devem conter arquivo."}), 400
        url, erro = validar_url(dados.get("url") or material.url, youtube=(tipo_informado == "YOUTUBE"))
        if erro:
            return jsonify({"erro": erro}), 400
        material.url = url
        material.file_path = None
        material.original_filename = None
        material.mime_type = None
        material.size_bytes = None
        material.checksum = None
    elif arquivo:
        validacao, erro = validar_arquivo(arquivo)
        if erro:
            return jsonify({"erro": erro}), 400
        material.type = validacao["tipo"]
        material.checksum = calcular_checksum(arquivo)
        material.file_path = salvar_arquivo(arquivo, material.category_id, validacao)
        caminho_novo = material.file_path
        material.original_filename = arquivo.filename
        material.mime_type = validacao["mime"]
        material.size_bytes = validacao["tamanho"]
        material.url = None
    else:
        if not material.file_path:
            return jsonify({"erro": "Selecione um arquivo para este material."}), 400

    erro = commit_ou_erro("Não foi possível atualizar o material.")
    if erro:
        remover_arquivo(caminho_novo)
        return erro
    if caminho_antigo != material.file_path:
        try:
            remover_arquivo(caminho_antigo)
        except OSError:
            current_app.logger.warning("Material atualizado; limpeza do arquivo anterior pendente.")
    return jsonify(serializar_material(material)), 200


@library_bp.route("/materials/<int:material_id>", methods=["DELETE"])
@apenas_adm
def excluir_material(material_id):
    material = LibraryMaterial.query.get(material_id)
    if not material:
        return jsonify({"erro": "Material não encontrado."}), 404
    caminho = material.file_path
    db.session.delete(material)
    erro = commit_ou_erro("Não foi possível excluir o material.")
    if erro:
        return erro
    remover_arquivo(caminho)
    return jsonify({"mensagem": "Material excluído."}), 200


@library_bp.route("/materials/<int:material_id>/download", methods=["GET"])
@autenticado
def baixar_material(material_id):
    material = LibraryMaterial.query.get(material_id)
    if not material:
        return jsonify({"erro": "Material não encontrado."}), 404
    if not material.file_path:
        return jsonify({"erro": "Este material é um link e não possui arquivo para baixar."}), 400
    return enviar_arquivo(
        material.file_path,
        material.original_filename or f"material-{material.id}",
        material.mime_type,
    )
