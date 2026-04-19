from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from .models import PaymentStatus


class PaymentCreate(BaseModel):
    concept: str = Field(..., min_length=2, max_length=120)
    description: str = Field(..., min_length=2, max_length=500)
    amount: Decimal = Field(..., gt=0)
    due_date: date


class PaymentUpdate(BaseModel):
    concept: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, min_length=2, max_length=500)
    amount: Decimal | None = Field(default=None, gt=0)
    due_date: date | None = None


class PaymentResponse(BaseModel):
    id: int
    concept: str
    description: str
    amount: Decimal
    due_date: date
    status: PaymentStatus
    paid_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
