import io
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.core.config import settings
from src.modules.family_office.balances import service as balance_service
from src.modules.family_office.balances.storage import (
    generate_presigned_download_url,
    get_s3_client,
)
from src.modules.family_office.companies import service as company_service

from . import schemas
from .ai_classifier import classify_balance
from .extractor import extract_balance_content
from .model import SavedReport
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
    response = s3.get_object(Bucket=settings.AWS_BUCKET_NAME, Key=storage_key)
    return response["Body"].read()


def _upload_pdf_to_s3(pdf_buffer: io.BytesIO, storage_key: str) -> None:
    s3 = get_s3_client()
    pdf_buffer.seek(0)
    s3.upload_fileobj(
        pdf_buffer,
        settings.AWS_BUCKET_NAME,
        storage_key,
        ExtraArgs={"ContentType": "application/pdf"},
    )


def _delete_from_s3(storage_key: str) -> None:
    s3 = get_s3_client()
    s3.delete_object(Bucket=settings.AWS_BUCKET_NAME, Key=storage_key)


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

    file_bytes = _download_from_s3(balance.storage_key)
    extracted_text = extract_balance_content(file_bytes, balance.file_type)
    if not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El balance no contiene datos que se puedan analizar.",
        )

    try:
        ai_result = classify_balance(extracted_text, company_name, period)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="El servicio de IA no pudo procesar el balance. Intenta de nuevo.",
        ) from err

    items = [schemas.LineItem(**item) for item in ai_result.get("items", [])]

    snapshot_raw = ai_result.get("snapshot") or {}
    snapshot = schemas.FinancialSnapshot(**snapshot_raw) if snapshot_raw else None

    total_income = ai_result.get("total_income", 0) or 0
    total_expenses = ai_result.get("total_expenses", 0) or 0
    net_result = ai_result.get("net_result", 0) or 0

    return schemas.ReportData(
        company_name=company_name,
        period=period,
        items=items,
        total_income=total_income,
        total_expenses=total_expenses,
        net_result=net_result,
        ai_summary=ai_result.get("ai_summary", ""),
        snapshot=snapshot,
        ratios=_compute_ratios(snapshot, total_income, net_result),
        findings=ai_result.get("findings") or [],
        recommendations=ai_result.get("recommendations") or [],
    )


def _safe_div(num: float | None, den: float | None) -> float | None:
    if num is None or den in (None, 0):
        return None
    return num / den


def _compute_ratios(
    snapshot: schemas.FinancialSnapshot | None,
    total_income: float,
    net_result: float,
) -> schemas.FinancialRatios | None:
    if snapshot is None:
        return None
    working_capital = (
        snapshot.current_assets - snapshot.current_liabilities
        if snapshot.current_assets is not None
        and snapshot.current_liabilities is not None
        else None
    )
    return schemas.FinancialRatios(
        current_ratio=_safe_div(
            snapshot.current_assets, snapshot.current_liabilities
        ),
        debt_ratio=_safe_div(snapshot.total_liabilities, snapshot.total_assets),
        equity_ratio=_safe_div(snapshot.equity, snapshot.total_assets),
        net_margin=_safe_div(net_result, total_income) if total_income else None,
        working_capital=working_capital,
    )


def generate_pdf(data: schemas.GeneratePDFRequest) -> io.BytesIO:
    return generate_report_pdf(data)


def save_report(db: Session, data: schemas.SaveReportRequest) -> SavedReport:
    # Generar y subir PDF a S3
    pdf_request = schemas.GeneratePDFRequest(
        company_name=data.company_name,
        company_nit=data.company_nit,
        period=data.period,
        items=data.items,
        total_income=data.total_income,
        total_expenses=data.total_expenses,
        net_result=data.net_result,
        ai_summary=data.ai_summary,
        snapshot=data.snapshot,
        ratios=data.ratios
        or _compute_ratios(data.snapshot, data.total_income, data.net_result),
        findings=data.findings,
        recommendations=data.recommendations,
    )
    pdf_buffer = generate_report_pdf(pdf_request)

    safe_company = data.company_name.replace(" ", "_")
    safe_period = data.period.replace(" ", "_")
    pdf_filename = f"reporte_{safe_company}_{safe_period}.pdf"
    storage_key = f"reports/{data.company_id}/{uuid.uuid4()}/{pdf_filename}"

    _upload_pdf_to_s3(pdf_buffer, storage_key)

    report = SavedReport(
        company_id=data.company_id,
        balance_id=data.balance_id,
        company_name=data.company_name,
        period=data.period,
        ai_summary=data.ai_summary,
        total_income=data.total_income,
        total_expenses=data.total_expenses,
        net_result=data.net_result,
        storage_key=storage_key,
        pdf_filename=pdf_filename,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_saved_reports_by_company(db: Session, company_id: int) -> list[SavedReport]:
    return (
        db.query(SavedReport)
        .filter(SavedReport.company_id == company_id)
        .order_by(SavedReport.created_at.desc())
        .all()
    )


def get_report_download_url(db: Session, report_id: int) -> str:
    report = db.query(SavedReport).filter(SavedReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reporte no encontrado",
        )
    return generate_presigned_download_url(report.storage_key, report.pdf_filename)


def delete_saved_report(db: Session, report_id: int) -> SavedReport | None:
    report = db.query(SavedReport).filter(SavedReport.id == report_id).first()
    if not report:
        return None
    _delete_from_s3(report.storage_key)
    db.delete(report)
    db.commit()
    return report


def get_all_saved_reports(db: Session) -> list[SavedReport]:
    return db.query(SavedReport).order_by(SavedReport.created_at.desc()).all()
