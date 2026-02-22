import { useMutation } from '@tanstack/react-query';
import { generateIdeas } from '@/services/ai.service';
import type { GenerateIdeasInput } from '@/types/ideation.types';

export const useGenerateIdeas = () => {
  return useMutation({
    mutationFn: (input: GenerateIdeasInput) => generateIdeas(input),
  });
};

