from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from . import models, schemas


def list_accounts(db: Session):
    return db.query(models.CashAccount).order_by(models.CashAccount.name.asc()).all()


def create_account(db: Session, payload: schemas.CashAccountCreate):
    existing = (
        db.query(models.CashAccount)
        .filter(models.CashAccount.name.ilike(payload.name.strip()))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con ese nombre",
        )

    account = models.CashAccount(
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        current_balance=payload.initial_balance,
    )

    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def list_movements(db: Session):
    return (
        db.query(models.CashMovement)
        .options(joinedload(models.CashMovement.account))
        .order_by(
            models.CashMovement.movement_date.desc(), models.CashMovement.id.desc()
        )
        .all()
    )


def create_movement(db: Session, payload: schemas.CashMovementCreate):
    account = (
        db.query(models.CashAccount)
        .with_for_update()
        .filter(models.CashAccount.id == payload.account_id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La cuenta seleccionada no existe",
        )

    amount = Decimal(payload.amount)

    if (
        payload.movement_type == models.CashMovementType.EGRESO
        and account.current_balance < amount
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Saldo insuficiente para registrar el egreso",
        )

    movement = models.CashMovement(
        concept=payload.concept.strip(),
        description=payload.description.strip(),
        amount=amount,
        movement_date=payload.movement_date,
        movement_type=payload.movement_type,
        account_id=payload.account_id,
    )

    if payload.movement_type == models.CashMovementType.INGRESO:
        account.current_balance = account.current_balance + amount
    else:
        account.current_balance = account.current_balance - amount

    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement
