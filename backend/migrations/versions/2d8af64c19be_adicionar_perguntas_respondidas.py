"""Adicionar posição exata de retomada ao progresso.

Revision ID: 2d8af64c19be
Revises: 91b7e02c4a6d
Create Date: 2026-11-10 21:30:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "2d8af64c19be"
down_revision = "91b7e02c4a6d"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "progresso_quiz",
        sa.Column(
            "perguntas_respondidas",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
    )


def downgrade():
    op.drop_column("progresso_quiz", "perguntas_respondidas")
