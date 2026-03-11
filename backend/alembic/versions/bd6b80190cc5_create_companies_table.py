"""placeholder migration

Revision ID: bd6b80190cc5
Revises: 2868a7a35213
Create Date: 2026-03-09

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "bd6b80190cc5"
down_revision: Union[str, Sequence[str], None] = "c84892562e44"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass