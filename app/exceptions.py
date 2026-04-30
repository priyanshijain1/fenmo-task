from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error that maps internal failures to HTTP responses."""

    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class DatabaseOperationError(AppError):
    """Raised when a database read or write cannot be completed safely."""

    def __init__(self, detail: str = "Database operation failed. Please try again.") -> None:
        super().__init__(status_code=503, detail=detail)


class DataIntegrityError(AppError):
    """Raised when persisted data is in an unexpected or inconsistent state."""

    def __init__(self, detail: str = "Stored expense data is inconsistent.") -> None:
        super().__init__(status_code=500, detail=detail)


class BadRequestError(AppError):
    """Raised when a request is syntactically valid but semantically unsupported."""

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=400, detail=detail)


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
