import type { Scenario } from '@/types/scenario.types';
import { ArrowUpRight, ArrowDownRight, BarChart3, DollarSign, Users, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScenarioCardProps {
  scenario: Scenario;
}

// Icon mapping based on scenario type
const typeIcons: Record<string, React.ElementType> = {
  hire: Users,
  hiring: Users,
  pricing: DollarSign,
  'cut_expense': TrendingDown,
  'cost-cutting': TrendingDown,
  default: BarChart3,
};

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const navigate = useNavigate();
  const { id, name, type, result } = scenario;
  const isPositive = result.runwayDelta >= 0;
  const DeltaIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const TypeIcon = typeIcons[type] || typeIcons.default;

  const handleClick = () => {
    navigate(`/scenarios/${id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors">
            <TypeIcon className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <span className="text-xs text-gray-500 capitalize">{type} scenario</span>
          </div>
        </div>
      </div>

      {/* Impact */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">Runway Impact</span>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
          isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}>
          <DeltaIcon className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {isPositive ? '+' : ''}{result.runwayDelta.toFixed(1)} months
          </span>
        </div>
      </div>
    </div>
  );
}
