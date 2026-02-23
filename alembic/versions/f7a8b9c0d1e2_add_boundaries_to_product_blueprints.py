"""add boundaries to product blueprints

Revision ID: f7a8b9c0d1e2
Revises: e1b2c3d4f5a6
Create Date: 2026-02-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f7a8b9c0d1e2"
down_revision: Union[str, Sequence[str], None] = "e1b2c3d4f5a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("product_blueprints", sa.Column("boundaries", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("product_blueprints", "boundaries")
