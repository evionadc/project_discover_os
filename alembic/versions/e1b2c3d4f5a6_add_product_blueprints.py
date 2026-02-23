"""add product blueprints

Revision ID: e1b2c3d4f5a6
Revises: c7f4c1a2d9e0
Create Date: 2026-02-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "e1b2c3d4f5a6"
down_revision: Union[str, Sequence[str], None] = "c7f4c1a2d9e0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "product_blueprints",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("source_inception_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("vision", sa.Text(), nullable=True),
        sa.Column("personas", sa.JSON(), nullable=True),
        sa.Column("journeys", sa.JSON(), nullable=True),
        sa.Column("metrics", sa.JSON(), nullable=True),
        sa.Column("features", sa.JSON(), nullable=True),
        sa.Column("roadmap", sa.JSON(), nullable=True),
        sa.Column("expected_result", sa.Text(), nullable=True),
        sa.Column("cost_timeline", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["workspace_products.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id"),
    )
    op.create_index("ix_product_blueprints_product_id", "product_blueprints", ["product_id"])
    op.create_index("ix_product_blueprints_source_inception_id", "product_blueprints", ["source_inception_id"])


def downgrade() -> None:
    op.drop_index("ix_product_blueprints_source_inception_id", table_name="product_blueprints")
    op.drop_index("ix_product_blueprints_product_id", table_name="product_blueprints")
    op.drop_table("product_blueprints")
