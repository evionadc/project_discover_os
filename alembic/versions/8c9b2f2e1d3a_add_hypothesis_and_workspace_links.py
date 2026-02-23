"""add hypothesis/workspace links to delivery

Revision ID: 8c9b2f2e1d3a
Revises: 5231e1da81f0
Create Date: 2026-02-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c9b2f2e1d3a'
down_revision: Union[str, Sequence[str], None] = '5231e1da81f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('features', sa.Column('hypothesis_id', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_features_hypothesis_id',
        'features',
        'hypotheses',
        ['hypothesis_id'],
        ['id'],
    )

    op.add_column('stories', sa.Column('workspace_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_stories_workspace_id',
        'stories',
        'workspaces',
        ['workspace_id'],
        ['id'],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_stories_workspace_id', 'stories', type_='foreignkey')
    op.drop_column('stories', 'workspace_id')

    op.drop_constraint('fk_features_hypothesis_id', 'features', type_='foreignkey')
    op.drop_column('features', 'hypothesis_id')
