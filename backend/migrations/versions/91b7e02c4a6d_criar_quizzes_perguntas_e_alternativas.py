"""Criar quizzes, perguntas, alternativas e FK do progresso.

Revision ID: 91b7e02c4a6d
Revises: 70414d3679b5
Create Date: 2026-11-10 20:45:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "91b7e02c4a6d"
down_revision = "70414d3679b5"
branch_labels = None
depends_on = None


def upgrade():
    # O progresso de desenvolvimento é descartado antes de adicionar sua FK.
    op.drop_table("progresso_quiz")

    op.create_table(
        "quizzes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=150), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=False),
        sa.Column("cor", sa.String(length=30), nullable=True),
        sa.Column(
            "quantidade_perguntas",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "quantidade_acessos",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "criado_em",
            sa.DateTime(),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nome"),
    )
    op.create_table(
        "perguntas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("id_quiz", sa.Integer(), nullable=False),
        sa.Column("enunciado", sa.Text(), nullable=False),
        sa.Column("explicacao", sa.Text(), nullable=True),
        sa.Column("ordem", sa.Integer(), server_default="1", nullable=False),
        sa.ForeignKeyConstraint(["id_quiz"], ["quizzes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_perguntas_id_quiz"), "perguntas", ["id_quiz"], unique=False
    )
    op.create_table(
        "alternativas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("id_pergunta", sa.Integer(), nullable=False),
        sa.Column("texto", sa.Text(), nullable=False),
        sa.Column(
            "correta",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["id_pergunta"], ["perguntas.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_alternativas_id_pergunta"),
        "alternativas",
        ["id_pergunta"],
        unique=False,
    )

    op.create_table(
        "progresso_quiz",
        sa.Column("id_progresso", sa.Integer(), nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("id_quiz", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("progresso", sa.Integer(), nullable=True),
        sa.Column("acertos", sa.Integer(), nullable=True),
        sa.Column("total_perguntas", sa.Integer(), nullable=True),
        sa.Column("atualizado", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["id_quiz"], ["quizzes.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["id_usuario"], ["usuarios.id_usuario"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id_progresso"),
        sa.UniqueConstraint(
            "id_usuario",
            "id_quiz",
            name="uq_progresso_usuario_quiz",
        ),
    )
    op.create_index(
        op.f("ix_progresso_quiz_id_quiz"),
        "progresso_quiz",
        ["id_quiz"],
        unique=False,
    )
    op.create_index(
        op.f("ix_progresso_quiz_id_usuario"),
        "progresso_quiz",
        ["id_usuario"],
        unique=False,
    )


def downgrade():
    op.drop_index(op.f("ix_progresso_quiz_id_usuario"), table_name="progresso_quiz")
    op.drop_index(op.f("ix_progresso_quiz_id_quiz"), table_name="progresso_quiz")
    op.drop_table("progresso_quiz")
    op.drop_index(op.f("ix_alternativas_id_pergunta"), table_name="alternativas")
    op.drop_table("alternativas")
    op.drop_index(op.f("ix_perguntas_id_quiz"), table_name="perguntas")
    op.drop_table("perguntas")
    op.drop_table("quizzes")

    op.create_table(
        "progresso_quiz",
        sa.Column("id_progresso", sa.Integer(), nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("id_quiz", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("progresso", sa.Integer(), nullable=True),
        sa.Column("acertos", sa.Integer(), nullable=True),
        sa.Column("total_perguntas", sa.Integer(), nullable=True),
        sa.Column("atualizado", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["id_usuario"], ["usuarios.id_usuario"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id_progresso"),
        sa.UniqueConstraint(
            "id_usuario",
            "id_quiz",
            name="uq_progresso_usuario_quiz",
        ),
    )
    op.create_index(
        op.f("ix_progresso_quiz_id_quiz"),
        "progresso_quiz",
        ["id_quiz"],
        unique=False,
    )
    op.create_index(
        op.f("ix_progresso_quiz_id_usuario"),
        "progresso_quiz",
        ["id_usuario"],
        unique=False,
    )
