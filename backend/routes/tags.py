from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlmodel import Session, select
from database import get_session
from models.tag import Tag, TagCreate

router = APIRouter(prefix="/api/tags", tags=["tags"])


@router.get("/", response_model=List[Tag])
async def get_all_tags(session: Session = Depends(get_session)):
    """Get all tags."""
    return session.exec(select(Tag)).all()


@router.get("/{tag_name}", response_model=Tag)
async def get_tag(tag_name: str, session: Session = Depends(get_session)):
    """Get a specific tag by name."""
    tag = session.get(Tag, tag_name)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.post("/", response_model=Tag, status_code=201)
async def create_tag(tag_data: TagCreate, session: Session = Depends(get_session)):
    """Create a new tag."""
    existing = session.get(Tag, tag_data.name)
    if existing:
        raise HTTPException(status_code=400, detail="Tag already exists")
    
    tag = Tag.model_validate(tag_data)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


@router.delete("/{tag_name}", status_code=204)
async def delete_tag(tag_name: str, session: Session = Depends(get_session)):
    """Delete a tag."""
    tag = session.get(Tag, tag_name)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    session.delete(tag)
    session.commit()
    return None
