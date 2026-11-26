from pathlib import Path
from io import BytesIO

from app.services.object_storage import remover_objeto, salvar_objeto, usar_s3


BACKEND_DIR = Path(__file__).resolve().parents[2]
PASTA_FOTOS_PERFIL = BACKEND_DIR / "uploads" / "perfil"


def obter_caminho_foto_perfil(caminho_relativo):
    if not isinstance(caminho_relativo, str):
        return None

    partes = Path(caminho_relativo).parts
    if (
        len(partes) != 3
        or partes[0] != "uploads"
        or partes[1] != "perfil"
        or any(parte in ("", ".", "..") for parte in partes)
    ):
        return None

    caminho = (BACKEND_DIR / Path(*partes)).resolve()
    if caminho.parent != PASTA_FOTOS_PERFIL.resolve():
        return None

    return caminho


def excluir_foto_perfil(caminho_relativo):
    caminho = obter_caminho_foto_perfil(caminho_relativo)
    if caminho and usar_s3():
        remover_objeto(caminho_relativo)
        return
    if caminho and caminho.is_file():
        caminho.unlink()


def gravar_foto_perfil(caminho_relativo, conteudo, formato):
    caminho = obter_caminho_foto_perfil(caminho_relativo)
    if not caminho:
        raise OSError("Caminho da foto inválido.")
    if usar_s3():
        salvar_objeto(caminho_relativo, BytesIO(conteudo), f"image/{formato}")
        return
    PASTA_FOTOS_PERFIL.mkdir(parents=True, exist_ok=True)
    caminho.write_bytes(conteudo)
