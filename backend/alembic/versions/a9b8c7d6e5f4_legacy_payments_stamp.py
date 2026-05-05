"""legacy stamp for payments table (HU-021)

La tabla `payments` ya existe en entornos donde se aplicó la versión previa
de la migración de HU-021 (que tenía este revision id). Este archivo solo
registra la revisión en la cadena de Alembic para mantener la coherencia
con bases de datos ya stampeadas en `a9b8c7d6e5f4`. No realiza cambios de
schema. El módulo de payments vive en la rama de HU-021 y será reintroducido
con su propia migración cuando esa rama se mergee.

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
