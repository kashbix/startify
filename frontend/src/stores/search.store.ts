import { create } from 'zustand';
import type { SearchResult } from '@/types/search.types';

interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  isOpen: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  isSearching: false,
  isOpen: false,
  
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setIsOpen: (isOpen) => set({ isOpen }),
  clearSearch: () => set({ query: '', results: [], isOpen: false }),
}));
