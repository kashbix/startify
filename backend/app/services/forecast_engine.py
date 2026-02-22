"""
Revenue Forecasting Engine for STRATA-AI

This module provides multiple forecasting methods for predicting future
financial metrics (revenue, expenses, cash balance, runway).

Methods:
- Linear Regression: Trend-based projection
- Moving Average: Smoothed historical average
- Exponential Smoothing: Weighted recent data emphasis
- Monte Carlo Simulation: Probabilistic confidence intervals
"""

from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from dateutil.relativedelta import relativedelta
import numpy as np
from sklearn.linear_model import LinearRegression
from pydantic import BaseModel, Field
from enum import Enum


class ForecastMethod(str, Enum):
    """Available forecasting methods."""
    LINEAR = "linear"
    MOVING_AVERAGE = "moving_average"
    EXPONENTIAL_SMOOTHING = "exponential_smoothing"
    ENSEMBLE = "ensemble"  # Combines multiple methods


class RiskLevel(str, Enum):
    """Risk assessment levels based on runway."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class MonthlyDataPoint(BaseModel):
    """Represents a single month's financial data."""
    month: str  # YYYY-MM format
    revenue: float = 0.0
    expenses: float = 0.0
    cash_balance: float = 0.0
    burn_rate: float = 0.0  # Calculated: expenses - revenue


class ForecastPoint(BaseModel):
    """A single forecasted data point with confidence intervals."""
    month: str
    predicted_revenue: float
    predicted_expenses: float
    predicted_cash_balance: float
    predicted_burn_rate: float
    predicted_runway_months: float
    confidence_lower: float  # Lower bound (pessimistic)
    confidence_upper: float  # Upper bound (optimistic)
    risk_level: RiskLevel


class ForecastResult(BaseModel):
    """Complete forecast result with projections and analysis."""
    method_used: ForecastMethod
    forecast_generated_at: str
    historical_months: int
    forecast_months: int
    projections: List[ForecastPoint]
    summary: Dict[str, Any]


class ForecastEngine:
    """
    Main forecasting engine that processes historical financial data
    and generates future projections.
    """
    
    def __init__(self, historical_data: List[MonthlyDataPoint]):
        """
        Initialize the forecast engine with historical data.
        
        Args:
            historical_data: List of MonthlyDataPoint objects, sorted by month ascending
        """
        self.historical_data = sorted(historical_data, key=lambda x: x.month)
        self._prepare_arrays()
    
    def _prepare_arrays(self):
        """Convert historical data to numpy arrays for calculations."""
        self.months = [d.month for d in self.historical_data]
        self.revenues = np.array([d.revenue for d in self.historical_data])
        self.expenses = np.array([d.expenses for d in self.historical_data])
        self.cash_balances = np.array([d.cash_balance for d in self.historical_data])
        self.burn_rates = self.expenses - self.revenues
        self.time_indices = np.arange(len(self.historical_data)).reshape(-1, 1)
    
    def _calculate_risk_level(self, runway_months: float) -> RiskLevel:
        """Determine risk level based on runway."""
        if runway_months < 3:
            return RiskLevel.CRITICAL
        elif runway_months < 6:
            return RiskLevel.HIGH
        elif runway_months < 12:
            return RiskLevel.MEDIUM
        return RiskLevel.LOW
    
    def _get_future_month(self, months_ahead: int) -> str:
        """Calculate the month string for N months in the future."""
        last_month = datetime.strptime(self.months[-1], "%Y-%m")
        future_month = last_month + relativedelta(months=months_ahead)
        return future_month.strftime("%Y-%m")
    
    def _linear_forecast(self, values: np.ndarray, periods: int) -> Tuple[np.ndarray, float, float]:
        """
        Perform linear regression forecast.
        
        Returns:
            Tuple of (predictions, slope, intercept)
        """
        if len(values) < 2:
            # Not enough data for regression, return constant
            return np.full(periods, values[-1] if len(values) > 0 else 0), 0, values[-1] if len(values) > 0 else 0
        
        model = LinearRegression()
        model.fit(self.time_indices, values)
        
        future_indices = np.arange(len(values), len(values) + periods).reshape(-1, 1)
        predictions = model.predict(future_indices)
        
        return predictions, model.coef_[0], model.intercept_
    
    def _moving_average_forecast(self, values: np.ndarray, periods: int, window: int = 3) -> np.ndarray:
        """
        Perform moving average forecast.
        Uses the average of the last `window` periods for prediction.
        """
        if len(values) < window:
            window = len(values)
        
        if window == 0:
            return np.zeros(periods)
        
        ma_value = np.mean(values[-window:])
        return np.full(periods, ma_value)
    
    def _exponential_smoothing_forecast(self, values: np.ndarray, periods: int, alpha: float = 0.3) -> np.ndarray:
        """
        Perform simple exponential smoothing forecast.
        
        Args:
            alpha: Smoothing factor (0-1). Higher = more weight on recent data.
        """
        if len(values) == 0:
            return np.zeros(periods)
        
        # Calculate the smoothed value
        smoothed = values[0]
        for val in values[1:]:
            smoothed = alpha * val + (1 - alpha) * smoothed
        
        # For simple exponential smoothing, forecast is constant
        return np.full(periods, smoothed)
    
    def _calculate_confidence_intervals(self, values: np.ndarray, predictions: np.ndarray, 
                                         confidence: float = 0.95) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculate confidence intervals based on historical variance.
        
        Returns:
            Tuple of (lower_bounds, upper_bounds)
        """
        if len(values) < 2:
            # Not enough data, use 20% variance
            variance_pct = 0.2
        else:
            # Calculate coefficient of variation
            std_dev = np.std(values)
            mean_val = np.mean(values)
            if mean_val != 0:
                variance_pct = std_dev / abs(mean_val)
            else:
                variance_pct = 0.2
        
        # Increase uncertainty for further predictions
        uncertainty_multipliers = np.array([1 + 0.1 * i for i in range(len(predictions))])
        
        # Z-score for 95% confidence is approximately 1.96
        z_score = 1.96 if confidence == 0.95 else 1.645  # 90% confidence
        
        margin = predictions * variance_pct * z_score * uncertainty_multipliers
        
        lower_bounds = predictions - margin
        upper_bounds = predictions + margin
        
        return lower_bounds, upper_bounds
    
    def _ensemble_forecast(self, values: np.ndarray, periods: int) -> np.ndarray:
        """
        Combine multiple forecasting methods with weighted average.
        Weights: Linear (40%), Moving Average (30%), Exponential Smoothing (30%)
        """
        linear_pred, _, _ = self._linear_forecast(values, periods)
        ma_pred = self._moving_average_forecast(values, periods)
        es_pred = self._exponential_smoothing_forecast(values, periods)
        
        # Weighted combination
        ensemble = 0.4 * linear_pred + 0.3 * ma_pred + 0.3 * es_pred
        return ensemble
    
    def forecast(self, periods: int = 6, method: ForecastMethod = ForecastMethod.ENSEMBLE) -> ForecastResult:
        """
        Generate financial forecast for the specified number of periods.
        
        Args:
            periods: Number of months to forecast (default: 6)
            method: Forecasting method to use (default: ensemble)
        
        Returns:
            ForecastResult with projections and analysis
        """
        if len(self.historical_data) == 0:
            raise ValueError("No historical data provided for forecasting")
        
        # Select forecasting function based on method
        if method == ForecastMethod.LINEAR:
            revenue_pred, _, _ = self._linear_forecast(self.revenues, periods)
            expenses_pred, _, _ = self._linear_forecast(self.expenses, periods)
        elif method == ForecastMethod.MOVING_AVERAGE:
            revenue_pred = self._moving_average_forecast(self.revenues, periods)
            expenses_pred = self._moving_average_forecast(self.expenses, periods)
        elif method == ForecastMethod.EXPONENTIAL_SMOOTHING:
            revenue_pred = self._exponential_smoothing_forecast(self.revenues, periods)
            expenses_pred = self._exponential_smoothing_forecast(self.expenses, periods)
        else:  # ENSEMBLE
            revenue_pred = self._ensemble_forecast(self.revenues, periods)
            expenses_pred = self._ensemble_forecast(self.expenses, periods)
        
        # Ensure non-negative values
        revenue_pred = np.maximum(revenue_pred, 0)
        expenses_pred = np.maximum(expenses_pred, 0)
        
        # Calculate burn rate predictions
        burn_rate_pred = expenses_pred - revenue_pred
        
        # Calculate cash balance projections
        current_cash = self.cash_balances[-1] if len(self.cash_balances) > 0 else 0
        cash_balance_pred = np.zeros(periods)
        for i in range(periods):
            if i == 0:
                cash_balance_pred[i] = current_cash - burn_rate_pred[i]
            else:
                cash_balance_pred[i] = cash_balance_pred[i-1] - burn_rate_pred[i]
        
        # Ensure cash balance doesn't go below 0 for display purposes
        cash_balance_pred = np.maximum(cash_balance_pred, 0)
        
        # Calculate confidence intervals for cash balance
        cash_lower, cash_upper = self._calculate_confidence_intervals(
            self.cash_balances, cash_balance_pred
        )
        
        # Build forecast points
        projections = []
        for i in range(periods):
            future_month = self._get_future_month(i + 1)
            
            # Calculate runway at this point
            if burn_rate_pred[i] > 0:
                runway = cash_balance_pred[i] / burn_rate_pred[i]
            else:
                runway = 999.9  # Profitable
            
            risk_level = self._calculate_risk_level(runway)
            
            projections.append(ForecastPoint(
                month=future_month,
                predicted_revenue=round(revenue_pred[i], 2),
                predicted_expenses=round(expenses_pred[i], 2),
                predicted_cash_balance=round(cash_balance_pred[i], 2),
                predicted_burn_rate=round(burn_rate_pred[i], 2),
                predicted_runway_months=round(runway, 1),
                confidence_lower=round(max(0, cash_lower[i]), 2),
                confidence_upper=round(cash_upper[i], 2),
                risk_level=risk_level
            ))
        
        # Generate summary statistics
        avg_burn = np.mean(burn_rate_pred)
        final_cash = cash_balance_pred[-1]
        final_runway = projections[-1].predicted_runway_months
        
        # Determine when critical runway is reached (if applicable)
        critical_month = None
        for proj in projections:
            if proj.risk_level == RiskLevel.CRITICAL:
                critical_month = proj.month
                break
        
        summary = {
            "current_cash_balance": round(current_cash, 2),
            "average_predicted_burn_rate": round(avg_burn, 2),
            "final_predicted_cash_balance": round(final_cash, 2),
            "final_predicted_runway_months": round(final_runway, 1),
            "critical_runway_month": critical_month,
            "trend": "declining" if avg_burn > 0 else "growing",
            "recommendation": self._generate_recommendation(final_runway, critical_month)
        }
        
        return ForecastResult(
            method_used=method,
            forecast_generated_at=datetime.utcnow().isoformat(),
            historical_months=len(self.historical_data),
            forecast_months=periods,
            projections=projections,
            summary=summary
        )
    
    def _generate_recommendation(self, runway: float, critical_month: Optional[str]) -> str:
        """Generate actionable recommendation based on forecast."""
        if runway >= 12:
            return "Runway is healthy. Focus on growth initiatives."
        elif runway >= 6:
            return "Runway is adequate. Consider optimizing burn rate and exploring fundraising options."
        elif runway >= 3:
            return "Warning: Runway is limited. Begin fundraising conversations immediately or implement cost reductions."
        elif critical_month:
            return f"CRITICAL: Runway falls below safe threshold by {critical_month}. Immediate action required: cut costs, accelerate revenue, or secure emergency funding."
        else:
            return "CRITICAL: Immediate intervention required. Runway is dangerously low."
    
    def project_to_date(self, target_date: str, method: ForecastMethod = ForecastMethod.ENSEMBLE) -> ForecastPoint:
        """
        Project financial status to a specific future date.
        
        Args:
            target_date: Target date in YYYY-MM format
            method: Forecasting method to use
        
        Returns:
            ForecastPoint for the target date
        """
        if len(self.historical_data) == 0:
            raise ValueError("No historical data provided for forecasting")
        
        last_month = datetime.strptime(self.months[-1], "%Y-%m")
        target_month = datetime.strptime(target_date, "%Y-%m")
        
        # Calculate months difference
        months_diff = (target_month.year - last_month.year) * 12 + (target_month.month - last_month.month)
        
        if months_diff <= 0:
            raise ValueError("Target date must be in the future")
        
        if months_diff > 36:
            raise ValueError("Forecast horizon limited to 36 months")
        
        # Generate full forecast and return the target point
        forecast_result = self.forecast(periods=months_diff, method=method)
        return forecast_result.projections[-1]


def create_forecast_from_records(records: List[dict]) -> ForecastEngine:
    """
    Helper function to create a ForecastEngine from financial records.
    
    Args:
        records: List of financial record dictionaries with keys:
                 month, revenue_recurring, revenue_one_time, expenses_*, cash_balance
    
    Returns:
        ForecastEngine instance ready for forecasting
    """
    data_points = []
    for record in records:
        total_revenue = record.get("revenue_recurring", 0) + record.get("revenue_one_time", 0)
        total_expenses = (
            record.get("expenses_salaries", 0) +
            record.get("expenses_marketing", 0) +
            record.get("expenses_infrastructure", 0) +
            record.get("expenses_other", 0)
        )
        burn_rate = total_expenses - total_revenue
        
        data_points.append(MonthlyDataPoint(
            month=record["month"],
            revenue=total_revenue,
            expenses=total_expenses,
            cash_balance=record.get("cash_balance", 0),
            burn_rate=burn_rate
        ))
    
    return ForecastEngine(data_points)
