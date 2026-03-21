from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.modules.auth import dependencies as auth_dependencies
from src.modules.auth import models as auth_models

from . import schemas, service

router = APIRouter(prefix="/deadlines", tags=["Deadlines"])

ALLOWED_ROLES = [
    auth_models.UserRole.ADMIN,
    auth_models.UserRole.CONTADOR_FAMILY_OFFICE,
]


@router.post(
    "/",
    response_model=schemas.DeadlineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_deadline(
    deadline: schemas.DeadlineCreate,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.create_deadline(db, deadline)


@router.get("/company/{company_id}", response_model=list[schemas.DeadlineResponse])
def get_deadlines_by_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.get_deadlines_by_company(db, company_id)


@router.get("/{deadline_id}", response_model=schemas.DeadlineResponse)
def get_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    deadline = service.get_deadline(db, deadline_id)
    if not deadline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vencimiento no encontrado",
        )
    return deadline


@router.put("/{deadline_id}", response_model=schemas.DeadlineResponse)
def update_deadline(
    deadline_id: int,
    deadline_data: schemas.DeadlineUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    updated = service.update_deadline(db, deadline_id, deadline_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vencimiento no encontrado",
        )
    return updated


@router.patch("/{deadline_id}/confirm", response_model=schemas.DeadlineResponse)
def confirm_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    confirmed = service.confirm_deadline(db, deadline_id)
    if not confirmed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vencimiento no encontrado",
        )
    return confirmed


@router.delete("/{deadline_id}", status_code=status.HTTP_200_OK)
def delete_deadline(
    deadline_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    deleted = service.delete_deadline(db, deadline_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vencimiento no encontrado",
        )
    return {"message": "Vencimiento eliminado correctamente"}
