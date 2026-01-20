from fastapi import APIRouter, HTTPException
from typing import List
from models.project import Project, ProjectCreate, ProjectUpdate
from storage.json_storage import JSONStorage

router = APIRouter(prefix="/api/projects", tags=["projects"])
storage = JSONStorage()

FILENAME = "projects.json"


@router.get("/", response_model=List[Project])
async def get_all_projects():
    """Get all projects."""
    data = storage.read_all(FILENAME)
    return data


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get a specific project by ID."""
    project = storage.read_by_id(FILENAME, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=Project, status_code=201)
async def create_project(project_data: ProjectCreate):
    """Create a new project."""
    project = Project(**project_data.model_dump())
    created = storage.create(FILENAME, project.model_dump())
    return created


@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: str, project_data: ProjectUpdate):
    """Update an existing project."""
    # Check if project exists
    existing = storage.read_by_id(FILENAME, project_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update with new data, keeping the same ID
    updated_project = Project(id=project_id, **project_data.model_dump())
    result = storage.update(FILENAME, project_id, updated_project.model_dump())
    
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return result


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str):
    """Delete a project."""
    success = storage.delete(FILENAME, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return None
