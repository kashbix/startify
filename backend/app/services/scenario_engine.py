"""
What-If Scenario Analyzer for STRATA-AI (FR-5)

This module provides scenario simulation capabilities to test the financial
impact of hypothetical business decisions before executing them.

Features:
- Pre-built scenario templates (hiring, marketing, pricing, etc.)
- Custom scenario builder
- Side-by-side comparison of multiple scenarios
- Impact metrics: runway change, break-even timeline, risk delta
"""

from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum
import copy


class ScenarioType(str, Enum):
    """Pre-built scenario types."""
    HIRE_EMPLOYEE = "hire_employee"
    CHANGE_MARKETING = "change_marketing"
    CHANGE_PRICING = "change_pricing"
    LOSE_CUSTOMER = "lose_customer"
    RECEIVE_INVESTMENT = "receive_investment"
    CUT_EXPENSES = "cut_expenses"
    CUSTOM = "custom"


class RiskLevel(str, Enum):
    """Risk assessment levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ScenarioInput(BaseModel):
    """Input parameters for a scenario simulation."""
    scenario_type: ScenarioType
    name: str = Field(..., description="Name/label for this scenario")
    
    # Hiring scenario
    new_salary: Optional[float] = Field(None, description="Monthly salary for new hire")
    num_hires: Optional[int] = Field(None, description="Number of new hires")
    
    # Marketing scenario
    marketing_change: Optional[float] = Field(None, description="Change in marketing spend (positive=increase)")
    
    # Pricing scenario
    revenue_change_percent: Optional[float] = Field(None, description="Expected revenue change percentage")
    
    # Customer loss scenario
    revenue_loss: Optional[float] = Field(None, description="Monthly revenue to lose")
    
    # Investment scenario
    investment_amount: Optional[float] = Field(None, description="Investment/funding amount")
    
    # Expense cut scenario
    expense_cut: Optional[float] = Field(None, description="Monthly expense reduction")
    expense_category: Optional[str] = Field(None, description="Category to cut: salaries, marketing, infrastructure, other")
    
    # Custom scenario (direct modifications)
    custom_revenue_change: Optional[float] = Field(None, description="Direct revenue change per month")
    custom_expense_change: Optional[float] = Field(None, description="Direct expense change per month")
    custom_cash_change: Optional[float] = Field(None, description="One-time cash change")


class FinancialSnapshot(BaseModel):
    """Snapshot of financial state at a point in time."""
    cash_balance: float
    monthly_revenue: float
    monthly_expenses: float
    burn_rate: float
    runway_months: float
    risk_level: RiskLevel


class ScenarioResult(BaseModel):
    """Result of a single scenario simulation."""
    scenario_name: str
    scenario_type: ScenarioType
    
    # Before/After comparison
    baseline: FinancialSnapshot
    projected: FinancialSnapshot
    
    # Impact metrics
    runway_change: float  # Positive = runway increased
    burn_rate_change: float  # Negative = burn decreased (good)
    risk_change: str  # e.g., "medium -> low"
    break_even_months: Optional[float]  # Months until profitable (if applicable)
    
    # Analysis
    summary: str
    recommendation: str


class ScenarioComparison(BaseModel):
    """Side-by-side comparison of multiple scenarios."""
    baseline: FinancialSnapshot
    scenarios: List[ScenarioResult]
    best_scenario: Optional[str]  # Name of the recommended scenario
    comparison_generated_at: str


class ScenarioEngine:
    """
    Engine for running what-if scenario simulations.
    """
    
    def __init__(self, current_financial_state: Dict[str, float]):
        """
        Initialize with current financial state.
        
        Args:
            current_financial_state: Dict with keys:
                - cash_balance: Current cash
                - revenue_recurring: Monthly recurring revenue
                - revenue_one_time: One-time revenue (treated as 0 for projections)
                - expenses_salaries: Monthly salary expenses
                - expenses_marketing: Monthly marketing expenses
                - expenses_infrastructure: Monthly infrastructure costs
                - expenses_other: Other monthly expenses
        """
        self.state = current_financial_state
        self._calculate_baseline()
    
    def _calculate_baseline(self):
        """Calculate baseline metrics from current state."""
        self.total_revenue = (
            self.state.get("revenue_recurring", 0) + 
            self.state.get("revenue_one_time", 0)
        )
        self.total_expenses = (
            self.state.get("expenses_salaries", 0) +
            self.state.get("expenses_marketing", 0) +
            self.state.get("expenses_infrastructure", 0) +
            self.state.get("expenses_other", 0)
        )
        self.burn_rate = self.total_expenses - self.total_revenue
        self.cash_balance = self.state.get("cash_balance", 0)
        
        if self.burn_rate > 0:
            self.runway_months = self.cash_balance / self.burn_rate
        else:
            self.runway_months = 999.9  # Profitable
    
    def _get_risk_level(self, runway: float) -> RiskLevel:
        """Determine risk level based on runway."""
        if runway < 3:
            return RiskLevel.CRITICAL
        elif runway < 6:
            return RiskLevel.HIGH
        elif runway < 12:
            return RiskLevel.MEDIUM
        return RiskLevel.LOW
    
    def _get_baseline_snapshot(self) -> FinancialSnapshot:
        """Get baseline financial snapshot."""
        return FinancialSnapshot(
            cash_balance=round(self.cash_balance, 2),
            monthly_revenue=round(self.total_revenue, 2),
            monthly_expenses=round(self.total_expenses, 2),
            burn_rate=round(self.burn_rate, 2),
            runway_months=round(self.runway_months, 1),
            risk_level=self._get_risk_level(self.runway_months)
        )
    
    def _calculate_break_even(self, revenue: float, expenses: float, 
                               revenue_growth_rate: float = 0.05) -> Optional[float]:
        """
        Calculate months until break-even assuming revenue growth.
        Returns None if already profitable or break-even not achievable in 36 months.
        """
        if revenue >= expenses:
            return 0  # Already profitable
        
        gap = expenses - revenue
        current_revenue = revenue
        
        for month in range(1, 37):
            current_revenue *= (1 + revenue_growth_rate)
            if current_revenue >= expenses:
                return month
        
        return None  # Not achievable in 36 months
    
    def simulate_scenario(self, scenario: ScenarioInput) -> ScenarioResult:
        """
        Simulate a single scenario and return the results.
        """
        # Start with baseline values
        new_revenue = self.total_revenue
        new_expenses = self.total_expenses
        new_cash = self.cash_balance
        
        # Apply scenario modifications
        if scenario.scenario_type == ScenarioType.HIRE_EMPLOYEE:
            salary = scenario.new_salary or 5000
            num = scenario.num_hires or 1
            new_expenses += salary * num
        
        elif scenario.scenario_type == ScenarioType.CHANGE_MARKETING:
            change = scenario.marketing_change or 0
            new_expenses += change
            # Assume marketing affects revenue (simplified: 20% of spend increase = revenue increase)
            if change > 0:
                new_revenue += change * 0.2
        
        elif scenario.scenario_type == ScenarioType.CHANGE_PRICING:
            percent = scenario.revenue_change_percent or 0
            new_revenue *= (1 + percent / 100)
        
        elif scenario.scenario_type == ScenarioType.LOSE_CUSTOMER:
            loss = scenario.revenue_loss or 0
            new_revenue = max(0, new_revenue - loss)
        
        elif scenario.scenario_type == ScenarioType.RECEIVE_INVESTMENT:
            amount = scenario.investment_amount or 0
            new_cash += amount
        
        elif scenario.scenario_type == ScenarioType.CUT_EXPENSES:
            cut = scenario.expense_cut or 0
            new_expenses = max(0, new_expenses - cut)
        
        elif scenario.scenario_type == ScenarioType.CUSTOM:
            if scenario.custom_revenue_change:
                new_revenue += scenario.custom_revenue_change
            if scenario.custom_expense_change:
                new_expenses += scenario.custom_expense_change
            if scenario.custom_cash_change:
                new_cash += scenario.custom_cash_change
        
        # Ensure non-negative values
        new_revenue = max(0, new_revenue)
        new_expenses = max(0, new_expenses)
        new_cash = max(0, new_cash)
        
        # Calculate new metrics
        new_burn = new_expenses - new_revenue
        if new_burn > 0:
            new_runway = new_cash / new_burn
        else:
            new_runway = 999.9
        
        # Create projected snapshot
        baseline = self._get_baseline_snapshot()
        projected = FinancialSnapshot(
            cash_balance=round(new_cash, 2),
            monthly_revenue=round(new_revenue, 2),
            monthly_expenses=round(new_expenses, 2),
            burn_rate=round(new_burn, 2),
            runway_months=round(new_runway, 1),
            risk_level=self._get_risk_level(new_runway)
        )
        
        # Calculate impact metrics
        runway_change = new_runway - self.runway_months
        if runway_change > 100:  # Cap for display
            runway_change = 999.9
        
        burn_change = new_burn - self.burn_rate
        risk_change = f"{baseline.risk_level.value} -> {projected.risk_level.value}"
        
        break_even = self._calculate_break_even(new_revenue, new_expenses)
        
        # Generate summary and recommendation
        summary = self._generate_summary(scenario, baseline, projected, runway_change)
        recommendation = self._generate_recommendation(scenario, projected, runway_change)
        
        return ScenarioResult(
            scenario_name=scenario.name,
            scenario_type=scenario.scenario_type,
            baseline=baseline,
            projected=projected,
            runway_change=round(runway_change, 1),
            burn_rate_change=round(burn_change, 2),
            risk_change=risk_change,
            break_even_months=break_even,
            summary=summary,
            recommendation=recommendation
        )
    
    def _generate_summary(self, scenario: ScenarioInput, baseline: FinancialSnapshot,
                          projected: FinancialSnapshot, runway_change: float) -> str:
        """Generate a human-readable summary of the scenario impact."""
        direction = "increases" if runway_change > 0 else "decreases"
        abs_change = abs(runway_change)
        
        if scenario.scenario_type == ScenarioType.HIRE_EMPLOYEE:
            return f"Hiring {scenario.num_hires or 1} employee(s) at ${scenario.new_salary or 5000}/mo {direction} runway by {abs_change:.1f} months."
        elif scenario.scenario_type == ScenarioType.CHANGE_MARKETING:
            action = "Increasing" if (scenario.marketing_change or 0) > 0 else "Decreasing"
            return f"{action} marketing spend by ${abs(scenario.marketing_change or 0)}/mo {direction} runway by {abs_change:.1f} months."
        elif scenario.scenario_type == ScenarioType.CHANGE_PRICING:
            return f"Changing pricing by {scenario.revenue_change_percent or 0}% {direction} runway by {abs_change:.1f} months."
        elif scenario.scenario_type == ScenarioType.LOSE_CUSTOMER:
            return f"Losing ${scenario.revenue_loss or 0}/mo in revenue {direction} runway by {abs_change:.1f} months."
        elif scenario.scenario_type == ScenarioType.RECEIVE_INVESTMENT:
            return f"Receiving ${scenario.investment_amount or 0} investment {direction} runway by {abs_change:.1f} months."
        elif scenario.scenario_type == ScenarioType.CUT_EXPENSES:
            return f"Cutting ${scenario.expense_cut or 0}/mo in expenses {direction} runway by {abs_change:.1f} months."
        else:
            return f"This scenario {direction} runway by {abs_change:.1f} months."
    
    def _generate_recommendation(self, scenario: ScenarioInput, 
                                  projected: FinancialSnapshot, runway_change: float) -> str:
        """Generate a recommendation based on the scenario outcome."""
        if projected.risk_level == RiskLevel.CRITICAL:
            return "⚠️ NOT RECOMMENDED: This scenario puts your startup at critical risk."
        elif projected.risk_level == RiskLevel.HIGH:
            return "⚠️ CAUTION: This scenario results in high risk. Consider alternatives."
        elif runway_change < -3:
            return "⚠️ CAUTION: Significant runway reduction. Ensure you have a growth plan."
        elif runway_change > 6:
            return "✅ RECOMMENDED: This scenario significantly improves your runway."
        elif runway_change > 0:
            return "✅ FAVORABLE: This scenario improves your financial position."
        elif runway_change > -1:
            return "➡️ NEUTRAL: Minimal impact on runway. Consider strategic value."
        else:
            return "⚠️ REVIEW: This scenario reduces runway. Weigh benefits carefully."
    
    def compare_scenarios(self, scenarios: List[ScenarioInput]) -> ScenarioComparison:
        """
        Run multiple scenarios and provide side-by-side comparison.
        """
        results = [self.simulate_scenario(s) for s in scenarios]
        
        # Find best scenario (highest runway that's not critical risk)
        best = None
        best_runway = -999
        for result in results:
            if result.projected.risk_level != RiskLevel.CRITICAL:
                if result.projected.runway_months > best_runway:
                    best_runway = result.projected.runway_months
                    best = result.scenario_name
        
        return ScenarioComparison(
            baseline=self._get_baseline_snapshot(),
            scenarios=results,
            best_scenario=best,
            comparison_generated_at=datetime.utcnow().isoformat()
        )


def create_scenario_engine_from_record(record: dict) -> ScenarioEngine:
    """
    Helper to create ScenarioEngine from a financial record dictionary.
    """
    return ScenarioEngine({
        "cash_balance": record.get("cash_balance", 0),
        "revenue_recurring": record.get("revenue_recurring", 0),
        "revenue_one_time": record.get("revenue_one_time", 0),
        "expenses_salaries": record.get("expenses_salaries", 0),
        "expenses_marketing": record.get("expenses_marketing", 0),
        "expenses_infrastructure": record.get("expenses_infrastructure", 0),
        "expenses_other": record.get("expenses_other", 0),
    })
