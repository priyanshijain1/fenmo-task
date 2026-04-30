from datetime import datetime

from pymongo import ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.db.connection import get_database
from app.exceptions import DatabaseOperationError
from app.schemas.expense import Expense

EXPENSES_COLLECTION = "expenses"
REQUEST_HASH_FIELD = "request_hash"


async def ensure_expense_indexes() -> None:
    try:
        database = await get_database()
        collection = database[EXPENSES_COLLECTION]

        await collection.create_index(
            [(REQUEST_HASH_FIELD, ASCENDING)],
            name="uq_expenses_request_hash",
            unique=True,
        )
    except (PyMongoError, RuntimeError) as exc:
        raise DatabaseOperationError("Failed to prepare expense indexes.") from exc


def expense_from_document(document: dict) -> Expense:
    return Expense(
        id=str(document["_id"]),
        amount=document["amount"],
        category=document["category"],
        description=document["description"],
        date=document["date"],
        created_at=document["created_at"],
    )


async def list_expenses(
    category: str | None = None,
    sort: str | None = None,
) -> list[Expense]:
    try:
        database = await get_database()
        collection = database[EXPENSES_COLLECTION]

        query: dict[str, str] = {}
        if category:
            query["category"] = category

        cursor = collection.find(query)
        if sort == "date_desc":
            cursor = cursor.sort("date", DESCENDING)

        documents = await cursor.to_list(length=None)
        return [expense_from_document(document) for document in documents]
    except (PyMongoError, RuntimeError) as exc:
        raise DatabaseOperationError("Failed to fetch expenses from the database.") from exc


async def insert_expense(document: dict) -> dict:
    try:
        database = await get_database()
        collection = database[EXPENSES_COLLECTION]
        result = await collection.insert_one(document)
        document["_id"] = result.inserted_id
        return document
    except DuplicateKeyError:
        raise
    except (PyMongoError, RuntimeError) as exc:
        raise DatabaseOperationError("Failed to create expense in the database.") from exc


async def get_expense_by_request_hash(request_hash: str) -> Expense | None:
    try:
        database = await get_database()
        collection = database[EXPENSES_COLLECTION]
        document = await collection.find_one({REQUEST_HASH_FIELD: request_hash})
        if document is None:
            return None
        return expense_from_document(document)
    except (PyMongoError, RuntimeError) as exc:
        raise DatabaseOperationError(
            "Failed to look up the existing expense after a duplicate request."
        ) from exc


def build_expense_document(
    *,
    amount: int,
    category: str,
    description: str,
    date,
    created_at: datetime,
    request_hash: str,
) -> dict:
    return {
        "amount": amount,
        "category": category,
        "description": description,
        "date": date,
        "created_at": created_at,
        REQUEST_HASH_FIELD: request_hash,
    }
