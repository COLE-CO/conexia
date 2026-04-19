import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy import Enum as SqlEnum

from src.core.database import Base


class PaymentStatus(str, enum.Enum):
    PENDIENTE = "pendiente"
    PAGADO = "pagado"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    concept = Column(String, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(
        SqlEnum(
            PaymentStatus, values_callable=lambda values: [v.value for v in values]
        ),
        default=PaymentStatus.PENDIENTE,
        nullable=False,
    )
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
