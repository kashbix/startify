export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'warning' | 'neutral';
  icon?: string; // Icon name from lucide-react
}

export interface CashFlowDataPoint {
  month: string;
  balance: number;
  income?: number;
  expenses?: number;
  net?: number;
}

export interface ExpenseCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface RevenueComparison {
  month: string;
  currentYear: number;
  previousYear: number;
}

export interface DashboardData {
  runwayMonths: number;
  metrics: DashboardMetric[];
  cashFlow: CashFlowDataPoint[];
  expenseBreakdown?: ExpenseCategory[];
  revenueComparison?: RevenueComparison[];
}
