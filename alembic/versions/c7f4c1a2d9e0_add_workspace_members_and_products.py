"""add workspace members and products

Revision ID: c7f4c1a2d9e0
Revises: 9b1a9c2f4d8e
Create Date: 2026-02-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c7f4c1a2d9e0"
down_revision: Union[str, Sequence[str], None] = "9b1a9c2f4d8e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "workspace_members",
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("workspace_id", "user_id"),
    )

    op.create_table(
        "workspace_products",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workspace_products_workspace_id", "workspace_products", ["workspace_id"])

    # Backfill existing owners as members for current workspaces.
    op.execute(
        sa.text(
            """
            INSERT INTO workspace_members (workspace_id, user_id)
            SELECT w.id, w.owner_id
            FROM workspaces w
            WHERE NOT EXISTS (
                SELECT 1
                FROM workspace_members wm
                WHERE wm.workspace_id = w.id
                  AND wm.user_id = w.owner_id
            )
            """
        )
    )


def downgrade() -> None:
    op.drop_index("ix_workspace_products_workspace_id", table_name="workspace_products")
    op.drop_table("workspace_products")
    op.drop_table("workspace_members")
