from sqlmodel import SQLModel, Field
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import ARRAY


class TaskBase(SQLModel):
    name: str
    description: str
    pr_links: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    important_links: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    cmd_commands: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    tags: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    saved_file_paths: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    date_of_execution: str = Field(default_factory=lambda: datetime.now().isoformat())
    project: str
    company: Optional[str] = None
    customer: Optional[str] = None


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
