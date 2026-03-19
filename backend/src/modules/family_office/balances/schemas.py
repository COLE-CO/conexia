from datetime import datetime

from pydantic import BaseModel


class BalanceResponse(BaseModel):
    id: int
    company_id: int
    original_filename: str
    storage_key: str
    file_type: str
    file_size: int
    year: int
    month: int | None = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


class BalanceDownloadResponse(BaseModel):
    download_url: str
