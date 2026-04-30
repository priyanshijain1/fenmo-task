import hashlib
from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.exceptions import BadRequestError, DataIntegrityError
from app.schemas.expense import Expense, ExpenseCreate
from app.services.expense_repository import (
    build_expense_document,
    ensure_expense_indexes,
    expense_from_document,
    get_expense_by_request_hash,
    insert_expense,
    list_expenses,
)


def build_expense_request_hash(expense_data: ExpenseCreate) -> str:
    # Hash the normalized expense payload so the same logical request
    # always maps to the same identifier, even across retries or refreshes.
    normalized_payload = (
        f"{expense_data.amount_in_paise()}|"
        f"{expense_data.category.strip()}|"
        f"{expense_data.description.strip()}|"
        f"{expense_data.date.isoformat()}"
    )
    return hashlib.sha256(normalized_payload.encode("utf-8")).hexdigest()


async def get_expenses(
    category: str | None = None,
    sort: str | None = None,
) -> list[Expense]:
    if sort is not None and sort != "date_desc":
        raise BadRequestError("Unsupported sort value. Use sort=date_desc.")

    # The service layer validates supported query behavior before delegating
    # the actual database query to the repository layer.
    return await list_expenses(category=category, sort=sort)


async def create_expense(expense_data: ExpenseCreate) -> tuple[Expense, bool]:
    request_hash = build_expense_request_hash(expense_data)
    created_at = datetime.now(timezone.utc)
    document = build_expense_document(
        amount=expense_data.amount_in_paise(),
        category=expense_data.category,
        description=expense_data.description,
        date=expense_data.date,
        created_at=created_at,
        request_hash=request_hash,
    )

    try:
        stored_document = await insert_expense(document)
    except DuplicateKeyError:
        # If the same payload is submitted again, return the existing record
        # instead of creating a second expense.
        existing_expense = await get_expense_by_request_hash(request_hash)
        if existing_expense is None:
            raise DataIntegrityError(
                "Duplicate expense detected, but the original record could not be found."
            )
        return existing_expense, False

    return expense_from_document(stored_document), True
