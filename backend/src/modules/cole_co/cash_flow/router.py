from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.modules.auth import dependencies as auth_dependencies
from src.modules.auth import models as auth_models

from . import schemas, service

router = APIRouter(prefix="/cash-flow", tags=["Cash Flow"])

ALLOWED_ROLES = [
    auth_models.UserRole.ADMIN,
]


@router.get("/accounts", response_model=list[schemas.CashAccountResponse])
def get_cash_accounts(
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.list_accounts(db)


@router.post(
    "/accounts",
    response_model=schemas.CashAccountResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_cash_account(
    payload: schemas.CashAccountCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.create_account(db, payload)


@router.get("/movements", response_model=list[schemas.CashMovementResponse])
def get_cash_movements(
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.list_movements(db)


@router.post(
    "/movements",
    response_model=schemas.CashMovementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_cash_movement(
    payload: schemas.CashMovementCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.create_movement(db, payload)


@router.get(
    "/monthly-summary",
    response_model=schemas.MonthlySummaryResponse,
)
def get_monthly_summary(
    account_id: int,
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.get_monthly_summary(db, account_id, year, month)


@router.post(
    "/monthly-close",
    response_model=schemas.MonthlyClosingResponse,
    status_code=status.HTTP_201_CREATED,
)
def close_month(
    payload: schemas.MonthlyCloseRequest,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.close_month(
        db, payload.account_id, payload.year, payload.month, current_user.id
    )


@router.get(
    "/monthly-closings",
    response_model=list[schemas.MonthlyClosingResponse],
)
def get_monthly_closings(
    account_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.list_closings(db, account_id)
