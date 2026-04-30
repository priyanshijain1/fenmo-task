from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import DATABASE_URL_ENV, get_database_url
from app.db.models import Base


class DatabaseConnectionManager:
    """Reusable async PostgreSQL engine and session manager."""

    def __init__(self) -> None:
        self._engine: AsyncEngine | None = None
        self._sessionmaker: async_sessionmaker[AsyncSession] | None = None

    async def connect(self) -> AsyncEngine:
        if self._engine is not None:
            return self._engine

        database_url = get_database_url()
        if not database_url:
            raise RuntimeError(
                f"Missing required environment variable: {DATABASE_URL_ENV}"
            )

        engine = create_async_engine(database_url, pool_pre_ping=True)

        try:
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
        except SQLAlchemyError as exc:
            await engine.dispose()
            raise RuntimeError("Failed to connect to PostgreSQL") from exc

        self._engine = engine
        self._sessionmaker = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
        return engine

    async def close(self) -> None:
        if self._engine is None:
            return

        await self._engine.dispose()
        self._engine = None
        self._sessionmaker = None

    async def init_models(self) -> None:
        engine = await self.connect()
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)

    def get_sessionmaker(self) -> async_sessionmaker[AsyncSession]:
        if self._sessionmaker is None:
            raise RuntimeError("Database sessionmaker is not initialized.")
        return self._sessionmaker


database_manager = DatabaseConnectionManager()


async def connect_to_database() -> AsyncEngine:
    return await database_manager.connect()


async def close_database_connection() -> None:
    await database_manager.close()


async def init_database() -> None:
    await database_manager.init_models()


@asynccontextmanager
async def get_session() -> AsyncIterator[AsyncSession]:
    sessionmaker = database_manager.get_sessionmaker()
    async with sessionmaker() as session:
        yield session
