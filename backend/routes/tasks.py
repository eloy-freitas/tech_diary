from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import PlainTextResponse
from typing import List
from sqlmodel import Session, select
from database import get_session
from models.task import Task, TaskCreate, TaskUpdate
from models.project import Project
from models.task_component import TaskComponent
import re

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=List[Task])
async def get_all_tasks(session: Session = Depends(get_session)):
    """Get all tasks."""
    return session.exec(select(Task)).all()


@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: str, session: Session = Depends(get_session)):
    """Get a specific task by ID."""
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", response_model=Task, status_code=201)
async def create_task(task_data: TaskCreate, session: Session = Depends(get_session)):
    """Create a new task."""
    task = Task.model_validate(task_data)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.put("/{task_id}", response_model=Task)
async def update_task(task_id: str, task_data: TaskUpdate, session: Session = Depends(get_session)):
    """Update an existing task."""
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_data_dict = task_data.model_dump(exclude_unset=True)
    for key, value in task_data_dict.items():
        setattr(task, key, value)
    
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: str, session: Session = Depends(get_session)):
    """Delete a task."""
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    session.delete(task)
    session.commit()
    return None


def slugify(text: str) -> str:
    """Generate a valid markdown anchor slug from text."""
    if not text:
        return ""
    text = text.lower()
    # \w in Python 3 is unicode-aware and includes characters like ç, ã, etc.
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text).strip('-')
    return text


@router.get("/export/markdown", response_class=PlainTextResponse)
async def export_tasks_markdown(session: Session = Depends(get_session)):
    """Export all tasks formatted as Markdown."""
    
    tasks = session.exec(select(Task)).all()
    projects = session.exec(select(Project)).all()
    components = session.exec(select(TaskComponent)).all()
    
    # Map for faster lookups
    project_map = {p.id: p for p in projects}
    # Group components by task_id and sort by sequence
    components_by_task = {}
    for c in components:
        if c.task_id not in components_by_task:
            components_by_task[c.task_id] = []
        components_by_task[c.task_id].append(c)
    
    for t_id in components_by_task:
        components_by_task[t_id].sort(key=lambda x: x.component_sequence)
        
    # Group tasks by project
    tasks_by_project = {}
    unassigned_tasks = []
    
    for task in tasks:
        if task.project and task.project in project_map:
            p_name = project_map[task.project].name
            if p_name not in tasks_by_project:
                tasks_by_project[p_name] = []
            tasks_by_project[p_name].append(task)
        else:
            unassigned_tasks.append(task)
            
    # Function to generate markdown content
    lines = []
    lines.append("# Sumário das Tarefas\n")
    
    # Table of Contents
    for p_name in sorted(tasks_by_project.keys()):
        lines.append(f"**{p_name}**")
        for task in sorted(tasks_by_project[p_name], key=lambda t: t.date_of_execution, reverse=True):
            anchor = slugify(task.name)
            lines.append(f"- [{task.name}](#{anchor})")
        lines.append("")
        
    if unassigned_tasks:
        lines.append("**Sem Projeto**")
        for task in sorted(unassigned_tasks, key=lambda t: t.date_of_execution, reverse=True):
            anchor = slugify(task.name)
            lines.append(f"- [{task.name}](#{anchor})")
        lines.append("")
        
    lines.append("---\n")
    
    for p_name in sorted(tasks_by_project.keys()):
        lines.append(f"# {p_name}\n")
        
        for task in sorted(tasks_by_project[p_name], key=lambda t: t.date_of_execution, reverse=True):
            lines.append(f"## {task.name}\n")
            if task.date_of_execution:
                lines.append(f"**Data de Execução:** {task.date_of_execution}  ")
            if task.tags:
                lines.append(f"**Tags:** {', '.join(task.tags)}  ")
            
            lines.append(f"\n{task.description}\n")
            
            # Append Components
            t_components = components_by_task.get(task.id, [])
            if t_components:
                lines.append("### Detalhes:\n")
                for comp in t_components:
                    if comp.component_type == 'text_area':
                        lines.append(f"{comp.component_value}\n")
                    elif comp.component_type == 'link':
                        lines.append(f"[{comp.component_value}]({comp.component_value})\n")
                    elif comp.component_type == 'command':
                        lines.append(f"```bash\n{comp.component_value}\n```\n")
                    elif comp.component_type == 'code_snippet':
                        lines.append(f"```\n{comp.component_value}\n```\n")
                    else:
                        lines.append(f"```\n{comp.component_value}\n```\n")
                
            lines.append("---\n")
            
    if unassigned_tasks:
        lines.append(f"# Sem Projeto\n")
        
        for task in sorted(unassigned_tasks, key=lambda t: t.date_of_execution, reverse=True):
            lines.append(f"## {task.name}\n")
            if task.date_of_execution:
                lines.append(f"**Data de Execução:** {task.date_of_execution}  ")
            if task.tags:
                lines.append(f"**Tags:** {', '.join(task.tags)}  ")
            
            lines.append(f"\n{task.description}\n")
            
            # Append Components
            t_components = components_by_task.get(task.id, [])
            if t_components:
                lines.append("### Detalhes:\n")
                for comp in t_components:
                    if comp.component_type == 'text_area':
                        lines.append(f"{comp.component_value}\n")
                    elif comp.component_type == 'link':
                        lines.append(f"[{comp.component_value}]({comp.component_value})\n")
                    elif comp.component_type == 'command':
                        lines.append(f"```bash\n{comp.component_value}\n```\n")
                    elif comp.component_type == 'code_snippet':
                        lines.append(f"```\n{comp.component_value}\n```\n")
                    else:
                        lines.append(f"```\n{comp.component_value}\n```\n")
                
            lines.append("---\n")
            
    return "\n".join(lines)
