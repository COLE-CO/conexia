from pydantic import BaseModel


class CompanyBase(BaseModel):
    name: str
    nit: str | None = None
    logo_url: str | None = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(CompanyBase):
    pass


class CompanyResponse(CompanyBase):
    id: int

    class Config:
        from_attributes = True