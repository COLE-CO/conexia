from sqlalchemy.orm import Session

from . import models, schemas


def create_deadline(db: Session, deadline: schemas.DeadlineCreate):
    db_deadline = models.Deadline(
        company_id=deadline.company_id,
        name=deadline.name,
        description=deadline.description,
        due_date=deadline.due_date,
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
            models.Deadline.status.desc(),
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
