"""extend feature fields for inception-driven planning

Revision ID: c9d8e7f6a5b4
Revises: b3c4d5e6f7a8
Create Date: 2026-02-23 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "c9d8e7f6a5b4"
down_revision: Union[str, Sequence[str], None] = "b3c4d5e6f7a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


feature_complexity_enum = postgresql.ENUM("low", "medium", "high", name="featurecomplexity")


def upgrade() -> None:
    bind = op.get_bind()
    feature_complexity_enum.create(bind, checkfirst=True)

    op.add_column("features", sa.Column("product_id", sa.Integer(), nullable=True))
    op.add_column("features", sa.Column("persona_id", sa.UUID(), nullable=True))
    op.add_column("features", sa.Column("journey_id", sa.UUID(), nullable=True))
    op.add_column("features", sa.Column("complexity", feature_complexity_enum, nullable=True))
    op.add_column("features", sa.Column("business_estimate", sa.Integer(), nullable=True))
    op.add_column("features", sa.Column("effort_estimate", sa.Integer(), nullable=True))
    op.add_column("features", sa.Column("ux_estimate", sa.Integer(), nullable=True))

    op.create_foreign_key("fk_features_product_id", "features", "workspace_products", ["product_id"], ["id"])
    op.create_foreign_key("fk_features_persona_id", "features", "personas", ["persona_id"], ["id"])
    op.create_foreign_key("fk_features_journey_id", "features", "user_journeys", ["journey_id"], ["id"])

    # Safe enum migration in a single transaction:
    # create a new enum, cast column with CASE, then swap enum names.
    op.execute("CREATE TYPE featurestatus_new AS ENUM ('todo', 'doing', 'done')")
    op.execute(
        """
        ALTER TABLE features
        ALTER COLUMN status TYPE featurestatus_new
        USING (
            CASE status::text
                WHEN 'draft' THEN 'todo'
                WHEN 'ready' THEN 'doing'
                WHEN 'in_progress' THEN 'doing'
                WHEN 'done' THEN 'done'
                ELSE 'todo'
            END
        )::featurestatus_new
        """
    )
    op.execute("DROP TYPE featurestatus")
    op.execute("ALTER TYPE featurestatus_new RENAME TO featurestatus")
    op.alter_column("features", "status", server_default="todo")

    op.execute("UPDATE features SET complexity = 'medium' WHERE complexity IS NULL")

    op.alter_column("features", "complexity", server_default="medium", nullable=False)


def downgrade() -> None:
    op.execute("CREATE TYPE featurestatus_old AS ENUM ('draft', 'ready', 'in_progress', 'done')")
    op.execute(
        """
        ALTER TABLE features
        ALTER COLUMN status TYPE featurestatus_old
        USING (
            CASE status::text
                WHEN 'todo' THEN 'draft'
                WHEN 'doing' THEN 'in_progress'
                WHEN 'done' THEN 'done'
                ELSE 'draft'
            END
        )::featurestatus_old
        """
    )
    op.execute("DROP TYPE featurestatus")
    op.execute("ALTER TYPE featurestatus_old RENAME TO featurestatus")
    op.alter_column("features", "status", server_default="draft")

    op.drop_constraint("fk_features_journey_id", "features", type_="foreignkey")
    op.drop_constraint("fk_features_persona_id", "features", type_="foreignkey")
    op.drop_constraint("fk_features_product_id", "features", type_="foreignkey")

    op.drop_column("features", "ux_estimate")
    op.drop_column("features", "effort_estimate")
    op.drop_column("features", "business_estimate")
    op.drop_column("features", "complexity")
    op.drop_column("features", "journey_id")
    op.drop_column("features", "persona_id")
    op.drop_column("features", "product_id")

    feature_complexity_enum.drop(op.get_bind(), checkfirst=True)
