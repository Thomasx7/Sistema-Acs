import re

SENHA_MIN = 6

# local@dominio.tld  (aceita .com, .br, .com.br, .org etc.)
EMAIL_REGEX = re.compile(
    r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$"
)


def normalizar_email(email: str) -> str:
    """Remove espaços e padroniza em minúsculo (evita 'A@x.com' != 'a@x.com')."""
    return email.strip().lower()


def validar_email(email: str) -> str | None:
    """Retorna a mensagem de erro, ou None se o e-mail for válido."""
    if not email:
        return "Email é obrigatório"
    if len(email) > 100:  # mesmo limite da coluna no banco
        return "Email muito longo"
    if not EMAIL_REGEX.match(email):
        return "Email inválido"
    return None


def validar_senha(senha: str) -> str | None:
    """Retorna a mensagem de erro, ou None se a senha for válida."""
    if not senha:
        return "Senha é obrigatória"
    if len(senha) < SENHA_MIN:
        return f"A senha deve ter no mínimo {SENHA_MIN} caracteres"
    return None