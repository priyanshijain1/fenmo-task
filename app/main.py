from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import is_debug_enabled
from app.db.connection import close_database_connection, connect_to_database, init_database
from app.exceptions import AppError, app_error_handler
from app.routes.expenses import router as expenses_router
from app.routes.health import router as health_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_database()
    await init_database()
    try:
        yield
    finally:
        await close_database_connection()


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
