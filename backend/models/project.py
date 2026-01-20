from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import uuid4


class ProjectBase(BaseModel):
    name: str
    description: str
    tags: List[str] = []
    company: Optional[str] = None
    customer: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class Project(ProjectBase):
    id: str = Field(default_factory=lambda: str(uuid4()))

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "E-commerce Platform",
                "description": "Built a scalable e-commerce platform with microservices architecture",
                "tags": ["backend", "microservices", "python"],
                "company": "comp-123",
                "customer": "cust-456"
            }
        }
