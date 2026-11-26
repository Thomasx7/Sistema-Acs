from urllib.parse import urlsplit

import boto3
from boto3.exceptions import S3UploadFailedError
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from flask import abort, current_app, send_file


class StorageError(OSError):
    """Falha de armazenamento sem expor credenciais ou resposta do provedor."""


def configurar_armazenamento(app):
    modo = app.config["UPLOAD_STORAGE"]
    if modo not in ("local", "s3"):
        raise RuntimeError("UPLOAD_STORAGE deve ser local ou s3.")
    if modo == "local":
        return

    for nome in (
        "S3_BUCKET", "AWS_ENDPOINT_URL_S3", "AWS_REGION",
        "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY",
    ):
        if not app.config[nome]:
            raise RuntimeError(f"Configure {nome} para usar armazenamento S3.")
    url = urlsplit(app.config["AWS_ENDPOINT_URL_S3"])
    if (
        url.scheme != "https" or not url.hostname or url.username or url.password
        or url.path or url.query or url.fragment
    ):
        raise RuntimeError("AWS_ENDPOINT_URL_S3 deve ser um endpoint HTTPS sem caminhos ou credenciais.")

    app.extensions["object_storage"] = boto3.client(
        "s3",
        endpoint_url=app.config["AWS_ENDPOINT_URL_S3"],
        region_name=app.config["AWS_REGION"],
        aws_access_key_id=app.config["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=app.config["AWS_SECRET_ACCESS_KEY"],
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
            connect_timeout=10,
            read_timeout=60,
            retries={"mode": "standard", "max_attempts": 3},
            request_checksum_calculation="when_required",
            response_checksum_validation="when_required",
        ),
    )


def usar_s3():
    return current_app.config["UPLOAD_STORAGE"] == "s3"


def validar_chave(chave):
    if (
        not isinstance(chave, str) or "\\" in chave or "\x00" in chave
        or any(parte in ("", ".", "..") for parte in chave.split("/"))
        or not chave.startswith(("library/", "uploads/perfil/"))
    ):
        raise StorageError("Caminho de arquivo inválido.")


def salvar_objeto(chave, stream, mime):
    validar_chave(chave)
    stream.seek(0)
    try:
        current_app.extensions["object_storage"].upload_fileobj(
            stream, current_app.config["S3_BUCKET"], chave,
            ExtraArgs={"ContentType": mime},
        )
    except (BotoCoreError, ClientError, S3UploadFailedError):
        raise StorageError("Não foi possível enviar o arquivo ao armazenamento.") from None


def remover_objeto(chave):
    validar_chave(chave)
    try:
        current_app.extensions["object_storage"].delete_object(
            Bucket=current_app.config["S3_BUCKET"], Key=chave,
        )
    except (BotoCoreError, ClientError):
        raise StorageError("Não foi possível remover o arquivo do armazenamento.") from None


def enviar_objeto(chave, nome, mime, anexo=False):
    validar_chave(chave)
    try:
        objeto = current_app.extensions["object_storage"].get_object(
            Bucket=current_app.config["S3_BUCKET"], Key=chave,
        )
    except ClientError as erro:
        if erro.response.get("Error", {}).get("Code") in ("NoSuchKey", "NotFound", "404"):
            abort(404, description="Arquivo não encontrado.")
        raise StorageError("Não foi possível obter o arquivo do armazenamento.") from None
    except BotoCoreError:
        raise StorageError("Não foi possível obter o arquivo do armazenamento.") from None

    # Proxy pela API: o bucket permanece privado e não exige CORS no S3.
    body = objeto["Body"]
    try:
        resposta = send_file(
            body, mimetype=mime, download_name=nome,
            as_attachment=anexo, conditional=False,
        )
        resposta.content_length = objeto["ContentLength"]
        resposta.headers["Cache-Control"] = "private, no-store"
        resposta.call_on_close(body.close)
        return resposta
    except Exception:
        body.close()
        raise
