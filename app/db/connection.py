from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConfigurationError, PyMongoError

from app.config import DEFAULT_DATABASE_NAME, MONGODB_URI_ENV, get_mongodb_uri


class MongoConnectionManager:
    """Reusable MongoDB client manager for the application."""

    def __init__(self) -> None:
        self._client: AsyncIOMotorClient | None = None

    async def connect(self) -> AsyncIOMotorClient:
        if self._client is not None:
            return self._client

        mongo_uri = get_mongodb_uri()
        if not mongo_uri:
            raise RuntimeError(
                f"Missing required environment variable: {MONGODB_URI_ENV}"
            )

        client = AsyncIOMotorClient(mongo_uri)

        try:
            await client.admin.command("ping")
        except PyMongoError as exc:
            client.close()
            raise RuntimeError("Failed to connect to MongoDB") from exc

        self._client = client
        return client

    async def close(self) -> None:
        if self._client is None:
            return

        self._client.close()
        self._client = None

    async def get_database(self) -> AsyncIOMotorDatabase:
        client = await self.connect()
        try:
            default_database = client.get_default_database()
        except ConfigurationError:
            default_database = None

        if default_database is not None:
            return default_database

        return client[DEFAULT_DATABASE_NAME]


mongo_manager = MongoConnectionManager()


async def connect_to_mongo() -> AsyncIOMotorClient:
    return await mongo_manager.connect()


async def close_mongo_connection() -> None:
    await mongo_manager.close()


async def get_database() -> AsyncIOMotorDatabase:
    return await mongo_manager.get_database()
