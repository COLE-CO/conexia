"""merge alembic heads (cash_monthly_closings + reminder_window_to_users)

`main` quedó con dos heads tras integrar HU de cash flow y los
recordatorios de deadlines en paralelo:

- a1b2c3d4e5f6 (create_cash_monthly_closings)
- b1e8a2d9f7c4 (add_reminder_window_to_users)

Esta migración no realiza cambios de schema; únicamente reúne ambos
heads en un único punto sobre el cual apilar las migraciones siguientes
(HU-023 comprobante de cierre y HU-024 calendario tributario DIAN).

Revision ID: a9b8c7d6e5f4
Revises: a1b2c3d4e5f6, b1e8a2d9f7c4
Create Date: 2026-04-27 00:00:00.000000

"""
from typing import Sequence, Union


revision: str = "a9b8c7d6e5f4"
down_revision: Union[str, Sequence[str], None] = ("a1b2c3d4e5f6", "b1e8a2d9f7c4")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
