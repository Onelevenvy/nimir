from fastapi import APIRouter

from app.api.routes import annotation, data, labels, login, projects, users
from app.api.routes import workflows


api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(data.router, prefix="/data", tags=["data"])
api_router.include_router(labels.router, prefix="/labels", tags=["labels"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(
    annotation.router, prefix="/annotations", tags=["annotations"]
)
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
