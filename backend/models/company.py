from pydantic import BaseModel, Field
from typing import Optional
from uuid import uuid4


class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(CompanyBase):
    pass


class Company(CompanyBase):
    id: str = Field(default_factory=lambda: str(uuid4()))

    class Config:
        json_schema_extra = {
            "example": {
                "id": "comp-123e4567-e89b-12d3-a456-426614174000",
                "name": "Tech Corp",
                "description": "Leading technology company specializing in cloud solutions"
            }
        }
