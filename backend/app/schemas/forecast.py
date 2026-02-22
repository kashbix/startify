"""
Pydantic schemas for forecast API requests and responses.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class ForecastMethodEnum(str, Enum):
    """Available forecasting methods."""
    LINEAR = "linear"
    MOVING_AVERAGE = "moving_average"
    EXPONENTIAL_SMOOTHING = "exponential_smoothing"
    ENSEMBLE = "ensemble"


class RiskLevelEnum(str, Enum):
    """Risk assessment levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ForecastRequest(BaseModel):
    """Request schema for generating a forecast."""
    periods: int = Field(
        default=6, 
        ge=1, 
        le=36, 
        description="Number of months to forecast (1-36)"
    )
    method: ForecastMethodEnum = Field(
        default=ForecastMethodEnum.ENSEMBLE,
        description="Forecasting method to use"
    )


class ProjectToDateRequest(BaseModel):
    """Request schema for projecting to a specific date."""
    target_date: str = Field(
        ...,
        pattern=r"^\d{4}-\d{2}$",
        description="Target date in YYYY-MM format"
    )
    method: ForecastMethodEnum = Field(
        default=ForecastMethodEnum.ENSEMBLE,
        description="Forecasting method to use"
    )


class ForecastPointResponse(BaseModel):
    """Response schema for a single forecast point."""
    month: str
    predicted_revenue: float
    predicted_expenses: float
    predicted_cash_balance: float
    predicted_burn_rate: float
    predicted_runway_months: float
    confidence_lower: float
    confidence_upper: float
    risk_level: RiskLevelEnum


class ForecastSummary(BaseModel):
    """Summary statistics for the forecast."""
    current_cash_balance: float
    average_predicted_burn_rate: float
    final_predicted_cash_balance: float
    final_predicted_runway_months: float
    critical_runway_month: Optional[str] = None
    trend: str
    recommendation: str


class ForecastResponse(BaseModel):
    """Complete forecast response."""
    method_used: ForecastMethodEnum
    forecast_generated_at: str
    historical_months: int
    forecast_months: int
    projections: List[ForecastPointResponse]
    summary: ForecastSummary
