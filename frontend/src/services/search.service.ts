import { apiClient } from './api.client';
import type { SearchResult } from '@/types/search.types';
import type { Scenario } from '@/types/scenario.types';
import type { Roadmap } from '@/types/roadmap.types';

// Perform global search across all entities
export const performSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Search scenarios
  try {
    const scenariosResponse = await apiClient.get<{ scenarios: Scenario[] }>('/scenarios');
    const scenarios = scenariosResponse.scenarios || [];
    
    scenarios.forEach((scenario) => {
      if (
        scenario.name.toLowerCase().includes(searchTerm) ||
        scenario.type.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: scenario.id,
          type: 'scenario',
          title: scenario.name,
          description: `${scenario.type} scenario • ${scenario.result.runwayDelta >= 0 ? '+' : ''}${scenario.result.runwayDelta.toFixed(1)} months runway`,
          link: `/scenarios/${scenario.id}`,
        });
      }
    });
  } catch {
    // Scenarios API not available, skip
  }

  // Search roadmaps
  try {
    const roadmapsResponse = await apiClient.get<{ roadmaps: Roadmap[] }>('/roadmaps');
    const roadmaps = roadmapsResponse.roadmaps || [];
    
    roadmaps.forEach((roadmap) => {
      if (
        roadmap.title.toLowerCase().includes(searchTerm) ||
        roadmap.description?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: roadmap.id,
          type: 'roadmap',
          title: roadmap.title,
          description: roadmap.description || `${roadmap.milestones?.length || 0} milestones`,
          link: `/roadmaps/${roadmap.id}`,
        });
      }
    });
  } catch {
    // Roadmaps API not available, skip
  }

  // Add static report results if query matches
  const reportKeywords = ['report', 'export', 'csv', 'monthly', 'cash flow', 'expense', 'runway', 'revenue', 'investor'];
  if (reportKeywords.some(keyword => keyword.includes(searchTerm) || searchTerm.includes(keyword))) {
    results.push({
      id: 'reports',
      type: 'report',
      title: 'Financial Reports',
      description: 'Generate and download CSV reports',
      link: '/',
    });
  }

  // Add navigation suggestions based on query
  const pageMatches: Record<string, { title: string; description: string; link: string }> = {
    'dashboard': { title: 'Dashboard', description: 'View your startup metrics and insights', link: '/' },
    'scenario': { title: 'Scenarios', description: 'Test financial impact of business decisions', link: '/scenarios' },
    'idea': { title: 'Ideation', description: 'AI-powered pivot and growth ideas', link: '/ideation' },
    'roadmap': { title: 'Roadmaps', description: 'Execute your strategies with actionable plans', link: '/roadmaps' },
    'setting': { title: 'Settings', description: 'Manage your account and preferences', link: '/settings' },
    'import': { title: 'Import Data', description: 'Upload financial data in Settings', link: '/settings' },
    'password': { title: 'Security Settings', description: 'Change your password', link: '/settings' },
  };

  Object.entries(pageMatches).forEach(([keyword, page]) => {
    if (keyword.includes(searchTerm) || searchTerm.includes(keyword)) {
      // Avoid duplicates
      if (!results.some(r => r.link === page.link && r.title === page.title)) {
        results.push({
          id: `page-${keyword}`,
          type: 'scenario', // Using scenario as generic type for pages
          title: page.title,
          description: page.description,
          link: page.link,
        });
      }
    }
  });

  return results;
};

// Debounced search helper
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export const debouncedSearch = (
  query: string,
  callback: (results: SearchResult[]) => void,
  delay: number = 300
): void => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    const results = await performSearch(query);
    callback(results);
  }, delay);
};
