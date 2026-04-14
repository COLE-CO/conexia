import io

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.modules.family_office.balances import service as balance_service
from src.modules.family_office.balances.storage import get_s3_client
from src.modules.family_office.companies import service as company_service

from . import schemas
from .ai_classifier import classify_balance
from .extractor import extract_balance_content
from .pdf_generator import generate_report_pdf

MONTH_NAMES = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
}


def _build_period(year: int, month: int | None) -> str:
    if month and month in MONTH_NAMES:
        return f"{MONTH_NAMES[month]} {year}"
    return str(year)


def _download_from_s3(storage_key: str) -> bytes:
    s3 = get_s3_client()
    from src.core.config import settings

    response = s3.get_object(Bucket=settings.AWS_BUCKET_NAME, Key=storage_key)
    return response["Body"].read()


def generate_ai_report(db: Session, balance_id: int) -> schemas.ReportData:
    balance = balance_service.get_balance(db, balance_id)
    if not balance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Balance no encontrado",
        )

    company = company_service.get_company(db, balance.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada",
        )

    company_name = company.name
    period = _build_period(balance.year, balance.month)

    # Download file from S3
    file_bytes = _download_from_s3(balance.storage_key)

    # Extract content
    extracted_text = extract_balance_content(file_bytes, balance.file_type)
    if not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El balance no contiene datos que se puedan analizar.",
        )

    # Classify with AI
    try:
        ai_result = classify_balance(extracted_text, company_name, period)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="El servicio de IA no pudo procesar el balance. Intenta de nuevo.",
        ) from err

    items = [schemas.LineItem(**item) for item in ai_result.get("items", [])]

    return schemas.ReportData(
        company_name=company_name,
        period=period,
        items=items,
        total_income=ai_result.get("total_income", 0),
        total_expenses=ai_result.get("total_expenses", 0),
        net_result=ai_result.get("net_result", 0),
        ai_summary=ai_result.get("ai_summary", ""),
    )


def generate_pdf(data: schemas.GeneratePDFRequest) -> io.BytesIO:
    return generate_report_pdf(data)
