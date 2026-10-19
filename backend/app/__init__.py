# Inicializa o projeto
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from .config import Config
from flask_cors import CORS
from flask_migrate import Migrate 
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
mail = Mail()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializando
    db.init_app(app)
    mail.init_app(app)
    CORS(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app.models.models import Usuarios  

    # Importando as Rotas
    from app.routes.auth_routes import auth_bp
    from app.routes.usuario_routes import user_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/usuarios')

    return app