from fastapi import APIRouter, HTTPException
from typing import List
from models.task import Task, TaskCreate, TaskUpdate
from storage.json_storage import JSONStorage

router = APIRouter(prefix="/api/tasks", tags=["tasks"])
storage = JSONStorage()

FILENAME = "tasks.json"


@router.get("/", response_model=List[Task])
async def get_all_tasks():
    """Get all tasks."""
    data = storage.read_all(FILENAME)
    return data


@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: str):
    """Get a specific task by ID."""
    task = storage.read_by_id(FILENAME, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", response_model=Task, status_code=201)
async def create_task(task_data: TaskCreate):
    """Create a new task."""
    task = Task(**task_data.model_dump())
    created = storage.create(FILENAME, task.model_dump())
    return created


@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: str, task_data: TaskUpdate):
    """Update an existing task."""
    # Check if task exists
    existing = storage.read_by_id(FILENAME, task_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update with new data, keeping the same ID
    updated_task = Task(id=task_id, **task_data.model_dump())
    result = storage.update(FILENAME, task_id, updated_task.model_dump())
    
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return result


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: str):
    """Delete a task."""
    success = storage.delete(FILENAME, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return None
