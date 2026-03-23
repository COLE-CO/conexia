from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from src.core.database import Base


class Balance(Base):
    __tablename__ = "balances"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    original_filename = Column(String, nullable=False)
    storage_key = Column(String, nullable=False)

    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)

    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=True)

    uploaded_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
