from sqlmodel import SQLModel, Field
from typing import Optional
from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, DateTime, func


class CompanyBase(SQLModel):
    name: str
    description: Optional[str] = None
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    )


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(CompanyBase):
    pass


class Company(CompanyBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "comp-123",
                "name": "Tech Corp",
                "description": "Leading technology company"
            }
        }
