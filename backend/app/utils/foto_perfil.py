from pathlib import Path


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
    if caminho and caminho.is_file():
        caminho.unlink()
