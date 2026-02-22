import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RoadmapCard } from './RoadmapCard';
import type { Roadmap } from '@/types/roadmap.types';

describe('RoadmapCard', () => {
  it('renders roadmap details correctly', () => {
    const mockRoadmap: Roadmap = {
      id: 'rdmp_1',
      title: 'Test Roadmap',
      totalDurationWeeks: 12,
      progress: 50,
      phases: [],
    };

    render(
      <MemoryRouter>
        <RoadmapCard roadmap={mockRoadmap} />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Roadmap')).toBeInTheDocument();
    expect(screen.getByText(/12 weeks/i)).toBeInTheDocument();
    // Progress is now shown as just "50%" in the new design
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
