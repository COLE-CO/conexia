from datetime import datetime

from pydantic import BaseModel


class LineItem(BaseModel):
    concept: str
    amount: float
    category: str  # "ingreso" | "gasto"
    subcategory: str


class ReportData(BaseModel):
    company_name: str
    period: str
    items: list[LineItem]
    total_income: float
    total_expenses: float
    net_result: float
    ai_summary: str


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