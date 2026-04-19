import logging
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import case
from sqlalchemy.orm import Session

from src.core.config import settings
from src.modules.auth import models as auth_models
from src.modules.family_office.companies import service as company_service
from src.modules.notifications.email_service import send_reminder_email

from . import models, schemas

logger = logging.getLogger(__name__)

DEFAULT_REMINDER_WINDOW_START_DAYS = 5
DEFAULT_REMINDER_WINDOW_END_DAYS = 7


def _get_reminder_window_days(db: Session) -> tuple[int, int]:
    admin_user = (
        db.query(auth_models.User)
        .filter(auth_models.User.email == settings.ADMIN_EMAIL)
        .first()
    )

    if not admin_user:
        return DEFAULT_REMINDER_WINDOW_START_DAYS, DEFAULT_REMINDER_WINDOW_END_DAYS

    start_days = admin_user.reminder_window_start_days
    end_days = admin_user.reminder_window_end_days

    if start_days < 0 or end_days < 0:
        return DEFAULT_REMINDER_WINDOW_START_DAYS, DEFAULT_REMINDER_WINDOW_END_DAYS

    if start_days > end_days:
        return DEFAULT_REMINDER_WINDOW_START_DAYS, DEFAULT_REMINDER_WINDOW_END_DAYS

    return start_days, end_days


def create_deadline(db: Session, deadline: schemas.DeadlineCreate):
    db_deadline = models.Deadline(
        company_id=deadline.company_id,
        name=deadline.name,
        description=deadline.description,
        due_date=deadline.due_date,
        client_email=deadline.client_email,
        amount=deadline.amount,
        reminder_sent_at=deadline.reminder_sent_at,
        status=models.DeadlineStatus.PENDIENTE,
    )
    db.add(db_deadline)
    db.commit()
    db.refresh(db_deadline)
    return db_deadline


def get_deadlines_by_company(db: Session, company_id: int):
    return (
        db.query(models.Deadline)
        .filter(models.Deadline.company_id == company_id)
        .order_by(
            case(
                (models.Deadline.status == models.DeadlineStatus.PENDIENTE, 0),
                else_=1,
            ),
            models.Deadline.due_date.asc(),
        )
        .all()
    )


def get_deadline(db: Session, deadline_id: int):
    return db.query(models.Deadline).filter(models.Deadline.id == deadline_id).first()


def update_deadline(
    db: Session, deadline_id: int, deadline_data: schemas.DeadlineUpdate
):
    deadline = get_deadline(db, deadline_id)

    if not deadline:
        return None

    for key, value in deadline_data.model_dump(exclude_unset=True).items():
        setattr(deadline, key, value)

    db.commit()
    db.refresh(deadline)
    return deadline


def confirm_deadline(db: Session, deadline_id: int):
    deadline = get_deadline(db, deadline_id)

    if not deadline:
        return None

    deadline.status = models.DeadlineStatus.CUMPLIDO
    db.commit()
    db.refresh(deadline)
    return deadline


def delete_deadline(db: Session, deadline_id: int):
    deadline = get_deadline(db, deadline_id)

    if not deadline:
        return None

    db.delete(deadline)
    db.commit()
    return deadline


def _send_and_mark_reminder(db: Session, deadline: models.Deadline) -> bool:
    company = company_service.get_company(db, deadline.company_id)
    company_name = company.name if company else "Conexia"

    sent = send_reminder_email(
        to=deadline.client_email,
        company_name=company_name,
        deadline_name=deadline.name,
        description=deadline.description or "",
        due_date=deadline.due_date,
        amount=deadline.amount,
    )

    if not sent:
        logger.error("Failed to send reminder email for deadline %s", deadline.id)
        return False

    deadline.reminder_sent_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(deadline)
    logger.info("Reminder sent for deadline %s", deadline.id)
    return True


def send_pending_reminders(db: Session) -> int:
    today = date.today()
    start_days, end_days = _get_reminder_window_days(db)
    start_date = today + timedelta(days=start_days)
    end_date = today + timedelta(days=end_days)

    deadlines = (
        db.query(models.Deadline)
        .filter(
            models.Deadline.status == models.DeadlineStatus.PENDIENTE,
            models.Deadline.reminder_sent_at.is_(None),
            models.Deadline.due_date.between(start_date, end_date),
        )
        .order_by(models.Deadline.due_date.asc())
        .all()
    )

    sent_count = 0

    for deadline in deadlines:
        try:
            if _send_and_mark_reminder(db, deadline):
                sent_count += 1
        except Exception:
            db.rollback()
            logger.exception(
                "Unexpected failure sending reminder for deadline %s",
                deadline.id,
            )

    return sent_count
