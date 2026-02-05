from sqlalchemy import event
from models.task import Task
from models.task_component import TaskComponent
from sqlmodel import Session
from datetime import datetime

def update_task_timestamp(mapper, connection, target):
    """Update the parent Task's updated_at timestamp when a component changes."""
    # We use a session-local update to ensure it's part of the same transaction
    # Since we're in an event listener, we should be careful about triggering more events
    
    # Get the parent task ID
    task_id = target.task_id
    if task_id:
        # Update the task's updated_at directly via the connection to avoid recursive events
        # and to be as efficient as possible
        connection.execute(
            Task.__table__.update()
            .where(Task.id == task_id)
            .values(updated_at=datetime.now())
        )

def register_task_events():
    """Register SQLAlchemy event listeners."""
    event.listen(TaskComponent, 'after_insert', update_task_timestamp)
    event.listen(TaskComponent, 'after_update', update_task_timestamp)
    event.listen(TaskComponent, 'after_delete', update_task_timestamp)
