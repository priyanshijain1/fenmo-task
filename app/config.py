import os

from dotenv import load_dotenv

load_dotenv()

MONGODB_URI_ENV = "MONGODB_URI"
DEBUG_ENV = "DEBUG"
DEFAULT_DATABASE_NAME = "expense_tracker"


def get_mongodb_uri() -> str | None:
    return os.getenv(MONGODB_URI_ENV)


def is_debug_enabled() -> bool:
    return os.getenv(DEBUG_ENV, "false").strip().lower() in {"1", "true", "yes", "on"}
