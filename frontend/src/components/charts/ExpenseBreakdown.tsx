import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { ExpenseCategory } from '@/types/dashboard.types';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseBreakdownProps {
  data?: ExpenseCategory[];
  totalExpenses?: number;
}

export function ExpenseBreakdown({ data, totalExpenses }: ExpenseBreakdownProps) {
  // Check if we have valid data
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);
  
  // Calculate total if not provided
  const total = totalExpenses || (data?.reduce((sum, item) => sum + item.value, 0) ?? 0);

  const chartData = {
    labels: hasData ? data!.map(d => d.name) : ['No Data'],
    datasets: [
      {
        data: hasData ? data!.map(d => d.value) : [1],
        backgroundColor: hasData ? data!.map(d => d.color) : ['#e5e7eb'],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false, // Custom legend below
      },
      tooltip: {
        enabled: hasData, // Disable tooltip when no data
        backgroundColor: '#fff',
        titleColor: '#1f2937',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context: { label: string; parsed: number }) {
            return `${context.label}: $${context.parsed.toLocaleString()}`;
          }
        }
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h3>

      {!hasData ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <PieChart className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">No expense data</p>
          <p className="text-xs text-gray-400 mt-1">Import financial data to see breakdown</p>
        </div>
      ) : (
        <>
          {/* Chart with center text */}
          <div className="relative h-48 mb-6">
            <Doughnut data={chartData} options={options} />
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-gray-500 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3">
            {data!.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span 
                    className="flex-shrink-0 h-3 w-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-500 truncate">{item.name}:</span>
                </div>
                <span className="text-xs font-semibold text-gray-900">
                  ${(item.value / 1000).toFixed(1)}k
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
