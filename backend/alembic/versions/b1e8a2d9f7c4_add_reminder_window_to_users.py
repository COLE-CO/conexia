"""add reminder window to users

Revision ID: b1e8a2d9f7c4
Revises: ea12b3c4d5f6
Create Date: 2026-04-18 12:10:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b1e8a2d9f7c4"
down_revision: Union[str, None] = "ea12b3c4d5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "reminder_window_start_days",
            sa.Integer(),
            nullable=False,
            server_default="5",
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "reminder_window_end_days",
            sa.Integer(),
            nullable=False,
            server_default="7",
        ),
    )
    op.alter_column("users", "reminder_window_start_days", server_default=None)
    op.alter_column("users", "reminder_window_end_days", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "reminder_window_end_days")
    op.drop_column("users", "reminder_window_start_days")
