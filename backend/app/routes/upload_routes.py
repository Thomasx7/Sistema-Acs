import re

from flask import Blueprint, jsonify, send_from_directory

from app.utils.foto_perfil import PASTA_FOTOS_PERFIL
from app.services.object_storage import enviar_objeto, usar_s3

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

    if usar_s3():
        extensao = nome_arquivo.rsplit(".", 1)[1]
        formato = "jpeg" if extensao == "jpg" else extensao
        return enviar_objeto(f"uploads/perfil/{nome_arquivo}", nome_arquivo, f"image/{formato}")
    return send_from_directory(PASTA_FOTOS_PERFIL, nome_arquivo)
