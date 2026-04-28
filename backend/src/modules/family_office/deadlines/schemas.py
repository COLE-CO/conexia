from datetime import date, datetime

from pydantic import BaseModel

from .models import DeadlineStatus


class DeadlineBase(BaseModel):
    name: str
    description: str | None = None
    due_date: date
    client_email: str
    amount: str | None = None
    reminder_sent_at: datetime | None = None


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


class DeadlineResponse(DeadlineBase):
    id: int
    company_id: int
    status: DeadlineStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
