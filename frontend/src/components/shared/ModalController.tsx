import { useUiStore } from '@/stores/ui.store';
import { Modal } from '@/components/ui/Modal';
import { ScenarioForm } from '@/components/forms/ScenarioForm';
import { IdeaForm } from '@/components/forms/IdeaForm';
import { RoadmapForm } from '@/components/forms/RoadmapForm';

export function ModalController() {
  const { type, isOpen } = useUiStore();

  // Don't render anything if modal is not open
  if (!isOpen || !type) {
    return null;
  }

  const renderModalContent = () => {
    switch (type) {
      case 'createScenario':
        return <ScenarioForm />;
      case 'createIdea':
        return <IdeaForm />;
      case 'createRoadmap':
        return <RoadmapForm />;
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'createScenario':
        return 'Create New Scenario';
      case 'createIdea':
        return 'Generate AI Ideas';
      case 'createRoadmap':
        return 'Create New Roadmap';
      default:
        return '';
    }
  };

  return (
    <Modal title={getModalTitle()}>
      {renderModalContent()}
    </Modal>
  );
}
