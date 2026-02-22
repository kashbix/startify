import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RoadmapDetailPage } from './RoadmapDetailPage';
import * as RoadmapHooks from '@/hooks/useRoadmaps';
import type { Roadmap } from '@/types/roadmap.types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Mock the useParams hook from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'rdmp_1' }),
  };
});

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
);

describe('RoadmapDetailPage', () => {
  it('displays roadmap details after loading', async () => {
    const mockRoadmap: Roadmap = {
      id: 'rdmp_1',
      title: 'Detailed Test Roadmap',
      totalDurationWeeks: 4,
      progress: 100,
      phases: [
        { id: 'p1', phaseNumber: 1, name: 'Discovery', description: 'Phase 1 desc', durationWeeks: 2, tasks: [{ id: 't1', title: 'First Task', isCompleted: true }] },
      ],
    };

    // Spy on and mock the return value of our custom hook
    vi.spyOn(RoadmapHooks, 'useRoadmap').mockReturnValue({
      data: mockRoadmap,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof RoadmapHooks.useRoadmap>);

    render(<RoadmapDetailPage />, { wrapper });

    // Use `waitFor` to ensure all state updates from the hook have been processed
    await waitFor(() => {
      expect(screen.getByText('Detailed Test Roadmap')).toBeInTheDocument();
      // Phase name is now shown without "Phase X:" prefix in new design
      expect(screen.getByText('Discovery')).toBeInTheDocument();
      expect(screen.getByText('First Task')).toBeInTheDocument();
    });
  });

  it('shows a loading spinner while fetching data', () => {
     vi.spyOn(RoadmapHooks, 'useRoadmap').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof RoadmapHooks.useRoadmap>);

    render(<RoadmapDetailPage />, { wrapper });
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
