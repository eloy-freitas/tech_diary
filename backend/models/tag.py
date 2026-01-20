from pydantic import BaseModel


class TagBase(BaseModel):
    name: str


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    class Config:
        json_schema_extra = {
            "example": {
                "name": "python"
            }
        }
