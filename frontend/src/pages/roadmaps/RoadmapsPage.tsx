import { useRoadmaps } from '@/hooks/useRoadmaps';
import { RoadmapCard } from '@/components/shared/RoadmapCard';
import { Loader2, Map } from 'lucide-react';

export function RoadmapsPage() {
  const { data: roadmaps, isLoading } = useRoadmaps();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!roadmaps || roadmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-card">
        <Map className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No roadmaps yet</h3>
        <p className="text-sm text-gray-500 mb-4">Generate ideas first, then create roadmaps from them</p>
        <a href="/ideation" className="text-primary-500 font-medium hover:text-primary-600 hover:underline transition-all">
          Go to Ideation →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roadmaps.map(roadmap => (
          <RoadmapCard key={roadmap.id} roadmap={roadmap} />
        ))}
      </div>
    </div>
  );
}
