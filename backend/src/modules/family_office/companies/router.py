from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.modules.auth import dependencies as auth_dependencies, models as auth_models
from . import schemas, service

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("/", response_model=schemas.CompanyResponse)
def create_company(
    company: schemas.CompanyCreate,
    db: Session = Depends(get_db),
    current_user = Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    )
):
    return service.create_company(db, company)


@router.get("/", response_model=list[schemas.CompanyResponse])
def get_companies(
    db: Session = Depends(get_db),
    current_user = Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    )
):
    return service.get_companies(db)


@router.put("/{company_id}", response_model=schemas.CompanyResponse)
def update_company(
    company_id: int,
    company: schemas.CompanyUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    )
):
    updated = service.update_company(db, company_id, company)

    if not updated:
        raise HTTPException(status_code=404, detail="Company not found")

    return updated


@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    )
):
    deleted = service.delete_company(db, company_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Company not found")

    return {"message": "Company deleted successfully"}

@router.get("/{company_id}", response_model=schemas.CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    )
):
    company = service.get_company(db, company_id)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    return company