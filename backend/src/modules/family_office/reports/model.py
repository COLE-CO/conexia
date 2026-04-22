from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, func

from src.core.database import Base


class SavedReport(Base):
    __tablename__ = "saved_reports"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    balance_id = Column(
        Integer, ForeignKey("balances.id", ondelete="SET NULL"), nullable=True
    )

    company_name = Column(String, nullable=False)
    period = Column(String, nullable=False)
    ai_summary = Column(Text, nullable=False)

    total_income = Column(Float, nullable=False, default=0)
    total_expenses = Column(Float, nullable=False, default=0)
    net_result = Column(Float, nullable=False, default=0)

    # PDF guardado en S3
    storage_key = Column(String, nullable=False)
    pdf_filename = Column(String, nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
