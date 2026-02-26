from sqlalchemy import Column, Integer, String, Boolean, Enum as SqlEnum
import enum
from src.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CONTADOR_COLE_CO = "contador_cole_co"
    CONTADOR_FAMILY_OFFICE = "contador_family_office"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(SqlEnum(UserRole), default=UserRole.CONTADOR_COLE_CO, nullable=False)
    is_active = Column(Boolean, default=True)
