"""create_cash_monthly_closings

Revision ID: a1b2c3d4e5f6
Revises: 9f2c1d4a7b11
Create Date: 2026-04-14 10:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "9f2c1d4a7b11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cash_monthly_closings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False),
        sa.Column("opening_balance", sa.Numeric(14, 2), nullable=False),
        sa.Column("total_income", sa.Numeric(14, 2), nullable=False),
        sa.Column("total_expenses", sa.Numeric(14, 2), nullable=False),
        sa.Column("closing_balance", sa.Numeric(14, 2), nullable=False),
        sa.Column(
            "is_closed", sa.Boolean(), nullable=False, server_default="false"
        ),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_by_user_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["account_id"],
            ["cash_accounts.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["closed_by_user_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "account_id", "year", "month", name="uq_closing_account_year_month"
        ),
    )
    op.create_index(
        "ix_cash_monthly_closings_id", "cash_monthly_closings", ["id"]
    )
    op.create_index(
        "ix_cash_monthly_closings_account_id",
        "cash_monthly_closings",
        ["account_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_cash_monthly_closings_account_id",
        table_name="cash_monthly_closings",
    )
    op.drop_index(
        "ix_cash_monthly_closings_id", table_name="cash_monthly_closings"
    )
    op.drop_table("cash_monthly_closings")
