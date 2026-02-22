import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  PiggyBank,
  AlertCircle,
  type LucideIcon
} from 'lucide-react';
import type { DashboardMetric } from '@/types/dashboard.types';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'wallet': Wallet,
  'credit-card': CreditCard,
  'piggy-bank': PiggyBank,
  'alert-circle': AlertCircle,
};

interface StatCardProps {
  metric: DashboardMetric;
}

export function StatCard({ metric }: StatCardProps) {
  const isPositive = metric.changeType === 'positive';
  const isWarning = metric.changeType === 'warning';
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  
  // Get the icon component or default to DollarSign
  const MetricIcon = metric.icon ? (iconMap[metric.icon] || DollarSign) : DollarSign;

  // Determine change text color
  const getChangeColor = () => {
    if (isWarning) return 'text-warning';
    if (isPositive) return 'text-success';
    return 'text-danger';
  };

  // Determine change background color for the indicator
  const getChangeBgColor = () => {
    if (isWarning) return 'bg-warning/10';
    if (isPositive) return 'bg-success/10';
    return 'bg-danger/10';
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all group">
      {/* Top Row: Label and Icon */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{metric.label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 group-hover:bg-primary-50 transition-colors">
          <MetricIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
        </div>
      </div>
      
      {/* Value */}
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</h3>
      
      {/* Change Indicator */}
      {metric.change && (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${getChangeBgColor()}`}>
          {!isWarning && <ChangeIcon className={`h-4 w-4 ${getChangeColor()}`} />}
          {isWarning && <AlertCircle className={`h-4 w-4 ${getChangeColor()}`} />}
          <span className={`text-sm font-semibold ${getChangeColor()}`}>
            {metric.change}
          </span>
        </div>
      )}
    </div>
  );
}
