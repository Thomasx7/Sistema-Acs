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

    # Inicializando
    db.init_app(app)
    CORS(app)
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

    from app.models.models import Usuarios  

    # Importando as Rotas
    from app.routes.auth_routes import auth_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.usuario_routes import user_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(user_bp, url_prefix='/usuarios')

    return app