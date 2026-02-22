import { useState } from 'react';
import { useGenerateIdeas } from '@/hooks/useIdeation';
import { IdeaCard } from '@/components/shared/IdeaCard';
import { Button } from '@/components/ui/Button';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function IdeationPage() {
  const [context, setContext] = useState('');
  const { mutate: generate, data: ideas, isPending, isError, isSuccess } = useGenerateIdeas();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim()) return;
    generate({ context });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 mb-4">
          <BrainCircuit className="h-7 w-7 text-primary-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI Ideation Engine</h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Discover your next strategic move. Describe your current situation to generate AI-powered pivot and growth ideas.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe your startup situation
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={4}
          className="w-full p-4 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors resize-none"
          placeholder="e.g., 'We are a B2C subscription app for dog walkers with 100 paying users, but growth has stalled...'"
        />
        <div className="mt-4 flex justify-end">
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

      {/* Loading State */}
      <AnimatePresence>
        {isPending && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex items-center justify-center gap-3 text-gray-500 py-8"
          >
            <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
            <span>AI is thinking... this can take a moment.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {isError && (
        <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-xl text-center">
          An error occurred while generating ideas. Please try again.
        </div>
      )}

      {/* Results */}
      {isSuccess && ideas && (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
        >
          {ideas.map(idea => (
            <motion.div key={idea.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <IdeaCard idea={idea} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
