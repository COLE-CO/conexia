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


class DeadlineSource(str, enum.Enum):
    MANUAL = "manual"
    CALENDAR_DIAN_2026 = "calendar_dian_2026"


class ObligationType(str, enum.Enum):
    RETENCION = "retencion"
    IVA_BIMESTRAL = "iva_bimestral"
    IVA_CUATRIMESTRAL = "iva_cuatrimestral"
    ANTICIPO_RST = "anticipo_rst"
    RENTA_PJ = "renta_pj"
    EXOGENA = "exogena"
    MEDIOS_MAGNETICOS = "medios_magneticos"
    SUPERSOCIEDADES = "supersociedades"
    PATRIMONIO = "patrimonio"
    ICA_MEDELLIN = "ica_medellin"
    ICA_ENVIGADO = "ica_envigado"
    ICA_ARMENIA = "ica_armenia"
    ICA_RIOHACHA = "ica_riohacha"


class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(Date, nullable=False)
    client_email = Column(String, nullable=True)
    amount = Column(String, nullable=True)
    reminder_sent_at = Column(DateTime(timezone=True), nullable=True)
    proof_storage_key = Column(String, nullable=True)
    proof_filename = Column(String, nullable=True)
    proof_content_type = Column(String, nullable=True)
    proof_file_size = Column(Integer, nullable=True)
    proof_uploaded_at = Column(DateTime(timezone=True), nullable=True)
    obligation_type = Column(String, nullable=True, index=True)
    period_label = Column(String, nullable=True)
    source = Column(
        String, nullable=False, default=DeadlineSource.MANUAL.value, index=True
    )
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
