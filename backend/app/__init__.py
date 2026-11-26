# Inicializa o projeto
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from .config import Config
from flask_cors import CORS
from flask_migrate import Migrate 
from flask_jwt_extended import JWTManager
from urllib.parse import urlsplit

db = SQLAlchemy()
mail = Mail()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    if app.config["PRODUCTION"]:
        for chave in ("SECRET_KEY", "JWT_SECRET_KEY"):
            valor = app.config.get(chave) or ""
            if len(valor) < 32 or valor.startswith(("troque-", "SUBSTITUA_")):
                raise RuntimeError(f"Configure {chave} com uma chave aleatória de pelo menos 32 caracteres.")
        for origem in [app.config["FRONTEND_URL"], *app.config["CORS_ORIGINS"]]:
            url = urlsplit(origem)
            if (
                url.scheme != "https" or not url.hostname or url.username or url.password
                or url.path or url.query or url.fragment or "*" in origem
            ):
                raise RuntimeError("Configure FRONTEND_URL e CORS_ORIGINS com origens HTTPS, sem caminhos ou curingas.")
        if not app.config["CORS_ORIGINS"]:
            raise RuntimeError("Configure ao menos uma origem em CORS_ORIGINS.")

    # Inicializando
    db.init_app(app)
    mail.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"], expose_headers=["Retry-After"])
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app.services.object_storage import StorageError, configurar_armazenamento
    configurar_armazenamento(app)

    @app.errorhandler(StorageError)
    def erro_armazenamento(erro):
        db.session.rollback()
        app.logger.warning("Falha no armazenamento de arquivos.")
        return jsonify({"erro": "Armazenamento indisponível. Tente novamente."}), 503
    
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

    from app.models.models import Usuarios  

    # Importando as Rotas
    from app.routes.auth_routes import auth_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.usuario_routes import user_bp
    from app.routes.progresso_quiz_routes import progresso_quiz_bp
    from app.routes.quiz_routes import pergunta_bp, quiz_bp
    from app.routes.upload_routes import upload_bp
    from app.routes.library_routes import library_bp
    from app.routes.health_routes import health_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(user_bp, url_prefix='/usuarios')
    app.register_blueprint(progresso_quiz_bp, url_prefix='/progresso-quiz')
    app.register_blueprint(quiz_bp, url_prefix='/quizzes')
    app.register_blueprint(pergunta_bp)
    app.register_blueprint(upload_bp, url_prefix='/uploads')
    app.register_blueprint(library_bp, url_prefix='/library')
    app.register_blueprint(health_bp)

    return app
