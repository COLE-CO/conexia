import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.modules.auth import dependencies as auth_dependencies
from src.modules.auth import models as auth_models

from . import schemas, service

router = APIRouter(prefix="/reports", tags=["Reports"])

ALLOWED_ROLES = [
    auth_models.UserRole.ADMIN,
    auth_models.UserRole.CONTADOR_FAMILY_OFFICE,
]


@router.post("/generate", response_model=schemas.ReportData)
def generate_report(
    request: schemas.GenerateReportRequest,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.generate_ai_report(db, request.balance_id)


@router.post("/export-pdf")
def export_pdf(
    data: schemas.GeneratePDFRequest,
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    pdf_buffer: io.BytesIO = service.generate_pdf(data)
    pdf_buffer.seek(0)

    safe_company = data.company_name.replace(" ", "_")
    safe_period = data.period.replace(" ", "_")
    filename = f"reporte_{safe_company}_{safe_period}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/save", response_model=schemas.SavedReportResponse)
def save_report(
    data: schemas.SaveReportRequest,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.save_report(db, data)


@router.get("/company/{company_id}", response_model=list[schemas.SavedReportResponse])
def get_saved_reports(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.get_saved_reports_by_company(db, company_id)


@router.get("/{report_id}/download", response_model=schemas.SavedReportDownloadResponse)
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    url = service.get_report_download_url(db, report_id)
    return {"url": url}


@router.get("/all", response_model=list[schemas.SavedReportResponse])
def get_all_saved_reports(
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    return service.get_all_saved_reports(db)


@router.delete("/{report_id}")
def delete_saved_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    report = service.delete_saved_report(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return {"message": "Reporte eliminado correctamente"}
