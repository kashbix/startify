"""
Pydantic schemas for What-If Scenario Analyzer API (FR-5).
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum


class ScenarioTypeEnum(str, Enum):
    """Pre-built scenario types."""
    HIRE_EMPLOYEE = "hire_employee"
    CHANGE_MARKETING = "change_marketing"
    CHANGE_PRICING = "change_pricing"
    LOSE_CUSTOMER = "lose_customer"
    RECEIVE_INVESTMENT = "receive_investment"
    CUT_EXPENSES = "cut_expenses"
    CUSTOM = "custom"


class RiskLevelEnum(str, Enum):
    """Risk assessment levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ScenarioRequest(BaseModel):
    """Request schema for a single scenario simulation."""
    scenario_type: ScenarioTypeEnum
    name: str = Field(..., min_length=1, max_length=100, description="Name for this scenario")
    
    # Hiring scenario
    new_salary: Optional[float] = Field(None, ge=0, description="Monthly salary for new hire")
    num_hires: Optional[int] = Field(None, ge=1, le=100, description="Number of new hires")
    
    # Marketing scenario
    marketing_change: Optional[float] = Field(None, description="Change in marketing spend")
    
    # Pricing scenario
    revenue_change_percent: Optional[float] = Field(None, ge=-100, le=500, description="Revenue change %")
    
    # Customer loss scenario
    revenue_loss: Optional[float] = Field(None, ge=0, description="Monthly revenue to lose")
    
    # Investment scenario
    investment_amount: Optional[float] = Field(None, ge=0, description="Investment amount")
    
    # Expense cut scenario
    expense_cut: Optional[float] = Field(None, ge=0, description="Monthly expense reduction")
    expense_category: Optional[str] = Field(None, description="Category: salaries, marketing, infrastructure, other")
    
    # Custom scenario
    custom_revenue_change: Optional[float] = Field(None, description="Direct revenue change/mo")
    custom_expense_change: Optional[float] = Field(None, description="Direct expense change/mo")
    custom_cash_change: Optional[float] = Field(None, description="One-time cash change")


class CompareRequest(BaseModel):
    """Request schema for comparing multiple scenarios."""
    scenarios: List[ScenarioRequest] = Field(..., min_length=1, max_length=10)


class FinancialSnapshotResponse(BaseModel):
    """Financial snapshot at a point in time."""
    cash_balance: float
    monthly_revenue: float
    monthly_expenses: float
    burn_rate: float
    runway_months: float
    risk_level: RiskLevelEnum


class ScenarioResultResponse(BaseModel):
    """Result of a scenario simulation."""
    scenario_name: str
    scenario_type: ScenarioTypeEnum
    baseline: FinancialSnapshotResponse
    projected: FinancialSnapshotResponse
    runway_change: float
    burn_rate_change: float
    risk_change: str
    break_even_months: Optional[float]
    summary: str
    recommendation: str


class ScenarioComparisonResponse(BaseModel):
    """Side-by-side comparison of multiple scenarios."""
    baseline: FinancialSnapshotResponse
    scenarios: List[ScenarioResultResponse]
    best_scenario: Optional[str]
    comparison_generated_at: str


class ScenarioTemplatesResponse(BaseModel):
    """Available scenario templates."""
    templates: List[dict]
