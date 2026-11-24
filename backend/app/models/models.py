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
    id_quiz = db.Column(
        db.Integer,
        db.ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = db.Column(db.String(20), default="em_andamento")
    progresso = db.Column(db.Integer, default=0)
    acertos = db.Column(db.Integer, default=0)
    perguntas_respondidas = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
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
    quiz = db.relationship("Quiz", back_populates="progressos")


class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False, unique=True)
    descricao = db.Column(db.Text, nullable=False, default="")
    cor = db.Column(db.String(30), nullable=True)
    quantidade_perguntas = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    quantidade_acessos = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    criado_em = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        server_default=db.func.now(),
    )

    perguntas = db.relationship(
        "Pergunta",
        back_populates="quiz",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Pergunta.ordem",
    )
    progressos = db.relationship(
        "ProgressoQuiz",
        back_populates="quiz",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Pergunta(db.Model):
    __tablename__ = "perguntas"

    id = db.Column(db.Integer, primary_key=True)
    id_quiz = db.Column(
        db.Integer,
        db.ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    enunciado = db.Column(db.Text, nullable=False)
    explicacao = db.Column(db.Text, nullable=True)
    ordem = db.Column(
        db.Integer,
        nullable=False,
        default=1,
        server_default="1",
    )

    quiz = db.relationship("Quiz", back_populates="perguntas")
    alternativas = db.relationship(
        "Alternativa",
        back_populates="pergunta",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Alternativa.id",
    )


class Alternativa(db.Model):
    __tablename__ = "alternativas"

    id = db.Column(db.Integer, primary_key=True)
    id_pergunta = db.Column(
        db.Integer,
        db.ForeignKey("perguntas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    texto = db.Column(db.Text, nullable=False)
    correta = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        server_default=db.false(),
    )

    pergunta = db.relationship("Pergunta", back_populates="alternativas")


class LibraryCategory(db.Model):
    __tablename__ = "library_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False, unique=True)
    slug = db.Column(db.String(160), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(50), nullable=True)
    position = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    is_active = db.Column(db.Boolean, nullable=False, default=True, server_default=db.true())
    created_by = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id_usuario", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    materials = db.relationship(
        "LibraryMaterial",
        back_populates="category",
        cascade="none",
        passive_deletes=True,
        order_by="LibraryMaterial.position",
    )


class LibraryMaterial(db.Model):
    __tablename__ = "library_materials"
    __table_args__ = (
        db.CheckConstraint(
            "(url IS NOT NULL AND file_path IS NULL) OR "
            "(url IS NULL AND file_path IS NOT NULL)",
            name="ck_library_material_url_or_file",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("library_categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    type = db.Column(db.String(20), nullable=False, index=True)
    url = db.Column(db.String(1000), nullable=True)
    file_path = db.Column(db.String(500), nullable=True)
    original_filename = db.Column(db.String(255), nullable=True)
    mime_type = db.Column(db.String(150), nullable=True)
    size_bytes = db.Column(db.Integer, nullable=True)
    checksum = db.Column(db.String(64), nullable=True)
    thumbnail_path = db.Column(db.String(500), nullable=True)
    tags = db.Column(db.Text, nullable=True)
    position = db.Column(db.Integer, nullable=False, default=0, server_default="0")
    is_published = db.Column(db.Boolean, nullable=False, default=True, index=True, server_default=db.true())
    uploaded_by = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id_usuario", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    category = db.relationship("LibraryCategory", back_populates="materials")
