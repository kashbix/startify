import { useScenarios } from '@/hooks/useScenarios';
import { ScenarioCard } from '@/components/shared/ScenarioCard';
import { Loader2, FolderOpen } from 'lucide-react';
import { useUiStore } from '@/stores/ui.store';

export function ScenariosPage() {
  const { data: scenarios, isLoading, isError } = useScenarios();
  const { openModal } = useUiStore();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-xl">
          Error fetching scenarios. Please try again.
        </div>
      );
    }

    if (scenarios?.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-card">
          <FolderOpen className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No scenarios yet</h3>
          <p className="text-sm text-gray-500 mb-4">Get started by creating your first what-if scenario</p>
          <button 
            onClick={() => openModal('createScenario')}
            className="text-primary-500 font-medium hover:text-primary-600 hover:underline transition-all"
          >
            Create your first scenario →
          </button>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {scenarios?.map(scenario => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}
