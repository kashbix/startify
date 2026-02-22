import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateScenario } from '@/hooks/useScenarios';
import { Button } from '@/components/ui/Button';
import { useUiStore } from '@/stores/ui.store';
import { useEffect } from 'react';
import { FileText, Tag, TrendingUp, TrendingDown } from 'lucide-react';

const scenarioSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['hire', 'cut_expense', 'pricing', 'investment', 'custom']),
  modifications: z.object({
    expenseChange: z.number(),
    revenueChange: z.number(),
    oneTimeCashChange: z.number(),
    description: z.string().optional(),
  }),
});

type ScenarioFormData = z.infer<typeof scenarioSchema>;

export function ScenarioForm() {
  const { closeModal } = useUiStore();
  const createScenarioMutation = useCreateScenario();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScenarioFormData>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: {
      type: 'custom',
      name: '',
      modifications: {
        expenseChange: 0,
        revenueChange: 0,
        oneTimeCashChange: 0,
        description: '',
      },
    },
  });

  const onSubmit = (data: ScenarioFormData) => {
    createScenarioMutation.mutate(data);
  };

  useEffect(() => {
    if (createScenarioMutation.isSuccess) {
      reset();
      closeModal();
    }
  }, [createScenarioMutation.isSuccess, reset, closeModal]);

  const inputClasses = "block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Scenario Name */}
      <div>
        <label htmlFor="name" className={labelClasses}>Scenario Name</label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            {...register('name')} 
            id="name" 
            placeholder="e.g., Hire 2 Engineers"
            className={`${inputClasses} pl-10`}
          />
        </div>
        {errors.name && <p className="text-danger text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className={labelClasses}>Scenario Type</label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select 
            {...register('type')} 
            id="type" 
            className={`${inputClasses} pl-10 appearance-none bg-white`}
          >
            <option value="custom">Custom</option>
            <option value="hire">Hire</option>
            <option value="cut_expense">Cut Expense</option>
            <option value="pricing">Pricing Change</option>
            <option value="investment">Investment</option>
          </select>
        </div>
      </div>

      {/* Financial Changes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expenseChange" className={labelClasses}>
            Monthly Expense Change ($)
          </label>
          <div className="relative">
            <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              {...register('modifications.expenseChange', { valueAsNumber: true })} 
              id="expenseChange" 
              type="number" 
              placeholder="e.g., 5000"
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="revenueChange" className={labelClasses}>
            Monthly Revenue Change ($)
          </label>
          <div className="relative">
            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              {...register('modifications.revenueChange', { valueAsNumber: true })} 
              id="revenueChange" 
              type="number" 
              placeholder="e.g., 10000"
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={closeModal} 
          disabled={createScenarioMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createScenarioMutation.isPending}>
          {createScenarioMutation.isPending ? 'Creating...' : 'Create Scenario'}
        </Button>
      </div>
    </form>
  );
}
