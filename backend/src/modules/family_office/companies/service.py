from sqlalchemy.orm import Session
from . import models, schemas


def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def get_companies(db: Session):
    return db.query(models.Company).all()


def get_company(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()


def update_company(db: Session, company_id: int, company_data: schemas.CompanyUpdate):
    company = get_company(db, company_id)

    if not company:
        return None

    for key, value in company_data.model_dump().items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)

    return company


def delete_company(db: Session, company_id: int):
    company = get_company(db, company_id)

    if not company:
        return None

    db.delete(company)
    db.commit()

    return company