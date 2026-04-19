from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.modules.auth import dependencies as auth_dependencies
from src.modules.auth import models as auth_models

from . import schemas, service

router = APIRouter(prefix="/payments", tags=["Payments"])

ALLOWED_ROLES = [
    auth_models.UserRole.ADMIN,
    auth_models.UserRole.CONTADOR_COLE_CO,
]


@router.get("/", response_model=list[schemas.PaymentResponse])
def get_payments(
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.list_payments(db)


@router.post(
    "/",
    response_model=schemas.PaymentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    payload: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.create_payment(db, payload)


@router.put("/{payment_id}", response_model=schemas.PaymentResponse)
def update_payment(
    payment_id: int,
    payload: schemas.PaymentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.update_payment(db, payment_id, payload)


@router.patch("/{payment_id}/mark-paid", response_model=schemas.PaymentResponse)
def mark_payment_as_paid(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.mark_as_paid(db, payment_id)


@router.delete("/{payment_id}", status_code=status.HTTP_200_OK)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    service.delete_payment(db, payment_id)
    return {"message": "Pago eliminado correctamente"}
