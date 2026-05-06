from datetime import datetime

from pydantic import BaseModel


class LineItem(BaseModel):
    concept: str
    amount: float
    category: str  # "ingreso" | "gasto"
    subcategory: str


class FinancialSnapshot(BaseModel):
    """Saldos finales agregados extraídos del balance."""

    total_assets: float | None = None
    current_assets: float | None = None
    non_current_assets: float | None = None
    total_liabilities: float | None = None
    current_liabilities: float | None = None
    non_current_liabilities: float | None = None
    equity: float | None = None
    cash_and_equivalents: float | None = None
    accounts_receivable: float | None = None


class FinancialRatios(BaseModel):
    """Indicadores derivados del snapshot. Calculados en backend."""

    current_ratio: float | None = None  # Activo corriente / Pasivo corriente
    debt_ratio: float | None = None  # Pasivo total / Activo total
    equity_ratio: float | None = None  # Patrimonio / Activo total
    net_margin: float | None = None  # Resultado / Ingresos
    working_capital: float | None = None  # Activo cte - Pasivo cte


class ReportData(BaseModel):
    company_name: str
    period: str
    items: list[LineItem]
    total_income: float
    total_expenses: float
    net_result: float
    ai_summary: str
    snapshot: FinancialSnapshot | None = None
    ratios: FinancialRatios | None = None
    findings: list[str] = []
    recommendations: list[str] = []


class GenerateReportRequest(BaseModel):
    balance_id: int


class GeneratePDFRequest(BaseModel):
    company_name: str
    company_nit: str | None = None
    period: str
    items: list[LineItem]
    total_income: float
    total_expenses: float
    net_result: float
    ai_summary: str
    snapshot: FinancialSnapshot | None = None
    ratios: FinancialRatios | None = None
    findings: list[str] = []
    recommendations: list[str] = []


class SaveReportRequest(BaseModel):
    company_id: int
    balance_id: int | None = None
    company_name: str
    company_nit: str | None = None
    period: str
    ai_summary: str
    total_income: float
    total_expenses: float
    net_result: float
    items: list[LineItem]
    snapshot: FinancialSnapshot | None = None
    ratios: FinancialRatios | None = None
    findings: list[str] = []
    recommendations: list[str] = []


class SavedReportResponse(BaseModel):
    id: int
    company_id: int
    balance_id: int | None
    company_name: str
    period: str
    ai_summary: str
    total_income: float
    total_expenses: float
    net_result: float
    storage_key: str
    pdf_filename: str
    created_at: datetime

    class Config:
        from_attributes = True


class SavedReportDownloadResponse(BaseModel):
    url: str
