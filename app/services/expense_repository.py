from datetime import date, datetime

from sqlalchemy import Select, desc, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.db.connection import get_session
from app.db.models import ExpenseRecord
from app.exceptions import DatabaseOperationError
from app.schemas.expense import Expense


class DuplicateExpenseError(Exception):
    """Raised when an expense insert violates the idempotency hash uniqueness."""


def expense_from_record(record: ExpenseRecord) -> Expense:
    return Expense(
        id=str(record.id),
        amount=record.amount,
        category=record.category,
        description=record.description,
        date=record.date,
        created_at=record.created_at,
    )


async def list_expenses(
    category: str | None = None,
    sort: str | None = None,
) -> list[Expense]:
    try:
        statement: Select[tuple[ExpenseRecord]] = select(ExpenseRecord)
        if category:
            statement = statement.where(ExpenseRecord.category == category)

        if sort == "date_desc":
            statement = statement.order_by(desc(ExpenseRecord.date))

        async with get_session() as session:
            result = await session.execute(statement)
            records = result.scalars().all()
        return [expense_from_record(record) for record in records]
    except (SQLAlchemyError, RuntimeError) as exc:
        raise DatabaseOperationError("Failed to fetch expenses from the database.") from exc


async def insert_expense(record: ExpenseRecord) -> ExpenseRecord:
    try:
        async with get_session() as session:
            session.add(record)
            await session.commit()
            await session.refresh(record)
        return record
    except IntegrityError as exc:
        raise DuplicateExpenseError from exc
    except (SQLAlchemyError, RuntimeError) as exc:
        raise DatabaseOperationError("Failed to create expense in the database.") from exc


async def get_expense_by_request_hash(request_hash: str) -> Expense | None:
    try:
        statement = select(ExpenseRecord).where(ExpenseRecord.request_hash == request_hash)
        async with get_session() as session:
            result = await session.execute(statement)
            record = result.scalar_one_or_none()
        if record is None:
            return None
        return expense_from_record(record)
    except (SQLAlchemyError, RuntimeError) as exc:
        raise DatabaseOperationError(
            "Failed to look up the existing expense after a duplicate request."
        ) from exc


def build_expense_record(
    *,
    amount: int,
    category: str,
    description: str,
    date: date,
    created_at: datetime,
    request_hash: str,
) -> ExpenseRecord:
    return ExpenseRecord(
        amount=amount,
        category=category,
        description=description,
        date=date,
        created_at=created_at,
        request_hash=request_hash,
    )
