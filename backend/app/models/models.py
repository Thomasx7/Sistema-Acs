from app import db
from datetime import datetime
from app.utils.permissoes import PERMISSAO_COMUM

class Usuarios(db.Model):
    __tablename__ = "usuarios"
    
    id_usuario = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    senha = db.Column(db.String(200), nullable=False)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    permissao = db.Column(db.String(20), default=PERMISSAO_COMUM) # Permissão padrão
    status = db.Column(db.String(20), default='Ativo')
