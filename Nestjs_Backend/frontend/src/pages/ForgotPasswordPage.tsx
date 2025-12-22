import React, { useState } from 'react';
import { FaSpinner } from 'react-icons/fa6';
import { requestPasswordReset } from '../api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await requestPasswordReset(email);
      setSuccessMessage("If an account with that email exists, we've sent instructions to reset your password.");
    } catch (err: any) {
      // In our mock, this won't happen, but it's good practice for a real app
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <a href="/"><img className="mx-auto h-10 w-auto" src="/Wiggle Logo.png" alt="EAsyPost Logo" /></a>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          No problem. Enter your email address below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {successMessage ? (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">
                  Email address
                </label>
                <div className="mt-2">
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-md border-0 py-2.5 text-gray-900 dark:bg-gray-700 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-[#3C48F6]" />
                </div>
              </div>
              {error && (<p className="text-sm font-medium text-red-600">{error}</p>)}
              <div>
                <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-[#3C48F6] px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50">
                  {isLoading ? <FaSpinner className="animate-spin h-5 w-5" /> : 'Send reset instructions'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Remembered it?</span></div>
            </div>
            <div className="mt-6 text-center">
              <a href="/login" className="font-semibold text-[#3C48F6] hover:text-blue-500">
                Back to log in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;