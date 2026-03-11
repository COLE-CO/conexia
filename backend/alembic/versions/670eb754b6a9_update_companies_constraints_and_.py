"""update companies constraints and defaults

Revision ID: 670eb754b6a9
Revises: bd6b80190cc5
Create Date: 2026-03-10 23:06:03.129635

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '670eb754b6a9'
down_revision: Union[str, Sequence[str], None] = 'bd6b80190cc5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Asegura que no existan valores NULL antes de hacer NOT NULL
    op.execute("UPDATE companies SET created_at = NOW() WHERE created_at IS NULL")

    # Cambia el tipo y agrega server_default desde la base de datos
    op.alter_column(
        'companies',
        'created_at',
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.text('now()')
    )

    # Agrega constraint unique al NIT
    op.create_unique_constraint(
        'uq_companies_nit',
        'companies',
        ['nit']
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Elimina constraint unique
    op.drop_constraint(
        'uq_companies_nit',
        'companies',
        type_='unique'
    )

    # Revierte cambios en created_at
    op.alter_column(
        'companies',
        'created_at',
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        nullable=True,
        server_default=None
    )