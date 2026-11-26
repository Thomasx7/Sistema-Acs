import threading
from html import escape

from flask import current_app
from flask_mail import Message

from app import mail


def enviar_email_reset(usuario, token: str) -> None:
    app = current_app._get_current_object()
    destinatario = usuario.email
    link = (
        f"{app.config['FRONTEND_URL']}/redefinir-senha"
        f"?token={token}"
    )
    minutos = app.config["RESET_SENHA_EXPIRA_MINUTOS"]

    def enviar():
        with app.app_context():
            if (
                not app.config.get("MAIL_SERVER")
                or not app.config.get("MAIL_USERNAME")
            ) and app.debug:
                app.logger.info("Link local de redefinição de senha: %s", link)
                return

            try:
                link_html = escape(link, quote=True)
                corpo_texto = (
                    "Você solicitou a redefinição da sua senha da Plataforma ACS.\n\n"
                    f"Use este link para criar uma nova senha: {link}\n\n"
                    f"O link expira em {minutos} minutos e pode ser usado uma única vez. "
                    "Se não foi você, ignore este e-mail."
                )
                corpo_html = f"""
                    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
                        <h2 style="color: #052373;">Redefinição de senha</h2>
                        <p>Você solicitou a redefinição da sua senha da Plataforma ACS.</p>
                        <p>
                            <a href="{link_html}"
                            style="display: inline-block; padding: 12px 20px; background: #052373;
                                    color: #fff; text-decoration: none; border-radius: 6px;">
                            Redefinir senha
                            </a>
                        </p>
                        <p>O link expira em {minutos} minutos e é de uso único.</p>
                        <p>Se não foi você, ignore este e-mail.</p>
                    </div>
                """
                mensagem = Message(
                    subject="Plataforma ACS - Redefinição de senha",
                    recipients=[destinatario],
                    body=corpo_texto,
                    html=corpo_html,
                )
                mail.send(mensagem)
            except Exception as erro:
                app.logger.error(
                    "Falha ao enviar e-mail de redefinição de senha (%s)",
                    type(erro).__name__,
                )

    thread = threading.Thread(target=enviar, daemon=True)
    try:
        thread.start()
    except Exception as erro:
        app.logger.error(
            "Falha ao iniciar envio de e-mail de redefinição de senha (%s)",
            type(erro).__name__,
        )
