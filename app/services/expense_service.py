from datetime import datetime, timezone

from app.db.connection import get_database
from app.schemas.expense import Expense, ExpenseCreate

EXPENSES_COLLECTION = "expenses"


async def create_expense(expense_data: ExpenseCreate) -> Expense:
    database = await get_database()
    collection = database[EXPENSES_COLLECTION]

    created_at = datetime.now(timezone.utc)
    document = {
        "amount": expense_data.amount_in_paise(),
        "category": expense_data.category,
        "description": expense_data.description,
        "date": expense_data.date.isoformat(),
        "created_at": created_at,
    }

    result = await collection.insert_one(document)

    return Expense(
        id=str(result.inserted_id),
        amount=document["amount"],
        category=document["category"],
        description=document["description"],
        date=expense_data.date,
        created_at=created_at,
    )
