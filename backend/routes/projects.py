from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlmodel import Session, select
from database import get_session
from models.project import Project, ProjectCreate, ProjectUpdate

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("/", response_model=List[Project])
async def get_all_projects(session: Session = Depends(get_session)):
    """Get all projects."""
    return session.exec(select(Project)).all()


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str, session: Session = Depends(get_session)):
    """Get a specific project by ID."""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=Project, status_code=201)
async def create_project(project_data: ProjectCreate, session: Session = Depends(get_session)):
    """Create a new project."""
    project = Project.model_validate(project_data)
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: str, project_data: ProjectUpdate, session: Session = Depends(get_session)):
    """Update an existing project."""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_data_dict = project_data.model_dump(exclude_unset=True)
    for key, value in project_data_dict.items():
        setattr(project, key, value)
    
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, session: Session = Depends(get_session)):
    """Delete a project."""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    session.delete(project)
    session.commit()
    return None
