"""add tax calendar fields to deadlines (HU-024)

Revision ID: d8f1e4a2b3c5
Revises: c7d3e9a1b2f8
Create Date: 2026-05-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d8f1e4a2b3c5"
down_revision: Union[str, Sequence[str], None] = "c7d3e9a1b2f8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "deadlines",
        sa.Column("obligation_type", sa.String(), nullable=True),
    )
    op.add_column(
        "deadlines",
        sa.Column("period_label", sa.String(), nullable=True),
    )
    op.add_column(
        "deadlines",
        sa.Column(
            "source",
            sa.String(),
            nullable=False,
            server_default="manual",
        ),
    )
    op.alter_column(
        "deadlines",
        "client_email",
        existing_type=sa.String(),
        nullable=True,
    )
    op.create_index(
        "ix_deadlines_obligation_type",
        "deadlines",
        ["obligation_type"],
    )
    op.create_index(
        "ix_deadlines_source",
        "deadlines",
        ["source"],
    )


def downgrade() -> None:
    op.drop_index("ix_deadlines_source", table_name="deadlines")
    op.drop_index("ix_deadlines_obligation_type", table_name="deadlines")
    op.alter_column(
        "deadlines",
        "client_email",
        existing_type=sa.String(),
        nullable=False,
    )
    op.drop_column("deadlines", "source")
    op.drop_column("deadlines", "period_label")
    op.drop_column("deadlines", "obligation_type")
