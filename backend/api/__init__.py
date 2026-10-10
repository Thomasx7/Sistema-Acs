from flask import Flask, jsonify
from sqlalchemy import text


from .config import Config
from .extensions import db, migrate, jwt, mail, cors

# Função para criar a aplicação Flask com todas as extensões e rotas
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Liga as extensões ao app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
    )
    
    from . import models

    # Registra os blueprints
    from .routes.routes_users import bp as users_bp
    from .routes.auth import bp as auth_bp

    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # Só pra confirmar que esta rodando e que o banco está conectado
    @app.get("/api/health")
    def health():
        db.session.execute(text("SELECT 1"))
        return jsonify({"status": "ok", "database": "connected"}), 200

    return app