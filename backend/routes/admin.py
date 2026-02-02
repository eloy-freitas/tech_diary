from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Query
from sqlmodel import Session, text, select
from database import get_session, engine, init_db
import subprocess
import os
import json
from typing import Literal
from datetime import datetime

# Import all models to ensure they are registered for JSON handling if needed
from models.company import Company
from models.customer import Customer
from models.project import Project
from models.task import Task
from models.tag import Tag

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/truncate", status_code=204)
async def truncate_tables(session: Session = Depends(get_session)):
    """Truncate all tables in the database."""
    try:
        # Disable foreign key checks temporarily to allow truncating in any order
        session.exec(text("TRUNCATE TABLE task, project, company, customer, tag RESTART IDENTITY CASCADE;"))
        session.commit()
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export")
async def export_data(format: Literal["json", "sql"] = Query("json")):
    """Export data as JSON or SQL dump."""
    if format == "sql":
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            raise HTTPException(status_code=500, detail="DATABASE_URL not set")
        
        # Use pg_dump. password needs to be in .pgpass or PGPASSWORD env
        try:
            # Simple pg_dump execution. Assumes pg_dump is installed and accessible.
            # Using PGPASSWORD env var injection for simplicity here (be careful in production logging)
            env = os.environ.copy()
            # Parse DB URL to get params would be better, but assuming standard container setup
            env["PGPASSWORD"] = "postgres" 
            
            command = ["pg_dump", "-h", "db", "-U", "postgres", "-d", "tech_diary", "--clean", "--if-exists"]
            result = subprocess.run(command, capture_output=True, text=True, env=env)
            
            if result.returncode != 0:
                raise Exception(result.stderr)
            
            return {"data": result.stdout, "filename": f"backup_{datetime.now().strftime('%Y%m%d%H%M%S')}.sql"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

    else:
        # JSON Export
        session = next(get_session())
        data = {
            "companies": [c.model_dump() for c in session.exec(select(Company)).all()],
            "customers": [c.model_dump() for c in session.exec(select(Customer)).all()],
            "projects": [p.model_dump() for p in session.exec(select(Project)).all()],
            "tasks": [t.model_dump() for t in session.exec(select(Task)).all()],
            "tags": [t.model_dump() for t in session.exec(select(Tag)).all()]
        }
        return data


@router.post("/import")
async def import_data(file: UploadFile = File(...), format: Literal["json", "sql"] = Query("json"), session: Session = Depends(get_session)):
    """Import data from JSON or SQL dump."""
    content = await file.read()
    
    if format == "sql":
        try:
            # Write to temp file
            with open("/tmp/restore.sql", "wb") as f:
                f.write(content)
            
            env = os.environ.copy()
            env["PGPASSWORD"] = "postgres"
            
            command = ["psql", "-h", "db", "-U", "postgres", "-d", "tech_diary", "-f", "/tmp/restore.sql"]
            result = subprocess.run(command, capture_output=True, text=True, env=env)
            
            if result.returncode != 0:
                raise Exception(result.stderr)
                
            return {"message": "Database restored successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
            
    else:
        # JSON Import
        try:
            data = json.loads(content.decode())
            
            # Simple approach: existing data? Strategy: User asked to "import from existent data".
            # Usually implies adding to or restoring. 
            # If IDs match, it might conflict. 
            # For simplicity, we'll try to merge/upsert manually or just insert.
            # Given "truncate" exists, user might truncate then import.
            
            # Order matters due to potential FKs (though we didn't strictly enforce FKs in models yet, only conceptual)
            # But let's import in order: Company/Customer -> Project -> Task -> Tag
            
            for item in data.get("companies", []):
                session.merge(Company(**item))
            
            for item in data.get("customers", []):
                session.merge(Customer(**item))
                
            for item in data.get("projects", []):
                session.merge(Project(**item))
                
            for item in data.get("tasks", []):
                # handle date parsing if needed, but pydantic should handle str->datetime
                session.merge(Task(**item))
                
            for item in data.get("tags", []):
                session.merge(Tag(**item))
            
            session.commit()
            return {"message": "Data imported successfully"}
            
        except Exception as e:
            session.rollback()
            raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")
