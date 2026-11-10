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
    foto_perfil = db.Column(db.String(255), nullable=True)


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


class ProgressoQuiz(db.Model):
    __tablename__ = "progresso_quiz"
    __table_args__ = (
        db.UniqueConstraint(
            "id_usuario",
            "id_quiz",
            name="uq_progresso_usuario_quiz",
        ),
    )

    id_progresso = db.Column(db.Integer, primary_key=True)
    id_usuario = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id_usuario", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Sem ForeignKey enquanto não existir uma tabela de quizzes no banco.
    id_quiz = db.Column(db.Integer, nullable=False, index=True)
    status = db.Column(db.String(20), default="em_andamento")
    progresso = db.Column(db.Integer, default=0)
    acertos = db.Column(db.Integer, default=0)
    total_perguntas = db.Column(db.Integer, default=0)
    atualizado = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    usuario = db.relationship(
        "Usuarios",
        backref=db.backref("progressos_quiz", cascade="all, delete-orphan"),
    )
