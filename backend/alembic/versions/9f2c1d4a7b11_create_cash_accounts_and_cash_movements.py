"""create_cash_accounts_and_cash_movements

Revision ID: 9f2c1d4a7b11
Revises: f4a1b7a9e2c3
Create Date: 2026-03-28 10:55:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f2c1d4a7b11"
down_revision: Union[str, Sequence[str], None] = "f4a1b7a9e2c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cash_accounts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column(
            "current_balance", sa.Numeric(14, 2), nullable=False, server_default="0"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_cash_accounts_id"), "cash_accounts", ["id"], unique=False)

    op.create_table(
        "cash_movements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("concept", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("movement_date", sa.Date(), nullable=False),
        sa.Column(
            "movement_type",
            sa.Enum("ingreso", "egreso", name="cashmovementtype"),
            nullable=False,
        ),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["account_id"], ["cash_accounts.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_cash_movements_id"), "cash_movements", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_cash_movements_account_id"),
        "cash_movements",
        ["account_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_cash_movements_account_id"), table_name="cash_movements")
    op.drop_index(op.f("ix_cash_movements_id"), table_name="cash_movements")
    op.drop_table("cash_movements")

    op.drop_index(op.f("ix_cash_accounts_id"), table_name="cash_accounts")
    op.drop_table("cash_accounts")

    op.execute("DROP TYPE IF EXISTS cashmovementtype")
