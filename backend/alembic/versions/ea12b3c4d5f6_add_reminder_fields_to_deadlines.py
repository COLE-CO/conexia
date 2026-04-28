"""add_reminder_fields_to_deadlines

Revision ID: ea12b3c4d5f6
Revises: 507dd5272869
Create Date: 2026-04-18 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "ea12b3c4d5f6"
down_revision: Union[str, Sequence[str], None] = "9f2c1d4a7b11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("deadlines", sa.Column("client_email", sa.String(), nullable=True))
    op.add_column("deadlines", sa.Column("amount", sa.String(), nullable=True))
    op.add_column(
        "deadlines",
        sa.Column("reminder_sent_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute(
        """
        UPDATE deadlines
        SET client_email = 'pendiente@conexia.local'
        WHERE client_email IS NULL
        """
    )
    op.alter_column("deadlines", "client_email", nullable=False)


def downgrade() -> None:
    op.drop_column("deadlines", "reminder_sent_at")
    op.drop_column("deadlines", "amount")
    op.drop_column("deadlines", "client_email")