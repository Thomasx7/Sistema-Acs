"""Criar categorias e materiais da biblioteca

Revision ID: 8f21d3c7a64b
Revises: 2d8af64c19be
Create Date: 2026-11-24 19:01:40
"""
from alembic import op
import sqlalchemy as sa


revision = "8f21d3c7a64b"
down_revision = "2d8af64c19be"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "library_categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("icon", sa.String(length=50), nullable=True),
        sa.Column("color", sa.String(length=50), nullable=True),
        sa.Column("position", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["usuarios.id_usuario"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )

    op.create_table(
        "library_materials",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("url", sa.String(length=1000), nullable=True),
        sa.Column("file_path", sa.String(length=500), nullable=True),
        sa.Column("original_filename", sa.String(length=255), nullable=True),
        sa.Column("mime_type", sa.String(length=150), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=True),
        sa.Column("checksum", sa.String(length=64), nullable=True),
        sa.Column("thumbnail_path", sa.String(length=500), nullable=True),
        sa.Column("tags", sa.Text(), nullable=True),
        sa.Column("position", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_published", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("uploaded_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["library_categories.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["uploaded_by"], ["usuarios.id_usuario"], ondelete="SET NULL"),
        sa.CheckConstraint(
            "(url IS NOT NULL AND file_path IS NULL) OR "
            "(url IS NULL AND file_path IS NOT NULL)",
            name="ck_library_material_url_or_file",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_library_materials_category_id", "library_materials", ["category_id"])
    op.create_index("ix_library_materials_type", "library_materials", ["type"])
    op.create_index("ix_library_materials_is_published", "library_materials", ["is_published"])


def downgrade():
    op.drop_index("ix_library_materials_is_published", table_name="library_materials")
    op.drop_index("ix_library_materials_type", table_name="library_materials")
    op.drop_index("ix_library_materials_category_id", table_name="library_materials")
    op.drop_table("library_materials")
    op.drop_table("library_categories")
