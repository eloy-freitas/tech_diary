from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import uuid4
from datetime import datetime


class TaskBase(BaseModel):
    name: str
    description: str
    pr_links: List[str] = []
    important_links: List[str] = []
    cmd_commands: List[str] = []
    tags: List[str] = []
    saved_file_paths: List[str] = []
    date_of_execution: str = Field(default_factory=lambda: datetime.now().isoformat())
    project: str
    company: Optional[str] = None
    customer: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    pass


class Task(TaskBase):
    id: str = Field(default_factory=lambda: str(uuid4()))

    class Config:
        json_schema_extra = {
            "example": {
                "id": "task-123e4567-e89b-12d3-a456-426614174000",
                "name": "Implement user authentication",
                "description": "Added JWT-based authentication with refresh tokens",
                "pr_links": ["https://github.com/user/repo/pull/123"],
                "important_links": ["https://docs.example.com/auth"],
                "cmd_commands": ["npm run test:auth", "docker-compose up"],
                "tags": ["security", "backend"],
                "saved_file_paths": ["/src/auth/jwt.py", "/tests/test_auth.py"],
                "date_of_execution": "2026-01-20T10:00:00",
                "project": "proj-123",
                "company": "comp-456",
                "customer": "cust-789"
            }
        }
