import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { LanguageProvider } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// The page reads the language preference from context — always render inside the provider.
const renderWithProviders = (ui: React.ReactElement) => render(<LanguageProvider>{ui}</LanguageProvider>);

describe('Login Page', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    // Default mock for successful login
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'mock-token' }),
    });
  });

  it('should render login form', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('should login with valid credentials and redirect', async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/login'), expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show a friendly error on invalid credentials', async () => {
    // Backend rejects the credentials — the UI must show the human message,
    // never the raw backend text.
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Incorrect email or password. Please check your details and try again.')
      ).toBeInTheDocument();
    });
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });

  it('should show a generic friendly error when the server is down', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(
        screen.getByText('We couldn’t sign you in right now. Please try again in a few minutes.')
      ).toBeInTheDocument();
    });
  });
});
