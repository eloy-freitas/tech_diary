from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from routes import (
    projects_router,
    tasks_router,
    companies_router,
    customers_router,
    tags_router
)

from contextlib import asynccontextmanager
from database import init_db
from routes import (
    projects_router,
    tasks_router,
    companies_router,
    customers_router,
    tags_router,
    admin_router
)

from routes.task_components import router as task_components_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Brag Document API",
    description="API for managing projects, tasks, companies, customers, and tags for professional brag documents",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("FRONTEND_URL", "http://notebook-server:5173").split(","),  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(companies_router)
app.include_router(customers_router)
app.include_router(tags_router)
app.include_router(admin_router)
app.include_router(task_components_router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Brag Document API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
