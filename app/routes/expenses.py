from fastapi import APIRouter, Response, status

from app.schemas.expense import Expense, ExpenseCreate
from app.services.expense_service import create_expense

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=Expense, status_code=status.HTTP_201_CREATED)
async def create_expense_route(
    expense_data: ExpenseCreate,
    response: Response,
) -> Expense:
    expense, created = await create_expense(expense_data)
    if not created:
        response.status_code = status.HTTP_200_OK
    return expense
