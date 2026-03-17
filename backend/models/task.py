from sqlmodel import SQLModel, Field
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY


class TaskBase(SQLModel):
    name: str
    description: str
    tags: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    date_of_execution: str = Field(default_factory=lambda: datetime.now().isoformat())
    project: str
    company: Optional[str] = None
    customer: Optional[str] = None
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    )


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    pass


class Task(TaskBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "task-123",
                "name": "Implement user authentication",
                "description": "Added JWT-based authentication",
                "project": "proj-123"
            }
        }
