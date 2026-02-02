from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlmodel import Session, select
from database import get_session
from models.company import Company, CompanyCreate, CompanyUpdate

router = APIRouter(prefix="/api/companies", tags=["companies"])


@router.get("/", response_model=List[Company])
async def get_all_companies(session: Session = Depends(get_session)):
    """Get all companies."""
    return session.exec(select(Company)).all()


@router.get("/{company_id}", response_model=Company)
async def get_company(company_id: str, session: Session = Depends(get_session)):
    """Get a specific company by ID."""
    company = session.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.post("/", response_model=Company, status_code=201)
async def create_company(company_data: CompanyCreate, session: Session = Depends(get_session)):
    """Create a new company."""
    company = Company.model_validate(company_data)
    session.add(company)
    session.commit()
    session.refresh(company)
    return company


@router.put("/{company_id}", response_model=Company)
async def update_company(company_id: str, company_data: CompanyUpdate, session: Session = Depends(get_session)):
    """Update an existing company."""
    company = session.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company_data_dict = company_data.model_dump(exclude_unset=True)
    for key, value in company_data_dict.items():
        setattr(company, key, value)
    
    session.add(company)
    session.commit()
    session.refresh(company)
    return company


@router.delete("/{company_id}", status_code=204)
async def delete_company(company_id: str, session: Session = Depends(get_session)):
    """Delete a company."""
    company = session.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    session.delete(company)
    session.commit()
    return None
