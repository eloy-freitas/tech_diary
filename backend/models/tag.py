from sqlmodel import SQLModel, Field
from pydantic import BaseModel


class TagBase(SQLModel):
    name: str = Field(primary_key=True, index=True)


class TagCreate(TagBase):
    pass


class Tag(TagBase, table=True):
    class Config:
        json_schema_extra = {
            "example": {
                "name": "python"
            }
        }
