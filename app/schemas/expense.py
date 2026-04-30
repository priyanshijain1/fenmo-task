from datetime import date, datetime
from decimal import Decimal, ROUND_HALF_UP

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ExpenseBase(BaseModel):
    # Money is stored as integer paise to avoid floating-point rounding errors,
    # which can produce incorrect totals for financial data.
    amount: int = Field(..., ge=0, description="Expense amount in paise")
    category: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    date: date


class ExpenseCreate(BaseModel):
    # Accept Decimal input so we can safely convert a user-facing currency amount
    # into integer paise before storing it.
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    category: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    date: date

    def amount_in_paise(self) -> int:
        normalized_amount = self.amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        return int(normalized_amount * 100)

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        normalized_value = value.strip()
        if not normalized_value:
            raise ValueError("Category is required")
        return normalized_value


class Expense(ExpenseBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
