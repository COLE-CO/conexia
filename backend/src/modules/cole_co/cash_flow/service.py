from datetime import date
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func as sa_func
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

    closing = (
        db.query(models.CashMonthlyClosing)
        .filter(
            models.CashMonthlyClosing.account_id == payload.account_id,
            models.CashMonthlyClosing.year == payload.movement_date.year,
            models.CashMonthlyClosing.month == payload.movement_date.month,
            models.CashMonthlyClosing.is_closed.is_(True),
        )
        .first()
    )
    if closing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pueden registrar movimientos en un mes cerrado",
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


def _compute_opening_balance(
    db: Session, account: models.CashAccount, year: int, month: int
) -> Decimal:
    if month == 1:
        prev_year, prev_month = year - 1, 12
    else:
        prev_year, prev_month = year, month - 1

    prev_closing = (
        db.query(models.CashMonthlyClosing)
        .filter(
            models.CashMonthlyClosing.account_id == account.id,
            models.CashMonthlyClosing.year == prev_year,
            models.CashMonthlyClosing.month == prev_month,
            models.CashMonthlyClosing.is_closed.is_(True),
        )
        .first()
    )
    if prev_closing:
        return prev_closing.closing_balance

    first_of_month = date(year, month, 1)

    total_income_all = (
        db.query(sa_func.coalesce(sa_func.sum(models.CashMovement.amount), 0))
        .filter(
            models.CashMovement.account_id == account.id,
            models.CashMovement.movement_type == models.CashMovementType.INGRESO,
        )
        .scalar()
    )
    total_expense_all = (
        db.query(sa_func.coalesce(sa_func.sum(models.CashMovement.amount), 0))
        .filter(
            models.CashMovement.account_id == account.id,
            models.CashMovement.movement_type == models.CashMovementType.EGRESO,
        )
        .scalar()
    )
    initial_balance = account.current_balance - total_income_all + total_expense_all

    income_before = (
        db.query(sa_func.coalesce(sa_func.sum(models.CashMovement.amount), 0))
        .filter(
            models.CashMovement.account_id == account.id,
            models.CashMovement.movement_type == models.CashMovementType.INGRESO,
            models.CashMovement.movement_date < first_of_month,
        )
        .scalar()
    )
    expense_before = (
        db.query(sa_func.coalesce(sa_func.sum(models.CashMovement.amount), 0))
        .filter(
            models.CashMovement.account_id == account.id,
            models.CashMovement.movement_type == models.CashMovementType.EGRESO,
            models.CashMovement.movement_date < first_of_month,
        )
        .scalar()
    )

    return initial_balance + income_before - expense_before


def _compute_month_totals(
    db: Session, account_id: int, year: int, month: int
) -> tuple[Decimal, Decimal]:
    first_of_month = date(year, month, 1)
    if month == 12:
        first_of_next = date(year + 1, 1, 1)
    else:
        first_of_next = date(year, month + 1, 1)

    total_income = (
        db.query(sa_func.coalesce(sa_func.sum(models.CashMovement.amount), 0))
        .filter(
            models.CashMovement.account_id == account_id,
            models.CashMovement.movement_type == models.CashMovementType.INGRESO,
            models.CashMovement.movement_date >= first_of_month,
            models.CashMovement.movement_date < first_of_next,
        )
        .scalar()
    )
    total_expenses = (
        db.query(sa_func.coalesce(sa_func.sum(models.CashMovement.amount), 0))
        .filter(
            models.CashMovement.account_id == account_id,
            models.CashMovement.movement_type == models.CashMovementType.EGRESO,
            models.CashMovement.movement_date >= first_of_month,
            models.CashMovement.movement_date < first_of_next,
        )
        .scalar()
    )
    return Decimal(total_income), Decimal(total_expenses)


def get_monthly_summary(db: Session, account_id: int, year: int, month: int):
    account = (
        db.query(models.CashAccount)
        .filter(models.CashAccount.id == account_id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La cuenta no existe",
        )

    existing = (
        db.query(models.CashMonthlyClosing)
        .filter(
            models.CashMonthlyClosing.account_id == account_id,
            models.CashMonthlyClosing.year == year,
            models.CashMonthlyClosing.month == month,
            models.CashMonthlyClosing.is_closed.is_(True),
        )
        .first()
    )
    if existing:
        return {
            "account_id": account_id,
            "account_name": account.name,
            "year": year,
            "month": month,
            "opening_balance": existing.opening_balance,
            "total_income": existing.total_income,
            "total_expenses": existing.total_expenses,
            "closing_balance": existing.closing_balance,
            "is_closed": True,
            "closed_at": existing.closed_at,
        }

    opening = _compute_opening_balance(db, account, year, month)
    total_income, total_expenses = _compute_month_totals(db, account_id, year, month)
    closing = opening + total_income - total_expenses

    return {
        "account_id": account_id,
        "account_name": account.name,
        "year": year,
        "month": month,
        "opening_balance": opening,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "closing_balance": closing,
        "is_closed": False,
        "closed_at": None,
    }


def close_month(db: Session, account_id: int, year: int, month: int, user_id: int):
    account = (
        db.query(models.CashAccount)
        .with_for_update()
        .filter(models.CashAccount.id == account_id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La cuenta no existe",
        )

    existing = (
        db.query(models.CashMonthlyClosing)
        .filter(
            models.CashMonthlyClosing.account_id == account_id,
            models.CashMonthlyClosing.year == year,
            models.CashMonthlyClosing.month == month,
            models.CashMonthlyClosing.is_closed.is_(True),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este mes ya se encuentra cerrado",
        )

    if month == 1:
        prev_year, prev_month = year - 1, 12
    else:
        prev_year, prev_month = year, month - 1

    earliest_movement = (
        db.query(sa_func.min(models.CashMovement.movement_date))
        .filter(models.CashMovement.account_id == account_id)
        .scalar()
    )

    if earliest_movement:
        earliest_year = earliest_movement.year
        earliest_month = earliest_movement.month
        prev_is_after_earliest = (prev_year > earliest_year) or (
            prev_year == earliest_year and prev_month >= earliest_month
        )

        if prev_is_after_earliest:
            prev_closing = (
                db.query(models.CashMonthlyClosing)
                .filter(
                    models.CashMonthlyClosing.account_id == account_id,
                    models.CashMonthlyClosing.year == prev_year,
                    models.CashMonthlyClosing.month == prev_month,
                    models.CashMonthlyClosing.is_closed.is_(True),
                )
                .first()
            )
            if not prev_closing:
                prev_label = f"{prev_month:02d}/{prev_year}"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Debe cerrar el mes anterior ({prev_label}) primero",
                )

    opening = _compute_opening_balance(db, account, year, month)
    total_income, total_expenses = _compute_month_totals(db, account_id, year, month)
    closing_balance = opening + total_income - total_expenses

    closing = models.CashMonthlyClosing(
        account_id=account_id,
        year=year,
        month=month,
        opening_balance=opening,
        total_income=total_income,
        total_expenses=total_expenses,
        closing_balance=closing_balance,
        is_closed=True,
        closed_at=sa_func.now(),
        closed_by_user_id=user_id,
    )

    db.add(closing)
    db.commit()
    db.refresh(closing)
    return closing


def list_closings(db: Session, account_id: int):
    return (
        db.query(models.CashMonthlyClosing)
        .filter(models.CashMonthlyClosing.account_id == account_id)
        .order_by(
            models.CashMonthlyClosing.year.desc(),
            models.CashMonthlyClosing.month.desc(),
        )
        .all()
    )
