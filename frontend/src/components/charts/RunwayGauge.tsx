import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useMemo, useEffect } from 'react';

ChartJS.register(ArcElement, Tooltip);

interface RunwayGaugeProps {
  months: number;
}

export function RunwayGauge({ months }: RunwayGaugeProps) {
  const { color, label, backgroundColor } = useMemo(() => {
    if (months < 3) return { color: '#ef4444', backgroundColor: '#fee2e2', label: 'Critical' }; // red
    if (months < 6) return { color: '#f97316', backgroundColor: '#ffedd5', label: 'Warning' }; // orange
    if (months < 12) return { color: '#facc15', backgroundColor: '#fef9c3', label: 'Caution' }; // yellow
    return { color: '#22c55e', backgroundColor: '#dcfce7', label: 'Healthy' }; // green
  }, [months]);

  // Framer Motion animation for the number
  const animatedMonths = useSpring(0, {
    damping: 30,
    stiffness: 200,
  });
  const roundedMonths = useTransform(animatedMonths, (latest) => latest.toFixed(1));

  useEffect(() => {
    animatedMonths.set(months);
  }, [months, animatedMonths]);

  const data = {
    datasets: [
      {
        data: [months, Math.max(0, 18 - months)], // Represents runway out of a typical 18-month cycle
        backgroundColor: [color, '#e5e7eb'], // Active color and gray for the rest
        borderColor: ['#ffffff'],
        borderWidth: 2,
        circumference: 180, // Half circle
        rotation: 270, // Starts from the bottom
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: '80%',
    plugins: {
      tooltip: {
        enabled: false, // Disable the default chart tooltip
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Financial Runway</h3>
      <div className="relative w-48 h-24">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <motion.span className="text-4xl font-bold text-gray-900">
            {roundedMonths}
          </motion.span>
          <span className="text-sm text-gray-500 font-medium">months</span>
        </div>
      </div>
      <div className="mt-4">
         <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ color: color, backgroundColor: backgroundColor }}>
            {label}
        </span>
      </div>
    </div>
  );
}
