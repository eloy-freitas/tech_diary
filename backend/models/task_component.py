from sqlmodel import SQLModel, Field
from uuid import uuid4
from typing import Optional

class TaskComponentBase(SQLModel):
    component_type: str  # text_area, link, command, code_snippet
    component_value: str
    component_sequence: int

class TaskComponent(TaskComponentBase, table=True):
    __tablename__ = "task_components"

    component_id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    task_id: str = Field(foreign_key="task.id", index=True)

class TaskComponentCreate(TaskComponentBase):
    pass

class TaskComponentUpdate(SQLModel):
    component_type: Optional[str] = None
    component_value: Optional[str] = None
    component_sequence: Optional[int] = None
