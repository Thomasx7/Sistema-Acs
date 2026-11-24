import os
import re
import shutil
import uuid
from pathlib import Path

from flask import current_app
from werkzeug.utils import secure_filename


ALLOWED_EXTENSIONS = {
    "pdf": "application/pdf",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "txt": "text/plain",
    "csv": "text/csv",
}


def tipo_por_extensao(extensao):
    mapa = {
        "pdf": "PDF",
        "doc": "WORD",
        "docx": "WORD",
        "xls": "EXCEL",
        "xlsx": "EXCEL",
        "ppt": "POWERPOINT",
        "pptx": "POWERPOINT",
        "png": "IMAGE",
        "jpg": "IMAGE",
        "jpeg": "IMAGE",
        "webp": "IMAGE",
        "gif": "IMAGE",
        "svg": "IMAGE",
        "mp4": "VIDEO",
        "webm": "VIDEO",
        "mp3": "AUDIO",
        "wav": "AUDIO",
        "txt": "OTHER",
        "csv": "EXCEL",
    }
    return mapa.get(extensao, "OTHER")


def extensao_segura(nome):
    nome_seguro = secure_filename(nome or "")
    if "." not in nome_seguro:
        return ""
    return nome_seguro.rsplit(".", 1)[1].lower()


def validar_assinatura(arquivo, extensao):
    inicio = arquivo.stream.read(16)
    arquivo.stream.seek(0)

    if extensao == "pdf":
        return inicio.startswith(b"%PDF")
    if extensao == "png":
        return inicio.startswith(b"\x89PNG\r\n\x1a\n")
    if extensao in ("jpg", "jpeg"):
        return inicio.startswith(b"\xff\xd8\xff")
    if extensao == "gif":
        return inicio.startswith((b"GIF87a", b"GIF89a"))
    if extensao == "webp":
        arquivo.stream.seek(0)
        cabecalho = arquivo.stream.read(12)
        arquivo.stream.seek(0)
        return cabecalho.startswith(b"RIFF") and cabecalho[8:12] == b"WEBP"
    if extensao == "wav":
        arquivo.stream.seek(0)
        cabecalho = arquivo.stream.read(12)
        arquivo.stream.seek(0)
        return cabecalho.startswith(b"RIFF") and cabecalho[8:12] == b"WAVE"
    if extensao == "mp3":
        return inicio.startswith(b"ID3") or inicio[0] == 0xFF
    if extensao in ("mp4", "webm"):
        arquivo.stream.seek(0)
        cabecalho = arquivo.stream.read(64)
        arquivo.stream.seek(0)
        if extensao == "mp4":
            return b"ftyp" in cabecalho
        return cabecalho.startswith(b"\x1aE\xdf\xa3")
    if extensao in ("doc", "xls", "ppt"):
        return inicio.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1")
    if extensao in ("docx", "xlsx", "pptx"):
        arquivo.stream.seek(0)
        cabecalho = arquivo.stream.read(4)
        arquivo.stream.seek(0)
        return cabecalho == b"PK\x03\x04"
    if extensao == "svg":
        arquivo.stream.seek(0)
        conteudo = arquivo.stream.read(1024 * 1024).decode("utf-8", "ignore").lower()
        arquivo.stream.seek(0)
        if "<script" in conteudo or re.search(r"\son[a-z]+\s*=", conteudo):
            return False
        return "<svg" in conteudo
    if extensao in ("txt", "csv"):
        arquivo.stream.seek(0)
        conteudo = arquivo.stream.read(1024 * 1024)
        arquivo.stream.seek(0)
        try:
            conteudo.decode("utf-8")
            return True
        except UnicodeDecodeError:
            return False
    return False


def validar_arquivo(arquivo):
    nome = arquivo.filename or ""
    extensao = extensao_segura(nome)
    if extensao not in ALLOWED_EXTENSIONS:
        return None, "Tipo de arquivo não permitido."

    arquivo.stream.seek(0, os.SEEK_END)
    tamanho = arquivo.stream.tell()
    arquivo.stream.seek(0)

    limite = current_app.config["LIBRARY_MAX_VIDEO_SIZE"] if extensao in ("mp4", "webm") else current_app.config["LIBRARY_MAX_FILE_SIZE"]
    if tamanho <= 0:
        return None, "O arquivo está vazio."
    if tamanho > limite:
        return None, "O arquivo excede o limite de tamanho permitido."
    if not validar_assinatura(arquivo, extensao):
        return None, "O conteúdo do arquivo não corresponde à extensão informada."

    tipo = tipo_por_extensao(extensao)
    return {
        "extensao": extensao,
        "tipo": tipo,
        "tamanho": tamanho,
        "mime": ALLOWED_EXTENSIONS[extensao],
    }, None


def raiz_armazenamento():
    raiz = Path(current_app.config["LIBRARY_UPLOAD_DIR"])
    raiz.mkdir(parents=True, exist_ok=True)
    return raiz


def salvar_arquivo(arquivo, categoria_id, validacao):
    pasta = raiz_armazenamento() / str(categoria_id)
    pasta.mkdir(parents=True, exist_ok=True)
    nome = f"{uuid.uuid4().hex}.{validacao['extensao']}"
    destino = pasta / nome
    arquivo.save(destino)
    return str((Path(str(categoria_id)) / nome).as_posix())


def remover_arquivo(file_path):
    if not file_path:
        return
    relativo = Path(file_path)
    if relativo.is_absolute() or ".." in relativo.parts:
        return
    destino = raiz_armazenamento() / relativo
    if destino.is_file():
        destino.unlink()
