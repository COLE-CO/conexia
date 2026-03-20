import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Integer,
    String,
    func,
)

from src.core.database import Base


class DeadlineStatus(str, enum.Enum):
    PENDIENTE = "pendiente"
    CUMPLIDO = "cumplido"


class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(Date, nullable=False)
    status = Column(
        SqlEnum(DeadlineStatus, values_callable=lambda x: [e.value for e in x]),
        default=DeadlineStatus.PENDIENTE,
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
