from sqlmodel import SQLModel, Field
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import Column, DateTime, func


class TagBase(SQLModel):
    name: str = Field(primary_key=True, index=True)
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    )


class TagCreate(TagBase):
    pass


class Tag(TagBase, table=True):
    class Config:
        json_schema_extra = {
            "example": {
                "name": "python"
            }
        }
