"""add inceptions tables

Revision ID: 9b1a9c2f4d8e
Revises: 8c9b2f2e1d3a
Create Date: 2026-02-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '9b1a9c2f4d8e'
down_revision: Union[str, Sequence[str], None] = '8c9b2f2e1d3a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'inceptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('workspace_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'inception_steps',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('inception_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('step_key', sa.String(length=100), nullable=False),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['inception_id'], ['inceptions.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('inception_id', 'step_key', name='uq_inception_step_key'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('inception_steps')
    op.drop_table('inceptions')
