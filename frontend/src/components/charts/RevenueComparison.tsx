import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import type { RevenueComparison as RevenueComparisonData } from '@/types/dashboard.types';
import { BarChart3 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RevenueComparisonProps {
  data?: RevenueComparisonData[];
  currentYearLabel?: string;
  previousYearLabel?: string;
}

export function RevenueComparison({ 
  data, 
  currentYearLabel = '2026',
  previousYearLabel = '2025'
}: RevenueComparisonProps) {
  // Check if we have valid data
  const hasData = data && data.length > 0 && data.some(item => item.currentYear > 0 || item.previousYear > 0);
  
  const chartData = {
    labels: hasData ? data!.map(d => d.month) : [],
    datasets: [
      {
        label: currentYearLabel,
        data: hasData ? data!.map(d => d.currentYear) : [],
        backgroundColor: '#1B8A6B',
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: previousYearLabel,
        data: hasData ? data!.map(d => d.previousYear) : [],
        backgroundColor: '#d1fae5',
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
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
        display: false, // Custom legend
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
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
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
            const numValue = Number(value);
            if (numValue >= 1000) {
              return '$' + (numValue / 1000) + 'k';
            }
            return '$' + numValue;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Comparison</h3>
        
        {hasData && (
          /* Custom Legend */
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary-500" />
              <span className="text-sm text-gray-600">{currentYearLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary-100" />
              <span className="text-sm text-gray-600">{previousYearLabel}</span>
            </div>
          </div>
        )}
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">No revenue data</p>
          <p className="text-xs text-gray-400 mt-1">Import financial data to see comparison</p>
        </div>
      ) : (
        /* Chart */
        <div className="h-64">
          <Bar options={options} data={chartData} />
        </div>
      )}
    </div>
  );
}
