import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Login Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Default mock for successful login
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'mock-token', user: { id: '1', firstName: 'John' } }),
    });
  });

  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should login with valid credentials and redirect', async () => {
    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error on invalid credentials', async () => {
    // Mock failed login
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it.skip('should handle Google OAuth button', () => {
    render(<LoginPage />);
    
    // We target the button by its text or role. Google button has FcGoogle icon and "Google" text.
    const googleButton = screen.getByRole('button', { name: /Google/i });
    fireEvent.click(googleButton);
    
    expect(window.location.href).toContain('/auth/google');
  });
});
