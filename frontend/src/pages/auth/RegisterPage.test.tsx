import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import * as AuthService from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

// Mock the auth service
const registerSpy = vi.spyOn(AuthService, 'register');

// Mock the auth store
const mockLogin = vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

describe('RegisterPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({ login: mockLogin, user: null, token: null, isAuthenticated: false });
  });

  it('renders all form fields and the submit button', () => {
    render(<RegisterPage />, { wrapper });
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    render(<RegisterPage />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('calls the register service and redirects to onboarding on successful submission', async () => {
    registerSpy.mockResolvedValue({
      user: { id: 'user_456', fullName: 'Test User', email: 'test@example.com', onboardingCompleted: false },
      token: 'new-fake-token',
    });

    render(
      <MemoryRouter initialEntries={['/register']}>
          <Routes>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={<div>Onboarding</div>} />
          </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      // Check that the service was called
      expect(registerSpy).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
      // Check that the user was logged in via the store
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: 'Test User' }),
        'new-fake-token'
      );
      // Check that redirection happened to onboarding (not dashboard)
      expect(screen.getByText('Onboarding')).toBeInTheDocument();
    });
  });
});
