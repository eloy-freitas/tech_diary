from fastapi import APIRouter, HTTPException
from typing import List
from models.customer import Customer, CustomerCreate, CustomerUpdate
from storage.json_storage import JSONStorage

router = APIRouter(prefix="/api/customers", tags=["customers"])
storage = JSONStorage()

FILENAME = "customers.json"


@router.get("/", response_model=List[Customer])
async def get_all_customers():
    """Get all customers."""
    data = storage.read_all(FILENAME)
    return data


@router.get("/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    """Get a specific customer by ID."""
    customer = storage.read_by_id(FILENAME, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/", response_model=Customer, status_code=201)
async def create_customer(customer_data: CustomerCreate):
    """Create a new customer."""
    customer = Customer(**customer_data.model_dump())
    created = storage.create(FILENAME, customer.model_dump())
    return created


@router.put("/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_data: CustomerUpdate):
    """Update an existing customer."""
    # Check if customer exists
    existing = storage.read_by_id(FILENAME, customer_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update with new data, keeping the same ID
    updated_customer = Customer(id=customer_id, **customer_data.model_dump())
    result = storage.update(FILENAME, customer_id, updated_customer.model_dump())
    
    if not result:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return result


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(customer_id: str):
    """Delete a customer."""
    success = storage.delete(FILENAME, customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Customer not found")
    return None
