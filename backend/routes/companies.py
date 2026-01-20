from fastapi import APIRouter, HTTPException
from typing import List
from models.company import Company, CompanyCreate, CompanyUpdate
from storage.json_storage import JSONStorage

router = APIRouter(prefix="/api/companies", tags=["companies"])
storage = JSONStorage()

FILENAME = "companies.json"


@router.get("/", response_model=List[Company])
async def get_all_companies():
    """Get all companies."""
    data = storage.read_all(FILENAME)
    return data


@router.get("/{company_id}", response_model=Company)
async def get_company(company_id: str):
    """Get a specific company by ID."""
    company = storage.read_by_id(FILENAME, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.post("/", response_model=Company, status_code=201)
async def create_company(company_data: CompanyCreate):
    """Create a new company."""
    company = Company(**company_data.model_dump())
    created = storage.create(FILENAME, company.model_dump())
    return created


@router.put("/{company_id}", response_model=Company)
async def update_company(company_id: str, company_data: CompanyUpdate):
    """Update an existing company."""
    # Check if company exists
    existing = storage.read_by_id(FILENAME, company_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update with new data, keeping the same ID
    updated_company = Company(id=company_id, **company_data.model_dump())
    result = storage.update(FILENAME, company_id, updated_company.model_dump())
    
    if not result:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return result


@router.delete("/{company_id}", status_code=204)
async def delete_company(company_id: str):
    """Delete a company."""
    success = storage.delete(FILENAME, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return None
