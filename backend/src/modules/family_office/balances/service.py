import os
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy import extract
from src.modules.family_office.companies import service as company_service
from . import models
from .storage import generate_storage_key, upload_file_to_s3, delete_file_from_s3, generate_presigned_download_url

ALLOWED_EXTENSIONS = {".pdf", ".xlsx", ".xls"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB


def upload_balance(
    db: Session,
    file: UploadFile,
    company_id: int,
    year: int,
    month: int | None = None
):
    # Validar empresa existente
    company = company_service.get_company(db, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La empresa seleccionada no existe"
        )

    # Validar extensión
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no tiene un nombre válido"
        )

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de archivo no permitido"
        )

    # Validar tamaño del archivo
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo excede el tamaño máximo permitido de 15 MB"
        )

    # Generar ruta en S3
    storage_key = generate_storage_key(company_id, year, file.filename)

    # Subir archivo a S3
    upload_file_to_s3(file.file, storage_key, file.content_type or "application/octet-stream")

    # Guardar metadata en DB
    db_balance = models.Balance(
        company_id=company_id,
        original_filename=file.filename,
        storage_key=storage_key,
        file_type=extension,
        file_size=file_size,
        year=year,
        month=month
    )

    db.add(db_balance)
    db.commit()
    db.refresh(db_balance)

    return db_balance


def get_balances_by_company(
    db: Session,
    company_id: int,
    year: int | None = None,
    month: int | None = None,
    day: int | None = None,
    search: str | None = None
):
    query = db.query(models.Balance).filter(models.Balance.company_id == company_id)

    if year is not None:
        query = query.filter(models.Balance.year == year)

    if month is not None:
        query = query.filter(models.Balance.month == month)

    if day is not None:
        query = query.filter(extract("day", models.Balance.uploaded_at) == day)

    if search:
        query = query.filter(models.Balance.original_filename.ilike(f"%{search}%"))

    return query.order_by(models.Balance.uploaded_at.desc()).all()


def get_balance(db: Session, balance_id: int):
    return db.query(models.Balance).filter(models.Balance.id == balance_id).first()


def delete_balance(db: Session, balance_id: int):
    balance = get_balance(db, balance_id)

    if not balance:
        return None

    # Borrar archivo en S3
    delete_file_from_s3(balance.storage_key)

    # Borrar registro en DB
    db.delete(balance)
    db.commit()

    return balance


def get_balance_download_url(db: Session, balance_id: int):
    balance = get_balance(db, balance_id)

    if not balance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Balance no encontrado"
        )

    download_url = generate_presigned_download_url(
        storage_key=balance.storage_key,
        original_filename=balance.original_filename
    )

    return {
        "download_url": download_url
    }