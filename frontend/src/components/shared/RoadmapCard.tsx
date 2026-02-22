import { Link } from 'react-router-dom';
import type { Roadmap } from '@/types/roadmap.types';
import { GanttChartSquare, Clock, ArrowRight } from 'lucide-react';

export function RoadmapCard({ roadmap }: { roadmap: Roadmap }) {
  // Determine progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-success';
    if (progress >= 50) return 'bg-primary-500';
    if (progress >= 25) return 'bg-warning';
    return 'bg-gray-300';
  };

  return (
    <Link to={`/roadmaps/${roadmap.id}`} className="block group">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all cursor-pointer h-full">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors flex-shrink-0">
            <GanttChartSquare className="h-5 w-5 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{roadmap.title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{roadmap.totalDurationWeeks} weeks</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>

        {/* Progress */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-semibold text-gray-700">{roadmap.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${getProgressColor(roadmap.progress)}`}
              style={{ width: `${roadmap.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
