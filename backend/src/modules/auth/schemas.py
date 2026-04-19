from pydantic import BaseModel, EmailStr

from .models import UserRole


# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: int | None = None


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    role: UserRole = UserRole.CONTADOR_COLE_CO


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    must_change_password: bool
    alert_deadlines_enabled: bool
    alert_balances_enabled: bool
    alert_reports_enabled: bool
    reminder_window_start_days: int
    reminder_window_end_days: int

    class Config:
        from_attributes = True


class PasswordChangeRequest(BaseModel):
    new_password: str


class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr
    alert_deadlines_enabled: bool
    alert_balances_enabled: bool
    alert_reports_enabled: bool
    reminder_window_start_days: int
    reminder_window_end_days: int
