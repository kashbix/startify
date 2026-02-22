import { useState } from 'react';
import { useGenerateIdeas } from '@/hooks/useIdeation';
import { Button } from '@/components/ui/Button';
import { useUiStore } from '@/stores/ui.store';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';

export function IdeaForm() {
  const { closeModal } = useUiStore();
  const [context, setContext] = useState('');
  const { mutate: generate, isPending } = useGenerateIdeas();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim()) return;
    
    generate({ context }, {
      onSuccess: () => {
        closeModal();
        // Navigation happens automatically since we're already on /ideation page
        // or the user can navigate manually
        window.location.href = '/ideation';
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl">
        <BrainCircuit className="h-5 w-5 text-primary-500 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-900">AI-Powered Ideation</p>
          <p className="text-xs text-gray-500 mt-1">
            Describe your situation and our AI will generate strategic pivot and growth ideas tailored to your startup.
          </p>
        </div>
      </div>

      {/* Context Input */}
      <div>
        <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
          Describe your startup situation
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={4}
          className="w-full p-4 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors resize-none"
          placeholder="e.g., 'We are a B2C subscription app for dog walkers with 100 paying users, but growth has stalled and our runway is 4 months...'"
        />
        <p className="text-xs text-gray-400 mt-1">
          Include details about your product, market, challenges, and goals for best results.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={closeModal} 
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending || !context.trim()}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Ideas
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
