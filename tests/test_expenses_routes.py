from contextlib import asynccontextmanager
from datetime import date, datetime, timezone

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import create_app
from app.schemas.expense import Expense
from app.routes import expenses as expenses_routes


@pytest.fixture
def client() -> TestClient:
    app = create_app()

    @asynccontextmanager
    async def no_lifespan(_: FastAPI):
        yield

    app.router.lifespan_context = no_lifespan

    with TestClient(app) as test_client:
        yield test_client


def test_post_expenses_returns_created_expense(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def fake_create_expense(_expense_data):
        return (
            Expense(
                id="expense-1",
                amount=12345,
                category="Food",
                description="Lunch",
                date=date(2026, 4, 30),
                created_at=datetime(2026, 4, 30, 10, 0, tzinfo=timezone.utc),
            ),
            True,
        )

    monkeypatch.setattr(expenses_routes, "create_expense", fake_create_expense)

    response = client.post(
        "/expenses",
        json={
            "amount": 123.45,
            "category": "Food",
            "description": "Lunch",
            "date": "2026-04-30",
        },
    )

    assert response.status_code == 201
    assert response.json() == {
        "id": "expense-1",
        "amount": 12345,
        "category": "Food",
        "description": "Lunch",
        "date": "2026-04-30",
        "created_at": "2026-04-30T10:00:00Z",
    }


def test_get_expenses_returns_all_expenses(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def fake_get_expenses(category=None, sort=None):
        assert category is None
        assert sort is None
        return [
            Expense(
                id="expense-1",
                amount=12345,
                category="Food",
                description="Lunch",
                date=date(2026, 4, 30),
                created_at=datetime(2026, 4, 30, 10, 0, tzinfo=timezone.utc),
            ),
            Expense(
                id="expense-2",
                amount=8999,
                category="Travel",
                description="Cab",
                date=date(2026, 4, 29),
                created_at=datetime(2026, 4, 29, 9, 30, tzinfo=timezone.utc),
            ),
        ]

    monkeypatch.setattr(expenses_routes, "get_expenses", fake_get_expenses)

    response = client.get("/expenses")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": "expense-1",
            "amount": 12345,
            "category": "Food",
            "description": "Lunch",
            "date": "2026-04-30",
            "created_at": "2026-04-30T10:00:00Z",
        },
        {
            "id": "expense-2",
            "amount": 8999,
            "category": "Travel",
            "description": "Cab",
            "date": "2026-04-29",
            "created_at": "2026-04-29T09:30:00Z",
        },
    ]


def test_get_expenses_forwards_query_params(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def fake_get_expenses(category=None, sort=None):
        assert category == "Food"
        assert sort == "date_desc"
        return []

    monkeypatch.setattr(expenses_routes, "get_expenses", fake_get_expenses)

    response = client.get("/expenses?category=Food&sort=date_desc")

    assert response.status_code == 200
    assert response.json() == []
