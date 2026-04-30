import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL_ENV = "DATABASE_URL"
DEBUG_ENV = "DEBUG"


def get_database_url() -> str | None:
    return os.getenv(DATABASE_URL_ENV)


def is_debug_enabled() -> bool:
    return os.getenv(DEBUG_ENV, "false").strip().lower() in {"1", "true", "yes", "on"}
