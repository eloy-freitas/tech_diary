from sqlmodel import create_engine, SQLModel, Session
import os
from models.task_events import register_task_events

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/tech_diary")

engine = create_engine(DATABASE_URL, echo=True)


def init_db():
    register_task_events()
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
