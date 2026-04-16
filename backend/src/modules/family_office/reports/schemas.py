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
