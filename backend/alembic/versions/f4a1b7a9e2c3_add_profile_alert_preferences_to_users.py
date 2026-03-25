"""Add profile alert preferences to users

Revision ID: f4a1b7a9e2c3
Revises: 4aca2152ea66
Create Date: 2026-03-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f4a1b7a9e2c3"
down_revision: Union[str, Sequence[str], None] = "4aca2152ea66"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "alert_deadlines_enabled", sa.Boolean(), nullable=False, server_default=sa.true()
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "alert_balances_enabled", sa.Boolean(), nullable=False, server_default=sa.true()
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "alert_reports_enabled", sa.Boolean(), nullable=False, server_default=sa.true()
        ),
    )

    op.alter_column("users", "alert_deadlines_enabled", server_default=None)
    op.alter_column("users", "alert_balances_enabled", server_default=None)
    op.alter_column("users", "alert_reports_enabled", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "alert_reports_enabled")
    op.drop_column("users", "alert_balances_enabled")
    op.drop_column("users", "alert_deadlines_enabled")
