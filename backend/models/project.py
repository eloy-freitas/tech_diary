from sqlmodel import SQLModel, Field
from typing import Optional, List
from uuid import uuid4
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import ARRAY


class ProjectBase(SQLModel):
    name: str
    description: str
    tags: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class Project(ProjectBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "proj-123",
                "name": "E-commerce Platform",
                "description": "Built a scalable e-commerce platform",
                "tags": ["backend", "microservices"]
            }
        }
