from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from .models import CashMovementType


class CashAccountBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=300)


class CashAccountCreate(CashAccountBase):
    initial_balance: Decimal = Field(..., ge=0)


class CashAccountResponse(CashAccountBase):
    id: int
    current_balance: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CashMovementCreate(BaseModel):
    concept: str = Field(..., min_length=2, max_length=120)
    description: str = Field(..., min_length=2, max_length=500)
    amount: Decimal = Field(..., gt=0)
    movement_date: date
    movement_type: CashMovementType
    account_id: int


class CashMovementResponse(BaseModel):
    id: int
    concept: str
    description: str
    amount: Decimal
    movement_date: date
    movement_type: CashMovementType
    account_id: int
    account_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MonthlySummaryResponse(BaseModel):
    account_id: int
    account_name: str
    year: int
    month: int
    opening_balance: Decimal
    total_income: Decimal
    total_expenses: Decimal
    closing_balance: Decimal
    is_closed: bool
    closed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class MonthlyCloseRequest(BaseModel):
    account_id: int
    year: int = Field(..., ge=2020, le=2100)
    month: int = Field(..., ge=1, le=12)


class MonthlyClosingResponse(BaseModel):
    id: int
    account_id: int
    year: int
    month: int
    opening_balance: Decimal
    total_income: Decimal
    total_expenses: Decimal
    closing_balance: Decimal
    is_closed: bool
    closed_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
