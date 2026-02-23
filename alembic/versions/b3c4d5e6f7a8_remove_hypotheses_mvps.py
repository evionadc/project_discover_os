"""remove hypotheses and mvps from discovery and delivery

Revision ID: b3c4d5e6f7a8
Revises: a1b2c3d4e5f6
Create Date: 2026-02-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b3c4d5e6f7a8"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE features DROP CONSTRAINT IF EXISTS fk_features_hypothesis_id")
    op.execute("ALTER TABLE features DROP CONSTRAINT IF EXISTS features_hypothesis_id_fkey")
    op.execute("ALTER TABLE features DROP CONSTRAINT IF EXISTS features_mvp_id_fkey")

    op.execute("ALTER TABLE features DROP COLUMN IF EXISTS hypothesis_id")
    op.execute("ALTER TABLE features DROP COLUMN IF EXISTS mvp_id")

    op.execute("DROP TABLE IF EXISTS mvps")
    op.execute("DROP TABLE IF EXISTS hypotheses")

    op.execute("DROP TYPE IF EXISTS hypothesisstatus")
    op.execute("DROP TYPE IF EXISTS mvpstatus")


def downgrade() -> None:
    hypothesis_status = sa.Enum("testing", "validated", "invalidated", name="hypothesisstatus")
    mvp_status = sa.Enum("defined", "building", "delivered", name="mvpstatus")

    hypothesis_status.create(op.get_bind(), checkfirst=True)
    mvp_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "hypotheses",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("problem_id", sa.UUID(), nullable=True),
        sa.Column("statement", sa.Text(), nullable=False),
        sa.Column("metric", sa.String(length=255), nullable=True),
        sa.Column("success_criteria", sa.String(length=255), nullable=True),
        sa.Column("status", hypothesis_status, nullable=True),
        sa.ForeignKeyConstraint(["problem_id"], ["problems.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "mvps",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("hypothesis_id", sa.UUID(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("scope", sa.Text(), nullable=True),
        sa.Column("status", mvp_status, nullable=True),
        sa.ForeignKeyConstraint(["hypothesis_id"], ["hypotheses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column("features", sa.Column("mvp_id", sa.UUID(), nullable=True))
    op.add_column("features", sa.Column("hypothesis_id", sa.UUID(), nullable=True))

    op.create_foreign_key(
        "features_mvp_id_fkey",
        "features",
        "mvps",
        ["mvp_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_features_hypothesis_id",
        "features",
        "hypotheses",
        ["hypothesis_id"],
        ["id"],
    )
