from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlmodel import Session, select
from database import get_session
from models.task_component import TaskComponent, TaskComponentCreate, TaskComponentUpdate
from models.task import Task

router = APIRouter(prefix="/api/tasks", tags=["task_components"])


@router.get("/{task_id}/components", response_model=List[TaskComponent])
async def get_task_components(task_id: str, session: Session = Depends(get_session)):
    """Get all components for a specific task, ordered by sequence."""
    # Verify task exists
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    components = session.exec(
        select(TaskComponent)
        .where(TaskComponent.task_id == task_id)
        .order_by(TaskComponent.component_sequence)
    ).all()
    return components


@router.post("/{task_id}/components", response_model=TaskComponent, status_code=201)
async def create_task_component(
    task_id: str,
    component_data: TaskComponentCreate,
    session: Session = Depends(get_session)
):
    """Create a new component for a task."""
    # Verify task exists
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    component = TaskComponent(task_id=task_id, **component_data.model_dump())
    session.add(component)
    session.commit()
    session.refresh(component)
    return component


@router.put("/{task_id}/components/{component_id}", response_model=TaskComponent)
async def update_task_component(
    task_id: str,
    component_id: str,
    component_data: TaskComponentUpdate,
    session: Session = Depends(get_session)
):
    """Update a task component."""
    component = session.get(TaskComponent, component_id)
    if not component or component.task_id != task_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    component_dict = component_data.model_dump(exclude_unset=True)
    for key, value in component_dict.items():
        setattr(component, key, value)
    
    session.add(component)
    session.commit()
    session.refresh(component)
    return component


@router.delete("/{task_id}/components/{component_id}", status_code=204)
async def delete_task_component(
    task_id: str,
    component_id: str,
    session: Session = Depends(get_session)
):
    """Delete a task component."""
    component = session.get(TaskComponent, component_id)
    if not component or component.task_id != task_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    session.delete(component)
    session.commit()
    return None
