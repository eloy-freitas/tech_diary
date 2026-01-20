from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import (
    projects_router,
    tasks_router,
    companies_router,
    customers_router,
    tags_router
)

app = FastAPI(
    title="Brag Document API",
    description="API for managing projects, tasks, companies, customers, and tags for professional brag documents",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
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
