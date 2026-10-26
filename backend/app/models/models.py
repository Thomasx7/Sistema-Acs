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
    
    # Isso para a tratativa das tentativas do usuario para logar no sistema
    tentativas_falhas = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    bloqueado_ate = db.Column(db.DateTime, nullable=True)


class RedefinicoesSenha(db.Model):
    __tablename__ = "redefinicoes_senha"

    id = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id_usuario", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash = db.Column(db.String(64), unique=True, nullable=False)
    criado_em = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expira_em = db.Column(db.DateTime, nullable=False)
    usado_em = db.Column(db.DateTime, nullable=True)
