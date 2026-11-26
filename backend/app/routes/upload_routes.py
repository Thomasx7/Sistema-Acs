import re

from flask import Blueprint, jsonify, send_from_directory

from app.utils.foto_perfil import PASTA_FOTOS_PERFIL

upload_bp = Blueprint("upload_bp", __name__)


@upload_bp.route("/perfil/<nome_arquivo>", methods=["GET"])
def obter_foto_perfil(nome_arquivo):
    if (
        "/" in nome_arquivo
        or "\\" in nome_arquivo
        or ".." in nome_arquivo
        or not re.fullmatch(r"[0-9a-f]{32}\.(?:png|jpg|jpeg|webp)", nome_arquivo)
    ):
        return jsonify({"erro": "Foto não encontrada"}), 404

    return send_from_directory(PASTA_FOTOS_PERFIL, nome_arquivo)
