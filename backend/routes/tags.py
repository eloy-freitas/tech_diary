from fastapi import APIRouter, HTTPException
from typing import List
from models.tag import Tag, TagCreate
from storage.json_storage import JSONStorage

router = APIRouter(prefix="/api/tags", tags=["tags"])
storage = JSONStorage()

FILENAME = "tags.json"


@router.get("/", response_model=List[Tag])
async def get_all_tags():
    """Get all tags."""
    data = storage.read_all(FILENAME)
    return data


@router.get("/{tag_name}", response_model=Tag)
async def get_tag(tag_name: str):
    """Get a specific tag by name."""
    tag = storage.read_by_id(FILENAME, tag_name, id_field="name")
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.post("/", response_model=Tag, status_code=201)
async def create_tag(tag_data: TagCreate):
    """Create a new tag."""
    # Check if tag already exists
    existing = storage.read_by_id(FILENAME, tag_data.name, id_field="name")
    if existing:
        raise HTTPException(status_code=400, detail="Tag already exists")
    
    tag = Tag(**tag_data.model_dump())
    created = storage.create(FILENAME, tag.model_dump())
    return created


@router.delete("/{tag_name}", status_code=204)
async def delete_tag(tag_name: str):
    """Delete a tag."""
    success = storage.delete(FILENAME, tag_name, id_field="name")
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return None
