from sqlmodel import SQLModel, Field
from typing import Optional
from uuid import uuid4


class CustomerBase(SQLModel):
    name: str
    description: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(CustomerBase):
    pass


class Customer(CustomerBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "cust-123",
                "name": "Acme Corp",
                "description": "Enterprise client"
            }
        }
