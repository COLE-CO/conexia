from sqlalchemy.orm import Session

from . import models, schemas, security


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not security.verify_password(password, user.hashed_password):
        return False
    return user


def update_user_profile(
    db: Session, user: models.User, profile_data: schemas.UserProfileUpdate
):
    user.full_name = profile_data.full_name
    user.email = profile_data.email
    user.alert_deadlines_enabled = profile_data.alert_deadlines_enabled
    user.alert_balances_enabled = profile_data.alert_balances_enabled
    user.alert_reports_enabled = profile_data.alert_reports_enabled
    user.reminder_window_start_days = profile_data.reminder_window_start_days
    user.reminder_window_end_days = profile_data.reminder_window_end_days

    db.commit()
    db.refresh(user)
    return user
