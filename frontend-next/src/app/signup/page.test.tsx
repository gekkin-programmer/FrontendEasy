import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from './page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Signup Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock successful OTP request
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'OTP sent' }),
    });
  });

  it('should render signup form', () => {
    render(<SignupPage />);
    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });

  it('should validate email format', () => {
    render(<SignupPage />);
    const emailInput = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // HTML5 validation is handled by the browser, but we can check if it's required
    expect(emailInput).toBeRequired();
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should redirect to dashboard on success', async () => {
    // 1. Render and fill form
    render(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText('First'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    // 2. Click Continue (triggers handleRequestCode)
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    
    // 3. Wait for step to change to VERIFY
    await waitFor(() => {
      expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
    });

    // 4. Fill verification code
    fireEvent.change(screen.getByPlaceholderText('123456'), { target: { value: '123456' } });
    
    // Mock successful register
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'mock-token' }),
    });

    // 5. Click Verify & Create Account
    fireEvent.click(screen.getByRole('button', { name: /Verify & Create Account/i }));

    // 6. Wait for redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('should show error on failure', async () => {
    render(<SignupPage />);
    
    // Mock failed OTP request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid email' }),
    });

    fireEvent.change(screen.getByPlaceholderText('First'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'bad@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });
});
