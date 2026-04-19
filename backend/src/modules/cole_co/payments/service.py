from fastapi import HTTPException, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from . import models, schemas


def list_payments(db: Session):
    return (
        db.query(models.Payment)
        .order_by(
            case(
                (models.Payment.status == models.PaymentStatus.PENDIENTE, 0),
                else_=1,
            ),
            models.Payment.due_date.asc(),
        )
        .all()
    )


def create_payment(db: Session, payload: schemas.PaymentCreate):
    payment = models.Payment(
        concept=payload.concept.strip(),
        description=payload.description.strip(),
        amount=payload.amount,
        due_date=payload.due_date,
        status=models.PaymentStatus.PENDIENTE,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def _get_payment(db: Session, payment_id: int):
    payment = (
        db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    )
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El pago no existe",
        )
    return payment


def update_payment(db: Session, payment_id: int, payload: schemas.PaymentUpdate):
    payment = _get_payment(db, payment_id)

    if payment.status == models.PaymentStatus.PAGADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede editar un pago que ya fue marcado como pagado",
        )

    for key, value in payload.model_dump(exclude_unset=True).items():
        if isinstance(value, str):
            value = value.strip()
        setattr(payment, key, value)

    db.commit()
    db.refresh(payment)
    return payment


def mark_as_paid(db: Session, payment_id: int):
    payment = _get_payment(db, payment_id)

    if payment.status == models.PaymentStatus.PAGADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este pago ya fue marcado como pagado",
        )

    payment.status = models.PaymentStatus.PAGADO
    payment.paid_at = db.execute(func.now()).scalar()
    db.commit()
    db.refresh(payment)
    return payment


def delete_payment(db: Session, payment_id: int):
    payment = _get_payment(db, payment_id)
    db.delete(payment)
    db.commit()
    return payment
