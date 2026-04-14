import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import relationship

from src.core.database import Base


class CashMovementType(str, enum.Enum):
    INGRESO = "ingreso"
    EGRESO = "egreso"


class CashAccount(Base):
    __tablename__ = "cash_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)
    current_balance = Column(Numeric(14, 2), nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    movements = relationship(
        "CashMovement",
        back_populates="account",
        cascade="save-update, merge",
        passive_deletes=True,
    )


class CashMovement(Base):
    __tablename__ = "cash_movements"

    id = Column(Integer, primary_key=True, index=True)
    concept = Column(String, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    movement_date = Column(Date, nullable=False)
    movement_type = Column(
        SqlEnum(
            CashMovementType, values_callable=lambda values: [v.value for v in values]
        ),
        nullable=False,
    )
    account_id = Column(
        Integer,
        ForeignKey("cash_accounts.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    account = relationship("CashAccount", back_populates="movements")

    @property
    def account_name(self) -> str:
        return self.account.name
