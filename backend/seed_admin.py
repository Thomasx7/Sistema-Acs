import os

from app import create_app, db
from app.models.models import Usuarios
from app.utils.hash import hash_password
from app.utils.permissoes import PERMISSAO_ADM
from app.utils.validators import normalizar_email, validar_email, validar_senha


def seed_admin():
    if os.getenv("SEED_ADMIN", "false").strip().lower() != "true":
        print("Seed do administrador desativado.")
        return

    email = os.getenv("ADMIN_EMAIL", "").strip()
    senha = os.getenv("ADMIN_SENHA", "")
    if not email or not senha:
        raise ValueError("ADMIN_EMAIL e ADMIN_SENHA são obrigatórios com SEED_ADMIN=true.")

    email = normalizar_email(email)
    erro_email = validar_email(email)
    if erro_email:
        raise ValueError(f"ADMIN_EMAIL inválido: {erro_email}")
    erro_senha = validar_senha(senha)
    if erro_senha:
        raise ValueError(f"ADMIN_SENHA inválida: {erro_senha}")

    if Usuarios.query.filter_by(email=email).first():
        print("Administrador já existe; nenhum dado foi alterado.")
        return

    usuario = Usuarios(
        nome="Administrador",
        email=email,
        senha=hash_password(senha),
        permissao=PERMISSAO_ADM,
        status="Ativo",
    )
    db.session.add(usuario)
    db.session.commit()
    print("Administrador padrão criado.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_admin()
