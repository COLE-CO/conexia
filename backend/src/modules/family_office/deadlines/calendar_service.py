"""Materializa el calendario DIAN para una empresa concreta (HU-024)."""

from __future__ import annotations

from sqlalchemy.orm import Session

from src.modules.family_office.companies import models as company_models

from . import models
from .dian_calendar import generate_deadlines_for_nit


def generate_dian_deadlines_for_company(
    db: Session,
    company: company_models.Company,
    *,
    obligaciones: tuple[str, ...] | None = None,
    commit: bool = True,
) -> int:
    """Crea los `Deadline` faltantes a partir del calendario DIAN para la empresa.

    Idempotente: la combinación (company_id, obligation_type, due_date, source)
    se usa como llave para evitar duplicados.
    """
    if not company.nit:
        return 0

    planned = generate_deadlines_for_nit(company.nit, obligaciones=obligaciones)
    if not planned:
        return 0

    existing_keys = {
        (d.obligation_type, d.due_date)
        for d in (
            db.query(models.Deadline.obligation_type, models.Deadline.due_date)
            .filter(
                models.Deadline.company_id == company.id,
                models.Deadline.source
                == models.DeadlineSource.CALENDAR_DIAN_2026.value,
            )
            .all()
        )
    }

    created = 0
    for entry in planned:
        if (entry.obligation_type, entry.due_date) in existing_keys:
            continue
        db.add(
            models.Deadline(
                company_id=company.id,
                name=entry.obligation_type.replace("_", " ").title(),
                description=entry.description,
                due_date=entry.due_date,
                client_email=None,
                obligation_type=entry.obligation_type,
                period_label=entry.period_label,
                source=models.DeadlineSource.CALENDAR_DIAN_2026.value,
                status=models.DeadlineStatus.PENDIENTE,
            )
        )
        created += 1

    if commit and created:
        db.commit()
    return created
