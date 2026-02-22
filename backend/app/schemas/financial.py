from pydantic import BaseModel, Field, validator
import re

class FinancialBase(BaseModel):
    month: str
    revenue_recurring: float = Field(default=0.0, ge=0)
    revenue_one_time: float = Field(default=0.0, ge=0)
    expenses_salaries: float = Field(default=0.0, ge=0)
    expenses_marketing: float = Field(default=0.0, ge=0)
    expenses_infrastructure: float = Field(default=0.0, ge=0)
    expenses_other: float = Field(default=0.0, ge=0)
    cash_balance: float = Field(..., ge=0)

    @validator('month')
    def validate_month_format(cls, v):
        if not re.match(r'^\d{4}-\d{2}$', v):
            raise ValueError('Month must be in YYYY-MM format')
        return v

class FinancialCreate(FinancialBase):
    pass

class FinancialResponse(FinancialBase):
    id: str
    total_revenue: float
    total_expenses: float
    net_burn: float

    class Config:
        from_attributes = True