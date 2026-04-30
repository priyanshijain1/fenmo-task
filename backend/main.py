from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

app = FastAPI()

# Simple CORS config for production: allow frontend domain(s) via env var
FRONTEND_ORIGINS = os.environ.get("FRONTEND_ORIGINS", "").split(",")
FRONTEND_ORIGINS = [o for o in FRONTEND_ORIGINS if o]
if FRONTEND_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=FRONTEND_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

class ExpenseIn(BaseModel):
    amount: int
    category: str
    description: str
    date: str

class ExpenseOut(ExpenseIn):
    id: int
    created_at: str

expenses: List[ExpenseOut] = []

@app.get("/expenses", response_model=List[ExpenseOut])
def get_expenses(category: Optional[str] = None, sort: str = "date_desc"):
    data = expenses
    if category:
        data = [e for e in expenses if e.category == category]
    if sort == "date_desc":
        data = sorted(data, key=lambda e: e.date, reverse=True)
    else:
        data = sorted(data, key=lambda e: e.date)
    return data

@app.post("/expenses", response_model=ExpenseOut)
def create_expense(input: ExpenseIn):
    new = ExpenseOut(
        id=len(expenses) + 1,
        created_at=datetime.utcnow().isoformat(),
        **input.dict(),
    )
    expenses.append(new)
    return new
