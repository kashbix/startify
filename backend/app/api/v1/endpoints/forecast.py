"""
Forecast API endpoints for STRATA-AI.

Provides revenue/expense forecasting and future condition simulation
based on historical financial data (FR-4: Future Condition Simulator).
"""

from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.financial import FinancialRecord
from app.schemas.forecast import (
    ForecastRequest,
    ProjectToDateRequest,
    ForecastResponse,
    ForecastPointResponse,
    ForecastMethodEnum,
    ForecastSummary
)
from app.services.forecast_engine import (
    ForecastEngine,
    ForecastMethod,
    MonthlyDataPoint,
    create_forecast_from_records
)

router = APIRouter()


async def _get_user_financial_data(user: User) -> list:
    """
    Fetch and prepare financial records for forecasting.
    """
    records = await FinancialRecord.find(
        FinancialRecord.user.id == user.id
    ).sort(FinancialRecord.month).to_list()
    
    return records


def _convert_method(method: ForecastMethodEnum) -> ForecastMethod:
    """Convert API method enum to engine method enum."""
    mapping = {
        ForecastMethodEnum.LINEAR: ForecastMethod.LINEAR,
        ForecastMethodEnum.MOVING_AVERAGE: ForecastMethod.MOVING_AVERAGE,
        ForecastMethodEnum.EXPONENTIAL_SMOOTHING: ForecastMethod.EXPONENTIAL_SMOOTHING,
        ForecastMethodEnum.ENSEMBLE: ForecastMethod.ENSEMBLE,
    }
    return mapping[method]


@router.post("/generate", response_model=ForecastResponse)
async def generate_forecast(
    request: ForecastRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a financial forecast based on historical data.
    
    Uses the specified forecasting method to predict future:
    - Revenue
    - Expenses
    - Cash balance
    - Burn rate
    - Runway
    
    Also provides confidence intervals and risk assessment.
    """
    # Fetch user's financial records
    records = await _get_user_financial_data(current_user)
    
    if len(records) < 2:
        raise HTTPException(
            status_code=400,
            detail="Insufficient data for forecasting. Need at least 2 months of financial records."
        )
    
    # Convert records to dictionary format for the engine
    records_data = []
    for r in records:
        records_data.append({
            "month": r.month,
            "revenue_recurring": r.revenue_recurring,
            "revenue_one_time": r.revenue_one_time,
            "expenses_salaries": r.expenses_salaries,
            "expenses_marketing": r.expenses_marketing,
            "expenses_infrastructure": r.expenses_infrastructure,
            "expenses_other": r.expenses_other,
            "cash_balance": r.cash_balance
        })
    
    # Create forecast engine and generate forecast
    try:
        engine = create_forecast_from_records(records_data)
        method = _convert_method(request.method)
        result = engine.forecast(periods=request.periods, method=method)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting error: {str(e)}")
    
    # Convert to response schema
    projections = [
        ForecastPointResponse(
            month=p.month,
            predicted_revenue=p.predicted_revenue,
            predicted_expenses=p.predicted_expenses,
            predicted_cash_balance=p.predicted_cash_balance,
            predicted_burn_rate=p.predicted_burn_rate,
            predicted_runway_months=p.predicted_runway_months,
            confidence_lower=p.confidence_lower,
            confidence_upper=p.confidence_upper,
            risk_level=p.risk_level.value
        )
        for p in result.projections
    ]
    
    summary = ForecastSummary(
        current_cash_balance=result.summary["current_cash_balance"],
        average_predicted_burn_rate=result.summary["average_predicted_burn_rate"],
        final_predicted_cash_balance=result.summary["final_predicted_cash_balance"],
        final_predicted_runway_months=result.summary["final_predicted_runway_months"],
        critical_runway_month=result.summary["critical_runway_month"],
        trend=result.summary["trend"],
        recommendation=result.summary["recommendation"]
    )
    
    return ForecastResponse(
        method_used=request.method,
        forecast_generated_at=result.forecast_generated_at,
        historical_months=result.historical_months,
        forecast_months=result.forecast_months,
        projections=projections,
        summary=summary
    )


@router.post("/project-to-date", response_model=ForecastPointResponse)
async def project_to_specific_date(
    request: ProjectToDateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Project financial status to a specific future date.
    
    Useful for answering questions like:
    "What will my runway be on July 2026?"
    """
    # Fetch user's financial records
    records = await _get_user_financial_data(current_user)
    
    if len(records) < 2:
        raise HTTPException(
            status_code=400,
            detail="Insufficient data for forecasting. Need at least 2 months of financial records."
        )
    
    # Convert records to dictionary format
    records_data = []
    for r in records:
        records_data.append({
            "month": r.month,
            "revenue_recurring": r.revenue_recurring,
            "revenue_one_time": r.revenue_one_time,
            "expenses_salaries": r.expenses_salaries,
            "expenses_marketing": r.expenses_marketing,
            "expenses_infrastructure": r.expenses_infrastructure,
            "expenses_other": r.expenses_other,
            "cash_balance": r.cash_balance
        })
    
    # Create forecast engine and project to date
    try:
        engine = create_forecast_from_records(records_data)
        method = _convert_method(request.method)
        result = engine.project_to_date(target_date=request.target_date, method=method)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Projection error: {str(e)}")
    
    return ForecastPointResponse(
        month=result.month,
        predicted_revenue=result.predicted_revenue,
        predicted_expenses=result.predicted_expenses,
        predicted_cash_balance=result.predicted_cash_balance,
        predicted_burn_rate=result.predicted_burn_rate,
        predicted_runway_months=result.predicted_runway_months,
        confidence_lower=result.confidence_lower,
        confidence_upper=result.confidence_upper,
        risk_level=result.risk_level.value
    )


@router.get("/methods", response_model=dict)
async def get_available_methods():
    """
    Get information about available forecasting methods.
    """
    return {
        "methods": [
            {
                "id": "linear",
                "name": "Linear Regression",
                "description": "Projects future values based on historical trend line. Best for data with clear upward or downward trends.",
                "best_for": "Consistent growth or decline patterns"
            },
            {
                "id": "moving_average",
                "name": "Moving Average",
                "description": "Uses the average of recent months for prediction. Smooths out short-term fluctuations.",
                "best_for": "Stable metrics with minor variations"
            },
            {
                "id": "exponential_smoothing",
                "name": "Exponential Smoothing",
                "description": "Gives more weight to recent data points. Adapts quickly to recent changes.",
                "best_for": "Data where recent trends are more relevant"
            },
            {
                "id": "ensemble",
                "name": "Ensemble (Recommended)",
                "description": "Combines multiple methods with weighted averaging. Most robust and accurate for varied data patterns.",
                "best_for": "General use - recommended default"
            }
        ],
        "default": "ensemble",
        "max_forecast_periods": 36
    }
