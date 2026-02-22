export interface Idea {
  id: string;
  title: string;
  description: string;
  feasibility: number; // Score out of 10
  marketOpportunity: 'low' | 'medium' | 'high';
}

export interface GenerateIdeasInput {
  context?: string;
  constraints?: string[];
  businessContext?: string;
  challenges?: string;
  goals?: string;
}
