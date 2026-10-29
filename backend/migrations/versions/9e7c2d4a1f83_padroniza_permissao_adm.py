"""Padroniza a permissão administrativa.

Revision ID: 9e7c2d4a1f83
Revises: 7684e62eb049
Create Date: 2026-10-26 19:09:00
"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "9e7c2d4a1f83"
down_revision = "7684e62eb049"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("UPDATE usuarios SET permissao = 'ADM' WHERE permissao = 'Adm'")


def downgrade():
    op.execute("UPDATE usuarios SET permissao = 'Adm' WHERE permissao = 'ADM'")
