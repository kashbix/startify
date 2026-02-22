export type SearchResultType = 'scenario' | 'idea' | 'roadmap' | 'report';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  link: string;
  icon?: string;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  isOpen: boolean;
}
