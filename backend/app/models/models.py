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
    permissao = db.Column(db.String(20), default=PERMISSAO_COMUM)  # Permissão padrão
    status = db.Column(db.String(20), default='Ativo')


class ProgressoQuiz(db.Model):
    __tablename__ = "progresso_quiz"
    __table_args__ = (
        db.UniqueConstraint('id_usuario', 'id_quiz', name='uq_progresso_usuario_quiz'),
        db.CheckConstraint('progresso BETWEEN 0 AND 100', name='ck_progresso_faixa'),
    )

    id_progresso = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(
        db.Integer,
        db.ForeignKey('usuarios.id_usuario', ondelete='CASCADE'),
        nullable=False,
    )
    id_quiz = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='andamento')
    progresso = db.Column(db.Integer, nullable=False, default=0)
    acertos = db.Column(db.Integer, nullable=False, default=0)
    total_perguntas = db.Column(db.Integer, nullable=False, default=0)
    atualizado_em = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
