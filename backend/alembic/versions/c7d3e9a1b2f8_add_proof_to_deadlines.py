"""add proof file metadata to deadlines

Revision ID: c7d3e9a1b2f8
Revises: a9b8c7d6e5f4
Create Date: 2026-04-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c7d3e9a1b2f8"
down_revision: Union[str, Sequence[str], None] = "a9b8c7d6e5f4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "deadlines",
        sa.Column("proof_storage_key", sa.String(), nullable=True),
    )
    op.add_column(
        "deadlines",
        sa.Column("proof_filename", sa.String(), nullable=True),
    )
    op.add_column(
        "deadlines",
        sa.Column("proof_content_type", sa.String(), nullable=True),
    )
    op.add_column(
        "deadlines",
        sa.Column("proof_file_size", sa.Integer(), nullable=True),
    )
    op.add_column(
        "deadlines",
        sa.Column(
            "proof_uploaded_at", sa.DateTime(timezone=True), nullable=True
        ),
    )


def downgrade() -> None:
    op.drop_column("deadlines", "proof_uploaded_at")
    op.drop_column("deadlines", "proof_file_size")
    op.drop_column("deadlines", "proof_content_type")
    op.drop_column("deadlines", "proof_filename")
    op.drop_column("deadlines", "proof_storage_key")
