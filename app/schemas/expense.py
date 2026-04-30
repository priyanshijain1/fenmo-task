from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ExpenseBase(BaseModel):
    # Money is stored as integer paise to avoid floating-point rounding errors,
    # which can produce incorrect totals for financial data.
    amount: int = Field(..., ge=0, description="Expense amount in paise")
    category: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    date: date


class ExpenseCreate(ExpenseBase):
    pass


class Expense(ExpenseBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
