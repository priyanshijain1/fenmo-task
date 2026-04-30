import hashlib
from datetime import datetime, timezone

from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError

from app.db.connection import get_database
from app.schemas.expense import Expense, ExpenseCreate

EXPENSES_COLLECTION = "expenses"
REQUEST_HASH_FIELD = "request_hash"


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


async def ensure_expense_indexes() -> None:
    database = await get_database()
    collection = database[EXPENSES_COLLECTION]

    # A unique index on the request hash makes duplicate creates fail atomically,
    # which is safer than checking first and inserting second.
    await collection.create_index(
        [(REQUEST_HASH_FIELD, ASCENDING)],
        name="uq_expenses_request_hash",
        unique=True,
    )


def _expense_from_document(document: dict) -> Expense:
    return Expense(
        id=str(document["_id"]),
        amount=document["amount"],
        category=document["category"],
        description=document["description"],
        date=document["date"],
        created_at=document["created_at"],
    )


async def get_expenses(category: str | None = None) -> list[Expense]:
    database = await get_database()
    collection = database[EXPENSES_COLLECTION]

    query: dict[str, str] = {}
    if category:
        # Apply the filter in MongoDB so we only fetch matching documents.
        query["category"] = category

    documents = await collection.find(query).to_list(length=None)
    return [_expense_from_document(document) for document in documents]


async def create_expense(expense_data: ExpenseCreate) -> tuple[Expense, bool]:
    database = await get_database()
    collection = database[EXPENSES_COLLECTION]

    created_at = datetime.now(timezone.utc)
    request_hash = build_expense_request_hash(expense_data)
    document = {
        "amount": expense_data.amount_in_paise(),
        "category": expense_data.category,
        "description": expense_data.description,
        "date": expense_data.date,
        "created_at": created_at,
        REQUEST_HASH_FIELD: request_hash,
    }

    try:
        result = await collection.insert_one(document)
    except DuplicateKeyError:
        # If the same payload is submitted again, return the existing record
        # instead of creating a second expense.
        existing_document = await collection.find_one({REQUEST_HASH_FIELD: request_hash})
        if existing_document is None:
            raise RuntimeError("Duplicate expense detected but existing record was not found")
        return _expense_from_document(existing_document), False

    document["_id"] = result.inserted_id

    return _expense_from_document(document), True
