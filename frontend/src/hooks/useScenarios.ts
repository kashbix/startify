import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getScenarios, createScenario } from '@/services/scenario.service';
import type { CreateScenarioInput } from '@/types/scenario.types';

// Hook to get all scenarios
export const useScenarios = () => {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: getScenarios,
  });
};

// Hook to create a new scenario
export const useCreateScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newScenario: CreateScenarioInput) => createScenario(newScenario),
    onSuccess: () => {
      // When a new scenario is created, invalidate the 'scenarios' query
      // to automatically refetch the list.
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
    },
  });
};
