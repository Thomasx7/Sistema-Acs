# Inicializa o projeto
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from .config import Config
from flask_cors import CORS
from flask_migrate import Migrate 
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    variaveis_obrigatorias = {
        "DATABASE_URL": app.config["SQLALCHEMY_DATABASE_URI"],
        "SECRET_KEY": app.config["SECRET_KEY"],
        "JWT_SECRET_KEY": app.config["JWT_SECRET_KEY"],
    }
    ausentes = [nome for nome, valor in variaveis_obrigatorias.items() if not valor]
    if ausentes:
        raise RuntimeError(
            "Configure as variáveis de ambiente obrigatórias: "
            + ", ".join(ausentes)
        )

    # Inicializando
    db.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"])
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Erros do JWT em português e sempre com status 401
    @jwt.unauthorized_loader
    def token_ausente(motivo):
        return jsonify({"erro": "Faça login para continuar"}), 401

    @jwt.invalid_token_loader
    def token_invalido(motivo):
        return jsonify({"erro": "Sessão inválida. Faça login novamente"}), 401

    @jwt.expired_token_loader
    def token_expirado(jwt_header, jwt_payload):
        return jsonify({"erro": "Sessão expirada. Faça login novamente"}), 401

    from app.models.models import Usuarios, ProgressoQuiz

    # Importando as Rotas
    from app.routes.auth_routes import auth_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.usuario_routes import user_bp
    from app.routes.progresso_routes import progresso_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(user_bp, url_prefix='/usuarios')
    app.register_blueprint(progresso_bp, url_prefix='/progresso')

    return app