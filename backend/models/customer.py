from pydantic import BaseModel, Field
from typing import Optional
from uuid import uuid4


class CustomerBase(BaseModel):
    name: str
    description: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(CustomerBase):
    pass


class Customer(CustomerBase):
    id: str = Field(default_factory=lambda: str(uuid4()))

    class Config:
        json_schema_extra = {
            "example": {
                "id": "cust-123e4567-e89b-12d3-a456-426614174000",
                "name": "Acme Corporation",
                "description": "Enterprise client in the manufacturing sector"
            }
        }
