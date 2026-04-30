# 💸 Expense Tracker 


## 🧠 Overview

A minimal full-stack Expense Tracker designed to behave correctly under real-world conditions such as unreliable networks, retries, and page refreshes.

Users can:
- Record expenses
- Review and analyze spending
- Filter and sort data
- View total expenses dynamically

This project focuses on:
- Data correctness (especially financial data)
- Idempotent API design
- Clean architecture and maintainability

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (TypeScript)
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL
- **Deployment:**
  - Frontend → Vercel
  - Backend → Render

---

## ⚙️ Features

### Core Features
- Create expense (amount, category, description, date)
- View list of expenses
- Filter by category
- Sort by date (newest first)
- Display total of filtered expenses

### Real-World Handling
- Prevent duplicate submissions
- Handle retries safely
- Support page refresh after submission
- Show loading and error states

---

## 🏗️ Architecture

---

## 💰 Data Model

### Expense Schema

```json
{
  "id": "string",
  "amount": 10000,
  "category": "food",
  "description": "Lunch",
  "date": "2026-04-30",
  "created_at": "2026-04-30T10:00:00Z"
}
```

---
## 💰 Money Handling

Handling money correctly is critical in financial applications.

### Approach
- Amounts are stored as **integers in paise**
- Example:
  - ₹100 → `10000`

### Why not use float?
- Floating-point numbers introduce precision errors  
  Example:
  0.1 + 0.2 !== 0.3

- This can lead to incorrect totals and inconsistencies

### Benefits
- Exact calculations with no rounding errors  
- Consistent aggregation (totals, summaries)  
- Safer for financial data handling  

---

## 🔁 Idempotency (Retry Safety)

The system ensures that repeated requests do **not create duplicate expenses**.

### Problem
Users may:
- Click submit multiple times  
- Experience network retries  
- Refresh the page after submission  

Without protection → duplicate entries

---

### Solution
- Generate a **deterministic request hash** using:
    amount + category + description + date

- Store this hash with a **unique constraint in the database**
- On receiving a request:
- If hash exists → return existing expense  
- Else → create new expense  

---

### Outcome
- Safe retries  
- No duplicate records  
- System behaves correctly under unreliable conditions  

---

## ⚙️ Why Next.js + FastAPI + PostgreSQL?

### 🟦 Next.js (Frontend)
- Provides a clean and scalable React-based architecture  
- Built-in routing and API integration  
- Supports modern UI patterns (SSR, fast navigation)  
- Easy deployment and optimization  

---

### 🟩 FastAPI (Backend)
- High performance and async support  
- Clean and type-safe API development using Python  
- Automatic request validation with Pydantic  
- Easy to maintain and extend  

---

### 🟨 PostgreSQL (Database)
- Strong consistency guarantees (ACID compliance)  
- Ideal for structured financial data  
- Supports constraints (like unique keys for idempotency)  
- Reliable and production-proven  

---

### 🧠 Overall Stack Advantage

This stack was chosen to:
- Ensure **correctness and reliability**
- Support **clean separation of frontend and backend**
- Handle **real-world conditions (retries, failures)**
- Provide a **scalable foundation for future features**