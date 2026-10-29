"""Cria a tabela de progresso dos quizzes.

Revision ID: 3c5a1d8f7b20
Revises: 9e7c2d4a1f83
Create Date: 2026-10-28
"""
from alembic import op
import sqlalchemy as sa


revision = "3c5a1d8f7b20"
down_revision = "9e7c2d4a1f83"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "progresso_quiz",
        sa.Column("id_progresso", sa.Integer(), primary_key=True),
        sa.Column(
            "id_usuario",
            sa.Integer(),
            sa.ForeignKey("usuarios.id_usuario", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("id_quiz", sa.String(length=50), nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="andamento",
            nullable=False,
        ),
        sa.Column("progresso", sa.Integer(), server_default="0", nullable=False),
        sa.Column("acertos", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "total_perguntas",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "atualizado_em",
            sa.DateTime(),
            server_default=sa.text("(NOW() AT TIME ZONE 'utc')"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "id_usuario",
            "id_quiz",
            name="uq_progresso_usuario_quiz",
        ),
        sa.CheckConstraint(
            "progresso BETWEEN 0 AND 100",
            name="ck_progresso_faixa",
        ),
    )


def downgrade():
    op.drop_table("progresso_quiz")
