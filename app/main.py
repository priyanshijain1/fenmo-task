from fastapi import FastAPI

from app.routes.expenses import router as expenses_router
from app.routes.health import router as health_router


def create_app() -> FastAPI:
    app = FastAPI(title="Expense Tracker API")
    app.include_router(health_router)
    app.include_router(expenses_router)
    return app


app = create_app()
