from .projects import router as projects_router
from .tasks import router as tasks_router
from .companies import router as companies_router
from .customers import router as customers_router
from .tags import router as tags_router

__all__ = [
    "projects_router",
    "tasks_router",
    "companies_router",
    "customers_router",
    "tags_router"
]
