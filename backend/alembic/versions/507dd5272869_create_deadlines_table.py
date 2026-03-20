"""create_deadlines_table

Revision ID: 507dd5272869
Revises: dd1fc3f8eb2d
Create Date: 2026-03-19 23:11:49.825077

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '507dd5272869'
down_revision: Union[str, Sequence[str], None] = 'dd1fc3f8eb2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'deadlines',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('status', sa.Enum('pendiente', 'cumplido', name='deadlinestatus'), nullable=False, server_default='pendiente'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_deadlines_id'), 'deadlines', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_deadlines_id'), table_name='deadlines')
    op.drop_table('deadlines')
    op.execute("DROP TYPE IF EXISTS deadlinestatus")