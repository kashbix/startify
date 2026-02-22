from app.models.financial import FinancialRecord

def calculate_burn_rate(record: FinancialRecord) -> float:
    total_revenue = record.revenue_recurring + record.revenue_one_time
    total_expenses = (
        record.expenses_salaries + 
        record.expenses_marketing + 
        record.expenses_infrastructure + 
        record.expenses_other
    )
    # Net Burn = Expenses - Revenue (Positive means burning cash)
    return total_expenses - total_revenue

def calculate_runway_months(cash_balance: float, burn_rate: float) -> float:
    if burn_rate <= 0:
        return 999.9  # Profitable (Infinite runway)
    if cash_balance <= 0:
        return 0.0    # Bankrupt
    
    return round(cash_balance / burn_rate, 1)