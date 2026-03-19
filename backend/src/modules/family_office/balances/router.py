from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.modules.auth import dependencies as auth_dependencies
from src.modules.auth import models as auth_models

from . import schemas, service

router = APIRouter(prefix="/balances", tags=["Balances"])


@router.post("/upload", response_model=schemas.BalanceResponse)
def upload_balance(
    company_id: int = Form(...),
    year: int = Form(...),
    month: int | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    ),
):
    return service.upload_balance(
        db=db, file=file, company_id=company_id, year=year, month=month
    )


@router.get("/company/{company_id}", response_model=list[schemas.BalanceResponse])
def get_balances_by_company(
    company_id: int,
    year: int | None = None,
    month: int | None = None,
    day: int | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    ),
):
    return service.get_balances_by_company(
        db=db, company_id=company_id, year=year, month=month, day=day, search=search
    )


@router.get("/{balance_id}", response_model=schemas.BalanceResponse)
def get_balance(
    balance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    ),
):
    balance = service.get_balance(db, balance_id)

    if not balance:
        raise HTTPException(status_code=404, detail="Balance no encontrado")

    return balance


@router.delete("/{balance_id}")
def delete_balance(
    balance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    ),
):
    balance = service.delete_balance(db, balance_id)

    if not balance:
        raise HTTPException(status_code=404, detail="Balance no encontrado")

    return {"message": "Balance eliminado correctamente"}


@router.get("/{balance_id}/download", response_model=schemas.BalanceDownloadResponse)
def download_balance(
    balance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        auth_dependencies.require_role(
            [auth_models.UserRole.ADMIN, auth_models.UserRole.CONTADOR_FAMILY_OFFICE]
        )
    ),
):
    return service.get_balance_download_url(db, balance_id)
