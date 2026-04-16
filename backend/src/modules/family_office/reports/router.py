from fastapi import APIRouter, Depends
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
    request: schemas.GeneratePDFRequest,
    current_user=Depends(auth_dependencies.require_role(ALLOWED_ROLES)),
):
    pdf_buffer = service.generate_pdf(request)

    filename = f"Reporte_{request.company_name}_{request.period}.pdf"
    safe_filename = filename.replace('"', "").replace(" ", "_")

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
        },
    )
