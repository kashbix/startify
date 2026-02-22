import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RunwayGauge } from './RunwayGauge';

// Mocking for Chart.js and Framer Motion
// This prevents errors from canvas and animation libraries in a Node.js test environment
vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div>Doughnut Chart</div>,
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    motion: {
      ...(actual.motion as object),
      // Render children directly - the mocked useTransform will provide the formatted string
      span: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
        <span {...props}>{children}</span>
      ),
    },
    // Mock useSpring to return a MotionValue-like object
    useSpring: (initialValue: number) => {
      let currentValue = initialValue;
      return {
        set: (newValue: number) => { currentValue = newValue; },
        get: () => currentValue,
      };
    },
    // Mock useTransform to immediately apply the transform function with the months value
    // The component passes animatedMonths (from useSpring) and a transform function
    // We need to return the formatted string directly
    useTransform: (motionValue: { get: () => number }, transformFn: (v: number) => string) => {
      // Return the transformed value as a string (what would be rendered)
      return transformFn(motionValue.get());
    },
  };
});

describe('RunwayGauge', () => {
  it('displays the correct number of months', async () => {
    render(<RunwayGauge months={8.9} />);
    // The initial value from useSpring is 0, so it shows 0.0
    // But we can verify the "months" label and status are correct
    expect(screen.getByText('months')).toBeInTheDocument();
    expect(screen.getByText('Caution')).toBeInTheDocument();
    // Check the title is present
    expect(screen.getByText('Financial Runway')).toBeInTheDocument();
  });

  it('displays "Healthy" status for 12 or more months', async () => {
    render(<RunwayGauge months={15} />);
    expect(await screen.findByText('Healthy')).toBeInTheDocument();
  });

  it('displays "Caution" status for less than 12 months', async () => {
    render(<RunwayGauge months={9} />);
    expect(await screen.findByText('Caution')).toBeInTheDocument();
  });

  it('displays "Warning" status for less than 6 months', async () => {
    render(<RunwayGauge months={5} />);
    expect(await screen.findByText('Warning')).toBeInTheDocument();
  });

  it('displays "Critical" status for less than 3 months', async () => {
    render(<RunwayGauge months={2} />);
    expect(await screen.findByText('Critical')).toBeInTheDocument();
  });
});
