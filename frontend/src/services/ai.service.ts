import type { Idea, GenerateIdeasInput } from '@/types/ideation.types';
import { apiClient } from './api.client';

interface AISuggestion {
  title: string;
  description: string;
  impact_score: number;
  difficulty: string;
}

interface AIResponse {
  suggestions: AISuggestion[];
}

// Map difficulty to market opportunity
const difficultyToOpportunity = (difficulty: string): 'high' | 'medium' | 'low' => {
  switch (difficulty.toLowerCase()) {
    case 'low': return 'high';
    case 'medium': return 'medium';
    case 'high': return 'low';
    default: return 'medium';
  }
};

export const generateIdeas = async (input: GenerateIdeasInput): Promise<Idea[]> => {
  console.log('Generating AI ideas with input:', input);

  // Send the user's context directly to the API
  const response = await apiClient.post<AIResponse>('/ai/suggest-strategy', { 
    context: input.context 
  });

  // Check if we got valid suggestions
  if (!response.suggestions || !Array.isArray(response.suggestions)) {
    throw new Error('Invalid response from AI service');
  }

  // Transform API response to Idea format
  const ideas: Idea[] = response.suggestions.map((suggestion, index) => ({
    id: `idea_${Date.now()}_${index}`,
    title: suggestion.title,
    description: suggestion.description,
    feasibility: suggestion.impact_score,
    marketOpportunity: difficultyToOpportunity(suggestion.difficulty),
  }));

  console.log('AI ideas generated:', ideas.length);
  return ideas;
};
