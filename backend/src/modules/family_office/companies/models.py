from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from src.core.database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    nit = Column(String, nullable=True, unique=True)
    logo_url = Column(String, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    balances = relationship("Balance", cascade="all, delete-orphan", passive_deletes=True)
    deadlines = relationship("Deadline", cascade="all, delete-orphan", passive_deletes=True)