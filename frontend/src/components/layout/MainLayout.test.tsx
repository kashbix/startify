import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './MainLayout';

describe('MainLayout', () => {
  it('renders its child content via the Outlet', () => {
    const TestChild = () => <div>My Test Content</div>;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<TestChild />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('My Test Content')).toBeInTheDocument();
  });
});
