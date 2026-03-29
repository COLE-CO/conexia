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
