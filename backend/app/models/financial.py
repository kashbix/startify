from typing import Optional
from datetime import datetime
from beanie import Document, Link
from pydantic import Field
from app.models.user import User

class FinancialRecord(Document):
    user: Link[User]
    month: str        # Format: "YYYY-MM"
    
    # Revenue
    revenue_recurring: float = 0.0
    revenue_one_time: float = 0.0
    
    # Expenses
    expenses_salaries: float = 0.0
    expenses_marketing: float = 0.0
    expenses_infrastructure: float = 0.0
    expenses_other: float = 0.0
    
    # Snapshot
    cash_balance: float  # Cash at end of month
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "financial_records"
        indexes = [
            [("user", 1), ("month", -1)],  # Primary: user + month (desc for recent first)
            [("user", 1), ("created_at", -1)],  # For listing recent records
            [("month", -1)],  # For date-range queries
        ]