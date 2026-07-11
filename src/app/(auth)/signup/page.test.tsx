import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupPage from './page';
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

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: 'John' } });
  fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'john@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'Password123' } });
};

describe('Signup Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'mock-token' }),
    });
  });

  it('should render signup form', () => {
    renderWithProviders(<SignupPage />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
  });

  it('should reject a weak password before calling the API', async () => {
    renderWithProviders(<SignupPage />);
    fillForm();
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 7 characters and contain at least one capital letter.')
      ).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should require accepting the terms', async () => {
    renderWithProviders(<SignupPage />);
    fillForm();
    // Terms checkbox intentionally left unchecked

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() => {
      expect(screen.getByText('You must agree to the terms and policy')).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should request a verification code and show the verify step', async () => {
    renderWithProviders(<SignupPage />);
    fillForm();
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/email/send-otp'),
        expect.any(Object)
      );
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument();
    });
  });

  it('should register after code verification and redirect to onboarding', async () => {
    renderWithProviders(<SignupPage />);
    fillForm();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    const codeInput = await screen.findByPlaceholderText('123456');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    // The verify step has its own form and submit button
    fireEvent.submit(codeInput.closest('form')!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/auth/register'), expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('should show error on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: 'Email already registered' }),
    });

    renderWithProviders(<SignupPage />);
    fillForm();
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });
});
