from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import is_debug_enabled
from app.db.connection import close_mongo_connection, connect_to_mongo
from app.exceptions import AppError, app_error_handler
from app.routes.expenses import router as expenses_router
from app.routes.health import router as health_router
from app.services.expense_service import ensure_expense_indexes


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongo()
    await ensure_expense_indexes()
    try:
        yield
    finally:
        await close_mongo_connection()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Expense Tracker API",
        debug=is_debug_enabled(),
        lifespan=lifespan,
    )
    app.add_exception_handler(AppError, app_error_handler)
    app.include_router(health_router)
    app.include_router(expenses_router)
    return app


app = create_app()
