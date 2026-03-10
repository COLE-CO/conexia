from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from src.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    nit = Column(String, nullable=True)

    logo_url = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))