import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy import (
    Enum as SqlEnum,
)

from src.core.database import Base


class DeadlineStatus(str, enum.Enum):
    PENDIENTE = "pendiente"
    CUMPLIDO = "cumplido"


class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(Date, nullable=False)
    client_email = Column(String, nullable=False)
    amount = Column(String, nullable=True)
    reminder_sent_at = Column(DateTime(timezone=True), nullable=True)
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

    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
