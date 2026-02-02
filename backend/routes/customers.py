from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlmodel import Session, select
from database import get_session
from models.customer import Customer, CustomerCreate, CustomerUpdate

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("/", response_model=List[Customer])
async def get_all_customers(session: Session = Depends(get_session)):
    """Get all customers."""
    return session.exec(select(Customer)).all()


@router.get("/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, session: Session = Depends(get_session)):
    """Get a specific customer by ID."""
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/", response_model=Customer, status_code=201)
async def create_customer(customer_data: CustomerCreate, session: Session = Depends(get_session)):
    """Create a new customer."""
    customer = Customer.model_validate(customer_data)
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer


@router.put("/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_data: CustomerUpdate, session: Session = Depends(get_session)):
    """Update an existing customer."""
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer_data_dict = customer_data.model_dump(exclude_unset=True)
    for key, value in customer_data_dict.items():
        setattr(customer, key, value)
    
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(customer_id: str, session: Session = Depends(get_session)):
    """Delete a customer."""
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    session.delete(customer)
    session.commit()
    return None
