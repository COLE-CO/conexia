from datetime import date, datetime

from pydantic import BaseModel

from .models import DeadlineSource, DeadlineStatus, ObligationType


class DeadlineBase(BaseModel):
    name: str
    description: str | None = None
    due_date: date
    client_email: str | None = None
    amount: str | None = None
    reminder_sent_at: datetime | None = None
    obligation_type: ObligationType | None = None
    period_label: str | None = None


class DeadlineCreate(DeadlineBase):
    company_id: int


class DeadlineUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    due_date: date | None = None
    client_email: str | None = None
    amount: str | None = None
    reminder_sent_at: datetime | None = None
    status: DeadlineStatus | None = None
    obligation_type: ObligationType | None = None
    period_label: str | None = None


class DeadlineResponse(DeadlineBase):
    id: int
    company_id: int
    status: DeadlineStatus
    source: DeadlineSource
    proof_filename: str | None = None
    proof_content_type: str | None = None
    proof_file_size: int | None = None
    proof_uploaded_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DeadlineProofDownload(BaseModel):
    url: str
    filename: str


class CalendarImportSummary(BaseModel):
    created: int
    skipped: int
    unmatched_companies: list[str]
