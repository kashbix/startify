import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import type { CashFlowDataPoint } from '@/types/dashboard.types';
import { useState } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface CashFlowChartProps {
  data: CashFlowDataPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const [timeRange, setTimeRange] = useState('This Year');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Check if we have valid data
  const hasData = data && data.length > 0 && data.some(d => d.balance > 0 || (d.income && d.income > 0) || (d.expenses && d.expenses > 0));

  const chartData = {
    labels: hasData ? data.map(d => d.month) : [],
    datasets: [
      {
        label: 'Income',
        data: hasData ? data.map(d => d.income ?? 0) : [],
        borderColor: '#1B8A6B',
        backgroundColor: 'rgba(27, 138, 107, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#1B8A6B',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: 'Expenses',
        data: hasData ? data.map(d => d.expenses ?? 0) : [],
        borderColor: '#EF4444',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderDash: [5, 5],
        pointRadius: 4,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      {
        label: 'Net',
        data: hasData ? data.map(d => d.net ?? (d.balance || 0)) : [],
        borderColor: '#F97316',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderDash: [3, 3],
        pointRadius: 4,
        pointBackgroundColor: '#F97316',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // We'll create custom legend
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1f2937',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const label = context.dataset.label || '';
            const value = context.parsed.y ?? 0;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
          },
          callback: function(value: number | string) {
            return '$' + Number(value).toLocaleString();
          },
        },
      },
    },
  };

  const timeRanges = ['This Year', 'Last Year', 'Last 6 Months', 'Last 3 Months'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Cash Flow Analysis</h3>
        
        {hasData && (
          <div className="flex items-center gap-6">
            {/* Custom Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary-500" />
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-danger" />
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-sm text-gray-600">Net</span>
              </div>
            </div>

            {/* Time Range Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                {timeRange}
                <ChevronDown className="h-4 w-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-gray-200 bg-white py-2 shadow-lg z-10">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setIsDropdownOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-primary-50 hover:text-primary-600 ${
                        timeRange === range ? 'text-primary-500 font-medium bg-primary-50' : 'text-gray-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-72 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">No cash flow data</p>
          <p className="text-xs text-gray-400 mt-1">Import financial data to see analysis</p>
        </div>
      ) : (
        /* Chart */
        <div className="h-72">
          <Line options={options} data={chartData} />
        </div>
      )}
    </div>
  );
}
