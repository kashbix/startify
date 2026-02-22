import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redirects to login page when not authenticated', async () => {
    render(<App />);
    
    // Should show login page when not authenticated
    const loginHeading = await screen.findByRole('heading', { name: /Welcome Back/i }, { timeout: 3000 });
    expect(loginHeading).toBeInTheDocument();
    
    // Should show the Strata-AI branding
    expect(screen.getByText('Strata-AI')).toBeInTheDocument();
    
    // Should have email and password inputs
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Should have login button (now says "Sign In")
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
