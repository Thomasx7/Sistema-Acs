# Inicializa o projeto
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from .config import Config
from flask_cors import CORS
from flask_migrate import Migrate 

db = SQLAlchemy()
mail = Mail()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    mail.init_app(app)
    CORS(app)
    migrate.init_app(app, db)

    from app.models.models import Usuarios  

    from app.routes.usuario_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/usuarios')

    return app